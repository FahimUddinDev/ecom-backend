// Verification service unit tests
import jwt from "jsonwebtoken";
import { HttpError } from "../../utils/customError";
import * as verificationModel from "./verification.model";
import * as verificationService from "./verification.service";

jest.mock("./verification.model");
jest.mock("jsonwebtoken");

const mockedModel = verificationModel as jest.Mocked<typeof verificationModel>;
const jwtSignMock = jwt.sign as unknown as jest.Mock;

describe("verification.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
  });

  describe("createVerification", () => {
    it("creates verification with 6-digit token and expiry", async () => {
      mockedModel.createVerification.mockResolvedValueOnce({
        token: "123456",
      } as any);
      const res = await verificationService.createVerification({ userId: 1 });
      expect(mockedModel.createVerification).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          expiresAt: expect.any(Date),
          user: { connect: { id: 1 } },
        })
      );
      expect(res).toEqual(expect.objectContaining({ token: "123456" }));
    });
  });

  describe("getVerify", () => {
    it("throws when no verification or token mismatch", async () => {
      mockedModel.getVerify.mockResolvedValueOnce([] as any);
      await expect(
        verificationService.getVerify({ userId: 1, code: "111111" })
      ).rejects.toEqual(new HttpError("Invalid verification code", 400));

      mockedModel.getVerify.mockResolvedValueOnce([
        { token: "222222", expiresAt: new Date(Date.now() + 10000) },
      ] as any);
      await expect(
        verificationService.getVerify({ userId: 1, code: "111111" })
      ).rejects.toEqual(new HttpError("Invalid verification code", 400));
    });

    it("throws when expired", async () => {
      mockedModel.getVerify.mockResolvedValueOnce([
        { token: "111111", expiresAt: new Date(Date.now() - 1000) },
      ] as any);
      await expect(
        verificationService.getVerify({ userId: 1, code: "111111" })
      ).rejects.toEqual(new HttpError("Verification code expired", 400));
    });

    it("updates user verified=true, deletes verification, returns updated", async () => {
      mockedModel.getVerify.mockResolvedValueOnce([
        { token: "111111", expiresAt: new Date(Date.now() + 1000) },
      ] as any);
      mockedModel.updateUser.mockResolvedValueOnce({ verified: true } as any);
      mockedModel.deleteVerification.mockResolvedValueOnce({} as any);
      const res = await verificationService.getVerify({
        userId: 5,
        code: "111111",
      });
      expect(mockedModel.updateUser).toHaveBeenCalledWith(5, {
        verified: true,
      });
      expect(mockedModel.deleteVerification).toHaveBeenCalledWith("111111");
      expect(res).toEqual(expect.objectContaining({ verified: true }));
    });

    it("throws 500 when updateUser returns falsy", async () => {
      mockedModel.getVerify.mockResolvedValueOnce([
        { token: "111111", expiresAt: new Date(Date.now() + 1000) },
      ] as any);
      mockedModel.updateUser.mockResolvedValueOnce(null as any);
      await expect(
        verificationService.getVerify({ userId: 5, code: "111111" })
      ).rejects.toEqual(new HttpError("Verification failed", 500));
    });
  });

  describe("forgotPasswordVerify", () => {
    it("throws when invalid or expired code", async () => {
      mockedModel.getVerify.mockResolvedValueOnce([] as any);
      await expect(
        verificationService.forgotPasswordVerify({ userId: 1, code: "111111" })
      ).rejects.toEqual(new HttpError("Invalid verification code", 400));

      mockedModel.getVerify.mockResolvedValueOnce([
        { token: "111111", expiresAt: new Date(Date.now() - 1000) },
      ] as any);
      await expect(
        verificationService.forgotPasswordVerify({ userId: 1, code: "111111" })
      ).rejects.toEqual(new HttpError("Verification code expired", 400));
    });

    it("returns signed jwt and deletes verification on success", async () => {
      mockedModel.getVerify.mockResolvedValueOnce([
        { token: "111111", expiresAt: new Date(Date.now() + 1000) },
      ] as any);
      jwtSignMock.mockReturnValue("resettoken");
      const res = await verificationService.forgotPasswordVerify({
        userId: 9,
        code: "111111",
      });
      expect(res.token).toBe("resettoken");
      expect(mockedModel.deleteVerification).toHaveBeenCalledWith("111111");
    });
  });

  describe("createKyc", () => {
    it("throws when KYC exists and is pending or approved", async () => {
      mockedModel.getKyc.mockResolvedValueOnce([{ status: "pending" }] as any);
      await expect(
        verificationService.createKyc({
          id: 1,
          document: "a.pdf",
          title: "Passport",
        })
      ).rejects.toEqual(
        new HttpError("KYC is already in process or approved", 400)
      );
    });

    it("throws when any KYC exists (fallback)", async () => {
      mockedModel.getKyc.mockResolvedValueOnce([{ status: "rejected" }] as any);
      await expect(
        verificationService.createKyc({
          id: 1,
          document: "a.pdf",
          title: "Passport",
        })
      ).rejects.toEqual(new HttpError("KYC already exists", 400));
    });

    it("creates new KYC when none exist", async () => {
      mockedModel.getKyc.mockResolvedValueOnce([] as any);
      mockedModel.createKyc.mockResolvedValueOnce({ id: 10 } as any);
      const res = await verificationService.createKyc({
        id: 2,
        document: "a.pdf",
        title: "Passport",
      });
      expect(mockedModel.createKyc).toHaveBeenCalledWith({
        document: "a.pdf",
        title: "passport",
        user: { connect: { id: 2 } },
      });
      expect(res).toEqual(expect.objectContaining({ id: 10 }));
    });
  });

  describe("getKycs", () => {
    it("builds where, counts and returns pagination", async () => {
      mockedModel.countKycs.mockResolvedValueOnce(2 as any);
      mockedModel.getKycs.mockResolvedValueOnce([
        { id: 1, title: "t1", status: "pending" },
        { id: 2, title: "t2", status: "approved" },
      ] as any);
      const res = await verificationService.getKycs({
        page: 1,
        limit: 2,
        orderBy: "desc",
      });
      expect(res.total).toBe(2);
      expect(res.page).toBe(1);
      expect(res.limit).toBe(2);
      expect(res.kycs.length).toBe(2);
    });
  });

  describe("getKyc", () => {
    it("delegates to model", async () => {
      mockedModel.getKyc.mockResolvedValueOnce([{ id: 1 }] as any);
      const res = await verificationService.getKyc(3);
      expect(mockedModel.getKyc).toHaveBeenCalledWith(3);
      expect(res).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 1 })])
      );
    });
  });
});
