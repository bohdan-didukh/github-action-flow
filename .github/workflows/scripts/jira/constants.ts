import { getEnv } from "../helpers";

export const JIRA_USERNAME = getEnv("JIRA_USERNAME");
export const JIRA_API_TOKEN = getEnv("JIRA_API_TOKEN");
export const JIRA_URL = "https://futurelog.atlassian.net";

export const JIRA_AUTH = {
  username: JIRA_USERNAME,
  password: JIRA_API_TOKEN,
};

export type JiraStatusName =
  | "In Progress"
  | "Code Review"
  | "Ready to deploy"
  | "Deployed to DEV";

export interface JiraTransition {
  id: string;
  name: string;
  isAvaliable: boolean;
  // there are other fields, but we don't use them
}

// todo: update transition names when the workflow is changed. Order is important.
export const JIRA_TRANSITIONS: JiraStatusName[] = [
  "In Progress",
  "Code Review",
  "Ready to deploy",
  "Deployed to DEV",
];
