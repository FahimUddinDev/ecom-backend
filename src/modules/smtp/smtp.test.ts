// SMTP service unit tests
import * as smtpModel from "./smtp.model";
import * as smtpService from "./smtp.service";

jest.mock("./smtp.model");

const mockedModel = smtpModel as jest.Mocked<typeof smtpModel>;

describe("smtp.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createSmtpService", () => {
    it("creates smtp config", async () => {
      mockedModel.createSmtp.mockResolvedValueOnce({ id: 1 } as any);
      const res = await smtpService.createSmtpService({
        host: "smtp.mail.com",
        password: "pass1234",
        encryption: "tls",
        port: 587,
        userName: "user@mail.com",
      } as any);
      expect(mockedModel.createSmtp).toHaveBeenCalledWith({
        host: "smtp.mail.com",
        password: "pass1234",
        encryption: "tls",
        port: 587,
        userName: "user@mail.com",
      });
      expect(res).toEqual(expect.objectContaining({ id: 1 }));
    });
  });

  describe("updateSmtpService", () => {
    it("updates smtp by id", async () => {
      mockedModel.updateSmtp.mockResolvedValueOnce({ id: 2, port: 465 } as any);
      const res = await smtpService.updateSmtpService(2, { port: 465 });
      expect(mockedModel.updateSmtp).toHaveBeenCalledWith(2, { port: 465 });
      expect(res).toEqual(expect.objectContaining({ id: 2 }));
    });
  });

  describe("deleteSmtpService", () => {
    it("deletes smtp by id", async () => {
      mockedModel.deleteSmtp.mockResolvedValueOnce({ id: 3 } as any);
      const res = await smtpService.deleteSmtpService(3);
      expect(mockedModel.deleteSmtp).toHaveBeenCalledWith(3);
      expect(res).toEqual(expect.objectContaining({ id: 3 }));
    });
  });

  describe("findSmtpService", () => {
    it("finds smtp by unique query", async () => {
      mockedModel.findSmtp.mockResolvedValueOnce({ id: 4 } as any);
      const res = await smtpService.findSmtpService({
        where: { id: 4 },
      } as any);
      expect(mockedModel.findSmtp).toHaveBeenCalledWith({ where: { id: 4 } });
      expect(res).toEqual(expect.objectContaining({ id: 4 }));
    });
  });

  describe("findAllSmtpService", () => {
    it("lists all smtp configs", async () => {
      mockedModel.findAllSmtp.mockResolvedValueOnce([
        { id: 1 },
        { id: 2 },
      ] as any);
      const res = await smtpService.findAllSmtpService();
      expect(res.length).toBe(2);
      expect(mockedModel.findAllSmtp).toHaveBeenCalled();
    });
  });
});
