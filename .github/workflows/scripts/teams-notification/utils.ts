import * as core from "@actions/core";

interface TeamsMention {
  name: string;
  id: string;
  /**
   * Type of the team member need for use in text with <at>{type}</at>
   */
  type: string;
}

export type TeamMember =
  | "ilchenkoArtem"
  | "nazar-futurelog"
  | "ny1am"
  | "bohdan-didukh"
  | "donni911"
  | "mc-petry"
  | "bogdan-futurelog";

const FRONT_TEAM_MENTIONS = {
  ARTEM_IlCHENKO: {
    name: "Artem Ilchenko",
    id: "artem.ilchenko@711media.de",
    type: "ArtemIlchenko",
  },
  NAZAR_YAVNYY: {
    name: "Nazar Yavnyy",
    type: "NazarYavnyy",
    id: "nazar.yavnyy@flogintra.ch",
  },
  BOHDAN_DIDUKH: {
    name: "Bogdan Didukh",
    type: "BogdanDidukh",
    id: "bohdan.didukh@flogintra.ch",
  },
  RODION_VOINAROVSKYI: {
    name: "Rodion Voinarovskyi",
    type: "RodionVoinarovskyi",
    id: "rodion.voinarovskyi@flogintra.ch",
  },
  PETRYSHYN_SERHII: {
    name: "Serhii Petryshyn",
    type: "SerhiiPetryshyn",
    id: "serhii.petryshyn@flogintra.ch",
  },
  BOGDAN_ZINCHENKO: {
    name: "Bogdan Zinchenko",
    type: "BogdanZinchenko",
    id: "bohdan.zinchenko@flogintra.ch",
  },
} satisfies Record<string, TeamsMention>;

export const getTeamsMentionByGitUser = (
  githubUserName: string[]
): TeamsMention[] => {
  const MAP = {
    "ilchenkoArtem": FRONT_TEAM_MENTIONS.ARTEM_IlCHENKO,
    "nazar-futurelog": FRONT_TEAM_MENTIONS.NAZAR_YAVNYY,
    "ny1am": FRONT_TEAM_MENTIONS.NAZAR_YAVNYY,
    "bohdan-didukh": FRONT_TEAM_MENTIONS.BOHDAN_DIDUKH,
    "donni911": FRONT_TEAM_MENTIONS.RODION_VOINAROVSKYI,
    "mc-petry": FRONT_TEAM_MENTIONS.PETRYSHYN_SERHII,
    "bogdan-futurelog": FRONT_TEAM_MENTIONS.BOGDAN_ZINCHENKO,
  };
  // return only valid mentions, if set not valid, notification will not be sent
  return githubUserName
    .filter(Boolean)
    .map((name) => {
      const mention = MAP[name];

      if (!mention) {
        core.warning(`Mention for "${name}" not found. Please update user map`);
      }

      return mention;
    })
    .filter(Boolean);
};
