import { z } from "zod";
import { Backlog } from 'backlog-js';
import { buildToolSchema, ToolDefinition } from '../types/tool.js';
import { TranslationHelper } from "../createTranslationHelper.js";
import { PullRequestSchema } from "../types/zod/backlogOutputDefinition.js";
import { resolveIdOrKey } from "../utils/resolveIdOrKey.js";

const addPullRequestSchema = buildToolSchema(t => ({
  projectId: z
    .number()
    .optional()
    .describe(
      t(
        "TOOL_ADD_PULL_REQUEST_PROJECT_ID",
        "The numeric ID of the project (e.g., 12345)"
      )
    ),
  projectKey: z
    .string()
    .optional()
    .describe(
      t(
        "TOOL_ADD_PULL_REQUEST_PROJECT_KEY",
        "The key of the project (e.g., 'PROJECT')"
      )
    ),
  repoIdOrName: z.string().describe(t("TOOL_ADD_PULL_REQUEST_REPO_ID_OR_NAME", "Repository ID or name")),
  summary: z.string().describe(t("TOOL_ADD_PULL_REQUEST_SUMMARY", "Summary of the pull request")),
  description: z.string().describe(t("TOOL_ADD_PULL_REQUEST_DESCRIPTION", "Description of the pull request")),
  base: z.string().describe(t("TOOL_ADD_PULL_REQUEST_BASE", "Base branch name")),
  branch: z.string().describe(t("TOOL_ADD_PULL_REQUEST_BRANCH", "Branch name to merge")),
  issueId: z.number().optional().describe(t("TOOL_ADD_PULL_REQUEST_ISSUE_ID", "Issue ID to link")),
  assigneeId: z.number().optional().describe(t("TOOL_ADD_PULL_REQUEST_ASSIGNEE_ID", "User ID of the assignee")),
  notifiedUserId: z.array(z.number()).optional().describe(t("TOOL_ADD_PULL_REQUEST_NOTIFIED_USER_ID", "User IDs to notify")),
}));

export const addPullRequestTool = (backlog: Backlog, { t }: TranslationHelper): ToolDefinition<ReturnType<typeof addPullRequestSchema>, typeof PullRequestSchema["shape"]> => {
  return {
    name: "add_pull_request",
    description: t("TOOL_ADD_PULL_REQUEST_DESCRIPTION", "Creates a new pull request"),
    schema: z.object(addPullRequestSchema(t)),
    outputSchema: PullRequestSchema,
    handler: async ({ projectId, projectKey, repoIdOrName, ...params }) => {
      const result = resolveIdOrKey("pullRequest", { id: projectId, key: projectKey }, t);
      if (!result.ok) {
        throw result.error;
      }
      return backlog.postPullRequest(result.value, repoIdOrName, params)}
  };
};
