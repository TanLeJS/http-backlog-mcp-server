import { jest, describe, it, expect } from '@jest/globals';
import type { Backlog } from "backlog-js";
import * as Entity from "backlog-js/dist/types/entity"; // To access Entity.Project.CustomField
import { getCustomFieldsTool } from "./getCustomFields.js";
import { createTranslationHelper } from "../createTranslationHelper.js";

describe("getCustomFieldsTool", () => {
  // Define mockBacklog with the specific method we need
  const mockBacklog: Partial<Backlog> = {
    // Specify the correct return type for the mock
    getCustomFields: jest.fn<() => Promise<Entity.Project.CustomField[]>>(),
  };

  // Use the actual createTranslationHelper for consistency
  const mockTranslationHelper = createTranslationHelper();

  // Instantiate the tool with the mocked Backlog and real TranslationHelper
  const tool = getCustomFieldsTool(mockBacklog as Backlog, mockTranslationHelper);
  const toolHandler = tool.handler; // Get the handler from the instantiated tool

  it("should return custom fields for a valid project ID", async () => {
    const mockCustomFieldsData: Entity.Project.CustomField[] = [
      { id: 1, projectId: 1, typeId: 1, name: "CF1", description: "", required: false, applicableIssueTypes: [] } as Entity.Project.CustomField,
      { id: 2, projectId: 1, typeId: 2, name: "CF2", description: "Desc", required: true, applicableIssueTypes: [1] } as Entity.Project.CustomField,
    ];

    // Setup the mockResolvedValue for getCustomFields
    (mockBacklog.getCustomFields as jest.Mock<() => Promise<Entity.Project.CustomField[]>>).mockResolvedValue(mockCustomFieldsData);

    const input = { projectIdOrKey: "TEST_PROJECT" };
    const result = await toolHandler(input);

    expect(mockBacklog.getCustomFields).toHaveBeenCalledWith("TEST_PROJECT");
    expect(result).toEqual(mockCustomFieldsData);
  });

  it("should call backlog.getCustomFields with correct params when using project ID", async () => {
    (mockBacklog.getCustomFields as jest.Mock<() => Promise<Entity.Project.CustomField[]>>).mockResolvedValue([]); // Return empty for this check
    await toolHandler({ projectIdOrKey: 123 });
    expect(mockBacklog.getCustomFields).toHaveBeenCalledWith(123);
  });
  
  it("should throw an error if getCustomFields fails", async () => {
    const apiError = new Error("API error");
    (mockBacklog.getCustomFields as jest.Mock<() => Promise<Entity.Project.CustomField[]>>).mockRejectedValue(apiError);

    const input = { projectIdOrKey: "TEST_PROJECT_FAIL" };
    // Expect the handler to throw the error directly
    await expect(toolHandler(input)).rejects.toThrow(apiError);
    expect(mockBacklog.getCustomFields).toHaveBeenCalledWith("TEST_PROJECT_FAIL");
  });

  it("should throw a structured error if API returns structured error", async () => {
    const structuredError = {
      message: "Structured error from API", // This is the top-level message
      errors: [{ message: "Invalid request detail", code: 6, moreInfo: "Some info" }],
    };
    (mockBacklog.getCustomFields as jest.Mock<() => Promise<Entity.Project.CustomField[]>>).mockRejectedValue(structuredError);

    const input = { projectIdOrKey: "TEST_PROJECT_STRUCTURED_ERROR" };
    // Expect the handler to throw the structured error directly
    await expect(toolHandler(input)).rejects.toEqual(structuredError);
    expect(mockBacklog.getCustomFields).toHaveBeenCalledWith("TEST_PROJECT_STRUCTURED_ERROR");
  });
});
