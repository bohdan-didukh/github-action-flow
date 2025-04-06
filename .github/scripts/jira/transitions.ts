import axios from "axios";

import {
  JIRA_AUTH,
  JIRA_TRANSITIONS,
  JIRA_URL,
  JiraStatusName,
  JiraTransition,
} from "./constants";
import { getIssueStatus } from "./get-issue-status";

export const canUpdateStatus = async (
  issueKey: string,
  nextName: JiraStatusName
): Promise<boolean> => {
  const currentName = await getIssueStatus(issueKey);

  const currentIndex = JIRA_TRANSITIONS.findIndex(
    (name) => name === currentName
  );

  const nextIndex = JIRA_TRANSITIONS.findIndex((name) => name === nextName);
  return nextIndex === currentIndex + 1;
};

export const getTransitionsUrl = (issueKey: string): string => {
  return `${JIRA_URL}/rest/api/3/issue/${issueKey}/transitions`;
};

export const getTransitions = (issueKey: string) =>
  axios.get(getTransitionsUrl(issueKey), {
    auth: JIRA_AUTH,
  });

export const updateTransition = async (
  issueKey: string,
  name: JiraStatusName
): Promise<void> => {
  try {
    const transitions = (await getTransitions(issueKey)).data
      .transitions as JiraTransition[];

    if (!(await canUpdateStatus(issueKey, name))) {
      return Promise.reject(
        `Jira issue **${issueKey}**: could not be moved to **${name}** status. The current status is not compatible with the next one`
      );
    }

    const transition = transitions.find(
      (transition) => transition.name === name
    );

    if (!transition) {
      return Promise.reject(
        `Jira issue **${issueKey}**: transition status **${name}** not found`
      );
    }

    if (transition.isAvaliable === false) {
      return Promise.reject(
        `Jira issue **${issueKey}**: transition **${name}** is not possible`
      );
    }

    await axios.post(
      getTransitionsUrl(issueKey),
      {
        transition: {
          id: transition.id,
        },
      },
      {
        auth: JIRA_AUTH,
      }
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.log("error data:", error.response?.data);
      return Promise.reject(
        `Error updating Jira issue **${issueKey}**: ${error.response?.data?.errorMessages}`
      );
    }

    console.log("error is:", error);
    return Promise.reject(
      `Error updating Jira issue **${issueKey}**: see log for details`
    );
  }
};
