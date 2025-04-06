export type AdaptiveCardBodyItem = Record<string, any>;
export type AdaptiveCardAction = Record<string, any>;

export type AdaptiveCardTeamMention = {
  /**
   * This name will be used in the message
   */
  name: string;
  /**
   * Should be user `id` or `email` in **teams app**
   */
  id: string;
  /**
   * Type of the team member need for use in text with <at>{type}</at>
   */
  type: string;
};

export type CardType = "ERROR" | "INFO" | "WARNING" | "SUCCESS";

export interface CreateModel {
  title: string;
  type: CardType;
  /**
   * Set GitHub user logins to mention them in the message
   */
  mentionList?: AdaptiveCardTeamMention[];
  body?: string | AdaptiveCardBodyItem[];
  actions?: AdaptiveCardAction[];
}

export interface CreateRootModel {
  body: AdaptiveCardBodyItem[];
  actions?: AdaptiveCardAction[];
  mentionList?: AdaptiveCardTeamMention[];
}
