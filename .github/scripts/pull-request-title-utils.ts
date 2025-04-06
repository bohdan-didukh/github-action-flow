export const FLOW_TYPES = ["feat", "chore"];
const FLOW_TYPES_OR_TEMPLATE = FLOW_TYPES.join("|");
const PR_TITLE_PATTERN = new RegExp(`^(${FLOW_TYPES_OR_TEMPLATE}):(.*)$`);
const PR_TITLE_PATTERN_WITH_TASKS = new RegExp(
  `^(${FLOW_TYPES_OR_TEMPLATE})\\((FL-\\d.*)\\):(.*)`
);

export const isValidPullRequestTitle = (title: string) => {
  return (
    PR_TITLE_PATTERN.test(title) || PR_TITLE_PATTERN_WITH_TASKS.test(title)
  );
};

/**
 * Use only after checking if the title is valid
 */
export const getTaskNumbers = (prTitle: string) => {
  return (prTitle.match(/FL-\d{4,}/gi) || []).map((taskNumber: string) =>
    taskNumber.toUpperCase()
  );
};
