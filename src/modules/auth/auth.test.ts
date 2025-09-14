// Auth service unit tests
import bcrypt from "bcrypt";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import { HttpError } from "../../utils/customError";
import { sendPasswordMail } from "../../utils/sendMail";
import * as authModel from "./auth.model";
import * as authService from "./auth.service";

jest.mock("./auth.model");
jest.mock("bcrypt", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
    compare: jest.fn(),
  },
  hash: jest.fn(),
  compare: jest.fn(),
}));
jest.mock("jsonwebtoken");
jest.mock("google-auth-library", () => {
  const verifyIdToken = jest.fn().mockResolvedValue({
    getPayload: () => ({ email: "g@a.com", given_name: "G", picture: "p" }),
  });
  return {
    OAuth2Client: jest.fn().mockImplementation(() => ({ verifyIdToken })),
  };
});
jest.mock("../../utils/sendMail", () => ({
  sendPasswordMail: jest.fn(),
}));

const mockedAuthModel = authModel as jest.Mocked<typeof authModel>;

// Use simple jest.Mock casts to avoid TS overload typing issues
const bcryptHashMock = (bcrypt as any).hash as jest.Mock;
const bcryptCompareMock = (bcrypt as any).compare as jest.Mock;
const jwtSignMock = jwt.sign as unknown as jest.Mock;

const MockedOAuth2Client = OAuth2Client as unknown as jest.Mocked<
  typeof OAuth2Client
>;

describe("auth.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    process.env.GOOGLE_CLIENT_ID = "google-client-id";
  });

  describe("registerUser", () => {
    it("throws 409 if email already exists", async () => {
      mockedAuthModel.findUser.mockResolvedValueOnce({ id: 1 } as any);
      await expect(
        authService.registerUser({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          password: "secret",
          role: "user",
          avatar: undefined as any,
          verified: false,
        } as any)
      ).rejects.toEqual(new HttpError("Email already exist!", 409));
    });

    it("creates user with hashed password and normalized names and avatar logic", async () => {
      mockedAuthModel.findUser.mockResolvedValueOnce(null);
      bcryptHashMock.mockResolvedValueOnce("hashed-secret");
      mockedAuthModel.createUser.mockResolvedValueOnce({ id: 2 } as any);
      await authService.registerUser({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "secret",
        role: "user",
        avatar: "avatar.png",
        verified: undefined as any,
      } as any);
      expect(bcryptHashMock).toHaveBeenCalledWith("secret", 10);
      expect(mockedAuthModel.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "john",
          lastName: "doe",
          avatar: "/public/avatar.png",
          status: "active",
          verified: false,
        })
      );
    });
  });

  describe("loginUser", () => {
    it("throws 404 when user not found", async () => {
      mockedAuthModel.findUser.mockResolvedValueOnce(null as any);
      await expect(
        authService.loginUser({
          email: "a@a.com",
          password: "x",
          isRemember: false,
        })
      ).rejects.toEqual(new HttpError("Email or password is wrong!", 404));
    });

    it("throws 403 when user not active", async () => {
      mockedAuthModel.findUser.mockResolvedValueOnce({
        status: "pending",
        verified: true,
      } as any);
      await expect(
        authService.loginUser({
          email: "a@a.com",
          password: "x",
          isRemember: false,
        })
      ).rejects.toEqual(new HttpError("Your are not eligible.", 403));
    });

    it("throws 403 when user not verified", async () => {
      mockedAuthModel.findUser.mockResolvedValueOnce({
        status: "active",
        verified: false,
      } as any);
      await expect(
        authService.loginUser({
          email: "a@a.com",
          password: "x",
          isRemember: false,
        })
      ).rejects.toEqual(new HttpError("Your account is not verified.", 403));
    });

    it("throws 401 when password mismatch", async () => {
      mockedAuthModel.findUser.mockResolvedValueOnce({
        status: "active",
        verified: true,
        password: "p",
      } as any);
      bcryptCompareMock.mockResolvedValueOnce(false);
      await expect(
        authService.loginUser({
          email: "a@a.com",
          password: "x",
          isRemember: false,
        })
      ).rejects.toEqual(new HttpError("Email or password is wrong!", 401));
    });

    it("returns token and user info on success", async () => {
      const user = {
        id: 1,
        email: "a@a.com",
        role: "user",
        status: "active",
        verified: true,
        password: "hashed",
        firstName: "A",
        lastName: "B",
        createdAt: new Date(),
        avatar: null,
        kyc: { status: "false" },
      };
      mockedAuthModel.findUser.mockResolvedValueOnce(user as any);
      bcryptCompareMock.mockResolvedValueOnce(true);
      jwtSignMock.mockReturnValue("token123");
      const res = await authService.loginUser({
        email: "a@a.com",
        password: "x",
        isRemember: true,
      });
      expect(res.token).toBe("token123");
      expect(res.email).toBe("a@a.com");
    });
  });

  describe("verifyGoogleToken", () => {
    it("returns payload from google client", async () => {
      const payload = await authService.verifyGoogleToken("token");
      expect(payload?.email).toBe("g@a.com");
    });
  });

  describe("googleLoginUser", () => {
    it("throws 400 on invalid payload", async () => {
      await expect(
        authService.googleLoginUser({ email: "", given_name: "" } as any)
      ).rejects.toEqual(new HttpError("Invalid payload!", 400));
    });

    it("suspends when existing user not active", async () => {
      mockedAuthModel.findUser.mockResolvedValueOnce({
        status: "pending",
      } as any);
      await expect(
        authService.googleLoginUser({
          email: "x@x.com",
          given_name: "X",
        } as any)
      ).rejects.toEqual(new HttpError("Your account has been suspended.", 403));
    });

    it("creates new user and sends password email when no existing user", async () => {
      mockedAuthModel.findUser.mockResolvedValueOnce(null as any);
      mockedAuthModel.createUser.mockResolvedValueOnce({
        id: 10,
        email: "n@n.com",
        firstName: "New",
      } as any);
      jwtSignMock.mockReturnValue("tok");
      mockedAuthModel.findEmailTemplate.mockResolvedValueOnce({
        name: "newPassword",
        subject: "s",
        body: "b",
      } as any);
      await authService.googleLoginUser({
        email: "n@n.com",
        given_name: "New",
        picture: "pic",
      } as any);
      expect(sendPasswordMail).toHaveBeenCalled();
    });

    it("returns token and user info for existing active user", async () => {
      mockedAuthModel.findUser.mockResolvedValueOnce({
        id: 2,
        email: "e@e.com",
        firstName: "E",
        role: "user",
        status: "active",
        verified: true,
      } as any);
      jwtSignMock.mockReturnValue("tok2");
      const res = await authService.googleLoginUser({
        email: "e@e.com",
        given_name: "E",
      } as any);
      expect(res.token).toBe("tok2");
      expect(res.email).toBe("e@e.com");
    });
  });

  describe("resetPassword", () => {
    it("hashes new password and updates", async () => {
      bcryptHashMock.mockResolvedValueOnce("hashed");
      mockedAuthModel.resetPassword.mockResolvedValueOnce({ id: 3 } as any);
      await authService.resetPassword(3, "newpass");
      expect(bcryptHashMock).toHaveBeenCalledWith("newpass", 10);
      expect(mockedAuthModel.resetPassword).toHaveBeenCalledWith(3, "hashed");
    });
  });
});
