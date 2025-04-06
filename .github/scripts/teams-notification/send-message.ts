import * as core from "@actions/core";
import { exitWithError } from "../helpers";

interface SendNotificationArgs {
  webhook: string;
  message: unknown;
}

export const sendMessage = async ({
  message,
  webhook,
}: SendNotificationArgs) => {
  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "message",
        attachments: [
          {
            contentType: "application/vnd.microsoft.card.adaptive",
            content: message,
          },
        ],
      }),
    });

    if (!response.ok) {
      exitWithError(
        "Error sending notification to Teams: " + response.statusText
      );
    }

    core.notice("Notification sent to Teams");
  } catch (error) {
    exitWithError("Error sending notification to Teams: " + error);
  }
};
