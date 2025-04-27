import * as github from "@actions/github";
import { getEnv, getOctokit } from "../helpers";
import { createMessage, sendMessage } from "../teams-notification";
import { getTeamsMentionByGitUser } from "../teams-notification/utils";
import {
  getTaskNumbers,
  isValidPullRequestTitle,
} from "../pull-request-title-utils";
import { JIRA_URL, JiraStatusName } from "./constants";
import { updateTransition } from "./transitions";

const webhook = getEnv("TEAMS_WEBHOOK_URL");
const JIRA_STATUS = getEnv("JIRA_STATUS") as JiraStatusName;

const { pull_request, workflow_run } = github.context.payload;

const octokit = getOctokit();

let prNumber: number | undefined;

if (pull_request) {
  prNumber = pull_request.number;
} else if (workflow_run) {
  const pr = workflow_run?.pull_requests?.find(
    ({ base }) => base.ref === "main"
  );
  prNumber = pr?.number;
}

if (!prNumber) {
  throw new Error("Pull request number not found");
}

const { data: currentPr } = await octokit.rest.pulls.get({
  owner: github.context.repo.owner,
  repo: github.context.repo.repo,
  pull_number: prNumber,
});

if (!currentPr) {
  throw new Error("Pull request not found");
}

const title = currentPr.title;

if (isValidPullRequestTitle(title)) {
  const issues = getTaskNumbers(title);
  const response = await Promise.allSettled(
    issues.map((issueKey) => updateTransition(issueKey, JIRA_STATUS))
  );
  const rejectedIssues = response
    .filter((res) => res.status === "rejected")
    .map((res) => res.reason);

  if (rejectedIssues.length > 0 && currentPr) {
    await sendMessage({
      message: createMessage({
        title: "Update Jira issue status error",
        type: "ERROR",
        body: `${rejectedIssues.join("\n")}`,
        mentionList: getTeamsMentionByGitUser([currentPr.user?.login]),
        actions: [
          {
            type: "Action.OpenUrl",
            title: "Pull Request",
            url: `${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}/pull/${currentPr.number}`,
          },
          {
            type: "Action.OpenUrl",
            title: "Action Details",
            url: `${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}/actions/runs/${github.context.runId}`,
          },
          ...rejectedIssues.map((issueError) => {
            const issue = issues.find((key) => issueError.includes(key));

            return {
              type: "Action.OpenUrl",
              title: `Jira Issue: ${issue}`,
              url: `${JIRA_URL}/browse/${issue}`,
            };
          }),
        ],
      }),
      webhook,
    });

    throw new Error(rejectedIssues.join("\n"));
  }
}
