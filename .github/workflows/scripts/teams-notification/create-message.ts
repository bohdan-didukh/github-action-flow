import * as core from "@actions/core";
import type {
  AdaptiveCardBodyItem,
  AdaptiveCardTeamMention,
  CardType,
  CreateModel,
  CreateRootModel,
} from "./types";

class MessageFactory {
  private getCardRoot = ({ actions, mentionList, body }: CreateRootModel) => {
    const cardMsteams = this.getCardMsteams(mentionList);

    return {
      type: "AdaptiveCard",
      version: "1.4",
      body: [
        ...body,
        {
          type: "ActionSet",
          separator: true,
          actions,
          spacing: "medium",
        },
      ],
      ...(cardMsteams && { msteams: cardMsteams }),
    };
  };

  private getStatusColorByType = (type: CardType) => {
    const mainColorByType = {
      ERROR: "attention",
      INFO: "default",
      WARNING: "warning",
      SUCCESS: "good",
    } satisfies Record<CardType, string>;
    const color = mainColorByType[type];

    if (!color) {
      core.warning(`Unknown card type: ${type}. Using default color`);
    }

    return color || mainColorByType.INFO;
  };

  private getCardHeader = (
    title: string,
    type: CardType
  ): AdaptiveCardBodyItem[] => {
    return [
      {
        type: "TextBlock",
        spacing: "none",
        text: title,
        weight: "bolder",
        wrap: true,
        size: "large",
        color: this.getStatusColorByType(type),
      },
    ];
  };

  private getSimpleBodyMessage = (message: string): AdaptiveCardBodyItem => {
    return {
      type: "TextBlock",
      spacing: "medium",
      text: message,
      wrap: true,
      separator: true,
    };
  };

  private getCardBody = (
    body?: string | AdaptiveCardBodyItem[]
  ): AdaptiveCardBodyItem[] => {
    if (typeof body === "string") {
      return [this.getSimpleBodyMessage(body)];
    }

    if (!body) {
      return [];
    }

    return body;
  };

  private getAssignedTo = (
    mention?: AdaptiveCardTeamMention[]
  ): AdaptiveCardBodyItem[] => {
    if (!mention || !mention.length) {
      return [];
    }

    return [
      {
        type: "TextBlock",
        text: `@: ${mention.map(({ type }) => `<at>${type}</at>`).join(", ")}`,
        wrap: true,
        spacing: "none",
        size: "small",
        color: "light",
      },
    ];
  };

  public getCardMsteams = (mention: AdaptiveCardTeamMention[] | undefined) => {
    if (!mention || !mention.length) {
      return null;
    }

    return {
      entities: mention.map(({ name, id, type }) => ({
        type: "mention",
        text: `<at>${type}</at>`,
        mentioned: {
          id,
          name,
        },
      })),
    };
  };

  public create = ({
    title,
    type = "INFO",
    body,
    actions,
    mentionList,
  }: CreateModel) => {
    const cardHeader = this.getCardHeader(title, type);
    const cardBody = this.getCardBody(body);
    const cardAssignedTo = this.getAssignedTo(mentionList);

    return this.getCardRoot({
      body: [...cardHeader, ...cardAssignedTo, ...cardBody],
      mentionList,
      actions,
    });
  };
}

export const createMessage = new MessageFactory().create;
