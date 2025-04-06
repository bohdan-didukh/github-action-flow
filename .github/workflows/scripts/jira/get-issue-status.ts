import axios from "axios";
import { JIRA_URL, JIRA_AUTH } from "./constants";

export async function getIssueStatus(issueId: string): Promise<string> {
  try {
    const response = await axios.get(
      `${JIRA_URL}/rest/api/2/issue/${issueId}`,
      {
        auth: JIRA_AUTH,
      }
    );

    return response.data.fields.status.name;
  } catch (error) {
    console.error("Error fetching issue status:", error);
    throw error;
  }
}
