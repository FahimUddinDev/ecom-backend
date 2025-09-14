// EmailTemplate service unit tests
import * as emailTemplateModel from "./emailTemplate.model";
import * as emailTemplateService from "./emailTemplate.service";

jest.mock("./emailTemplate.model");

const mockedModel = emailTemplateModel as jest.Mocked<
  typeof emailTemplateModel
>;

describe("emailTemplate.service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createEmailTemplate", () => {
    it("throws if name already exists", async () => {
      mockedModel.findEmailTemplate.mockResolvedValueOnce({ id: 1 } as any);
      await expect(
        emailTemplateService.createEmailTemplate({
          name: "welcome",
          subject: "Hi",
          body: "Hello",
        } as any)
      ).rejects.toThrow('Email template with name "welcome" already exists.');
    });

    it("creates when unique", async () => {
      mockedModel.findEmailTemplate.mockResolvedValueOnce(null);
      mockedModel.createEmailTemplate.mockResolvedValueOnce({
        id: 2,
        name: "welcome",
      } as any);
      const res = await emailTemplateService.createEmailTemplate({
        name: "welcome",
        subject: "Hi",
        body: "Hello",
      } as any);
      expect(mockedModel.createEmailTemplate).toHaveBeenCalledWith({
        name: "welcome",
        subject: "Hi",
        body: "Hello",
      });
      expect(res).toEqual(expect.objectContaining({ id: 2 }));
    });
  });

  describe("findEmailTemplate", () => {
    it("finds by id (number)", async () => {
      mockedModel.findEmailTemplate.mockResolvedValueOnce({ id: 3 } as any);
      const res = await emailTemplateService.findEmailTemplate(3);
      expect(mockedModel.findEmailTemplate).toHaveBeenCalledWith({
        where: { id: 3 },
      });
      expect(res).toEqual(expect.objectContaining({ id: 3 }));
    });

    it("finds by id (numeric string)", async () => {
      mockedModel.findEmailTemplate.mockResolvedValueOnce({ id: 4 } as any);
      const res = await emailTemplateService.findEmailTemplate("4");
      expect(mockedModel.findEmailTemplate).toHaveBeenCalledWith({
        where: { id: 4 },
      });
      expect(res).toEqual(expect.objectContaining({ id: 4 }));
    });

    it("finds by name (non-numeric string)", async () => {
      mockedModel.findEmailTemplate.mockResolvedValueOnce({
        id: 5,
        name: "welcome",
      } as any);
      const res = await emailTemplateService.findEmailTemplate("welcome");
      expect(mockedModel.findEmailTemplate).toHaveBeenCalledWith({
        where: { name: "welcome" },
      });
      expect(res).toEqual(expect.objectContaining({ id: 5 }));
    });
  });

  describe("updateEmailTemplate", () => {
    it("updates and returns selection", async () => {
      mockedModel.updateEmailTemplate.mockResolvedValueOnce({
        id: 6,
        subject: "New",
      } as any);
      const res = await emailTemplateService.updateEmailTemplate(6, {
        subject: "New",
      });
      expect(mockedModel.updateEmailTemplate).toHaveBeenCalledWith(6, {
        subject: "New",
      });
      expect(res).toEqual(expect.objectContaining({ id: 6 }));
    });
  });

  describe("deleteEmailTemplate", () => {
    it("deletes by id", async () => {
      mockedModel.deleteEmailTemplate.mockResolvedValueOnce({ id: 7 } as any);
      const res = await emailTemplateService.deleteEmailTemplate(7);
      expect(mockedModel.deleteEmailTemplate).toHaveBeenCalledWith(7);
      expect(res).toEqual(expect.objectContaining({ id: 7 }));
    });
  });

  describe("findAllEmailTemplates", () => {
    it("lists all", async () => {
      mockedModel.findAllEmailTemplates.mockResolvedValueOnce([
        { id: 1, name: "a" },
        { id: 2, name: "b" },
      ] as any);
      const res = await emailTemplateService.findAllEmailTemplates();
      expect(res.length).toBe(2);
      expect(mockedModel.findAllEmailTemplates).toHaveBeenCalled();
    });
  });
});
