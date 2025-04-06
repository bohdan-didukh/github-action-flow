import * as core from "@actions/core";
import * as github from "@actions/github";
import { getEnv, getOctokit } from "../helpers";
import { createMessage, sendMessage } from "../teams-notification";
import {
  getTeamsMentionByGitUser,
  TeamMember,
} from "../teams-notification/utils";

const webhook = getEnv("TEAMS_WEBHOOK_URL");

async function handleFailure(errorMessage: string): Promise<void> {
  core.setFailed(errorMessage);
}

async function run(): Promise<void> {
  try {
    const octokit = getOctokit();
    const { pull_request: currentPr, repository } = github.context.payload;

    if (!currentPr || !repository) {
      return handleFailure(
        "Not found required data in context payload (pull_request, repository"
      );
    }


    const { data: pullRequest } = await octokit.rest.pulls.get({
      owner: repository.owner.login,
      repo: repository.name,
      pull_number: currentPr.number,
    });
      await octokit.rest.issues.addLabels({
        owner: repository.owner.login,
        repo: repository.name,
        issue_number: currentPr.number,
        labels: ["preview"],
      });

      await sendMessage({
        message: createMessage({
          title: "'preview' label was added successfully'",
          type: "SUCCESS",
          body: `${pullRequest.title}`,
          mentionList: getTeamsMentionByGitUser(requestedReviewers),
          actions: [
            {
              type: "Action.OpenUrl",
              title: "Open pull request",
              url: `${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}/pull/${currentPr.number}`,
            },
          ],
        }),
        webhook,
      });
    } else {
      console.log(
        "pull request:",
        pullRequest.mergeable_state,
        pullRequest.mergeable
      );
      console.log("requested reviewers:", requestedReviewers);
      await sendMessage({
        message: createMessage({
          title: "Could not add 'preview' label. Pull request is not mergeable",
          type: "ERROR",
          body: pullRequest.title,
          mentionList: getTeamsMentionByGitUser([currentPr.user?.login]),
          actions: [
            {
              type: "Action.OpenUrl",
              title: "View Pull Request",
              url: `${github.context.serverUrl}/${github.context.repo.owner}/${github.context.repo.repo}/pull/${currentPr.number}`,
            },
          ],
        }),
        webhook,
      });
      return handleFailure(
        "Pull request is not mergeable, please resolve conflicts"
      );
    }
    // todo: trigger notification for extra revieview
  } catch (error) {
    handleFailure(error.message);
  }
}

run();
