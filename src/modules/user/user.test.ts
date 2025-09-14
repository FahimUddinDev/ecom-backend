// User service unit tests
import bcrypt from "bcrypt";
import fs from "fs";
import { HttpError } from "../../utils/customError";
import * as userModel from "./user.model";
import * as userService from "./user.service";

jest.mock("./user.model");
jest.mock("bcrypt", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
  },
  hash: jest.fn(),
}));
jest.mock("fs");

const mockedUserModel = userModel as jest.Mocked<typeof userModel>;
const bcryptHashMock = (bcrypt as any).hash as jest.Mock;

const mockedFs = fs as unknown as jest.Mocked<typeof fs>;

describe("user.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("throws 409 if email already exists", async () => {
      mockedUserModel.findUser.mockResolvedValueOnce({} as any);
      await expect(
        userService.registerUser({
          firstName: "John",
          lastName: "Doe",
          email: "john@example.com",
          password: "secret",
          role: "user",
          avatar: undefined as any,
        } as any)
      ).rejects.toEqual(new HttpError("Email already exist!", 409));
    });

    it("creates user with hashed password and normalized names", async () => {
      mockedUserModel.findUser.mockResolvedValueOnce(null);
      bcryptHashMock.mockResolvedValueOnce("hashed-secret");
      const created = {
        id: 1,
        firstName: "john",
        lastName: "doe",
        email: "john@example.com",
        password: "hashed-secret",
        role: "user",
        status: "active",
        avatar: null,
        createdAt: new Date(),
      } as any;
      mockedUserModel.createUser.mockResolvedValueOnce(created);

      const res = await userService.registerUser({
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        password: "secret",
        role: "user",
        avatar: undefined as any,
      } as any);

      expect(bcryptHashMock).toHaveBeenCalledWith("secret", 10);
      expect(mockedUserModel.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: "john",
          lastName: "doe",
          status: "active",
          password: "hashed-secret",
        })
      );
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
      expect((res as any).kyc).toEqual({ status: "false" });
    });
  });

  describe("getUser", () => {
    it("returns user when found", async () => {
      mockedUserModel.findUser.mockResolvedValueOnce({ id: 10 } as any);
      const res = await userService.getUser({ id: 10 });
      expect(res).toEqual(expect.objectContaining({ id: 10 }));
    });

    it("throws 404 when user not found", async () => {
      mockedUserModel.findUser.mockResolvedValueOnce(null);
      await expect(userService.getUser({ id: 99 })).rejects.toEqual(
        new HttpError("User Not found!", 404)
      );
    });
  });

  describe("updateUser", () => {
    it("hashes password when provided and updates", async () => {
      bcryptHashMock.mockResolvedValueOnce("hashed-123");
      mockedUserModel.updateUser.mockResolvedValueOnce({ id: 5 } as any);
      const res = await userService.updateUser(5, { password: "abc" });
      expect(bcryptHashMock).toHaveBeenCalledWith("abc", 10);
      expect(mockedUserModel.updateUser).toHaveBeenCalledWith(5, {
        password: "hashed-123",
      });
      expect(res).toEqual(expect.objectContaining({ id: 5 }));
    });

    it("deletes old avatar file when new avatar provided", async () => {
      mockedUserModel.findUser.mockResolvedValueOnce({
        id: 7,
        avatar: "/public/old.png",
      } as any);
      // @ts-ignore - mock fs.access and fs.unlink callbacks
      mockedFs.access.mockImplementation((_, __, cb: any) => cb(null));
      // @ts-ignore
      mockedFs.unlink.mockImplementation((_, cb: any) => cb(null));
      mockedUserModel.updateUser.mockResolvedValueOnce({ id: 7 } as any);

      const res = await userService.updateUser(7, { avatar: "new.png" });
      expect(mockedUserModel.updateUser).toHaveBeenCalledWith(7, {
        avatar: "new.png",
      });
      expect(res).toEqual(expect.objectContaining({ id: 7 }));
    });
  });

  describe("deleteUser", () => {
    it("denies when role user deletes another user", async () => {
      await expect(
        userService.deleteUser({ id: 2, authId: 1, role: "user" })
      ).rejects.toEqual(new HttpError("Permission denied!", 403));
    });

    it("allows self-delete for user role", async () => {
      mockedUserModel.deleteUser.mockResolvedValueOnce({ id: 1 } as any);
      const res = await userService.deleteUser({
        id: 1,
        authId: 1,
        role: "user",
      });
      expect(mockedUserModel.deleteUser).toHaveBeenCalledWith(1);
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });

    it("allows admin to delete others", async () => {
      mockedUserModel.deleteUser.mockResolvedValueOnce({ id: 3 } as any);
      const res = await userService.deleteUser({
        id: 3,
        authId: 1,
        role: "admin",
      });
      expect(mockedUserModel.deleteUser).toHaveBeenCalledWith(3);
      expect(res).toEqual(expect.objectContaining({ id: 3 }));
    });
  });
});
