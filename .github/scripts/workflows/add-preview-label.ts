import * as core from "@actions/core";
import * as github from "@actions/github";
import { getOctokit } from "../helpers";

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

    await octokit.rest.issues.addLabels({
      owner: repository.owner.login,
      repo: repository.name,
      issue_number: currentPr.number,
      labels: ["preview"],
    });

    // todo: trigger notification for extra revieview
  } catch (error) {
    handleFailure(error.message);
  }
}

run();
