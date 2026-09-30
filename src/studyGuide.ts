import type { StoryKey } from "./plainLanguage";

/**
 * Starter questions for a Bible study group, one set per story.
 *
 * They follow the observe → interpret → apply pattern of inductive Bible
 * study, which lines up with the model's own separation of text,
 * interpretation and application. They are deliberately open and
 * text-based; study leaders should edit them freely.
 */

/** The story's shape in five plain steps, used by the Pattern and Compare views. */
export interface StoryShape {
  readonly start: string;
  readonly happens: string;
  readonly response: string;
  readonly change: string;
  readonly end: string;
}

export const SHAPE_STEPS: ReadonlyArray<[keyof StoryShape, string]> = [
  ["start", "At the start"],
  ["happens", "What happens"],
  ["response", "The response"],
  ["change", "What changes"],
  ["end", "How it ends"],
];

export interface StudyGuide {
  /** One sentence to set the scene before reading. */
  readonly intro: string;
  readonly shape: StoryShape;
  readonly observe: readonly string[];
  readonly interpret: readonly string[];
  readonly apply: readonly string[];
}

export const STUDY_GUIDES: Record<StoryKey, StudyGuide> = {
  "mark-5": {
    shape: {
      start: "Jairus's daughter lies at the point of death.",
      happens: "Messengers report that she has died.",
      response: "Jesus says, “Be not afraid, only believe.”",
      change: "He takes her hand: “Talitha koum.”",
      end: "She rises and walks, and is given something to eat.",
    },
    intro:
      "Jairus, a synagogue ruler, begs Jesus to come to his dying daughter. On the way, messengers arrive with news.",
    observe: [
      "What do the messengers report, and how does Jesus respond to it?",
      "What exactly does Jesus say to the girl, and what happens next?",
    ],
    interpret: [
      "Why might Mark keep Jesus's Aramaic words, “Talitha koum”?",
      "Why does it matter who gives the command for the girl to rise?",
    ],
    apply: [
      "The messengers ask, “Why troublest thou the Master any further?” When have you felt that way?",
    ],
  },
  "good-samaritan": {
    shape: {
      start: "A traveler is robbed and left half dead.",
      happens: "Three people come down the road.",
      response: "Two pass by; a Samaritan stops.",
      change: "He bandages him, carries him and pays for his care.",
      end: "The traveler is cared for at the inn.",
    },
    intro:
      "A lawyer asks Jesus, “Who is my neighbour?” Jesus answers with a story about a man on the road from Jerusalem to Jericho.",
    observe: [
      "Who passes by, and who stops? What does each one do?",
      "List everything the Samaritan does for the traveler.",
    ],
    interpret: [
      "Why might Jesus make the helper a Samaritan?",
      "How does the story change the lawyer's question?",
    ],
    apply: [
      "Who is on the road near you this week, and what would stopping look like?",
    ],
  },
  "prodigal-son": {
    shape: {
      start: "A younger son leaves home with his inheritance.",
      happens: "He wastes it all and comes to himself.",
      response: "He goes home, and his father runs to meet him.",
      change: "The lost son is welcomed back.",
      end: "A feast: “this my son was dead, and is alive again.”",
    },
    intro:
      "Tax collectors and sinners draw near to Jesus, and the religious leaders grumble. Jesus tells a story about a father and two sons.",
    observe: [
      "Trace the younger son's journey step by step.",
      "What does the father do when he sees his son far off?",
    ],
    interpret: [
      "What does the father's welcome say about him?",
      "The model follows the younger son. How does the older son change the story?",
    ],
    apply: [
      "Which son do you find it easier to identify with, and why?",
    ],
  },
  sower: {
    shape: {
      start: "A sower scatters seed.",
      happens: "It falls on four kinds of ground.",
      response: "Each ground receives it differently.",
      change: "Birds, sun and thorns take three; one grows.",
      end: "Good ground bears fruit, up to a hundredfold.",
    },
    intro:
      "Jesus sits by the sea and teaches a great crowd from a boat. This is the first parable in Matthew 13.",
    observe: [
      "Name the four places the seed falls and what happens in each.",
      "Which seed springs up quickly, and what happens to it?",
    ],
    interpret: [
      "The sower and the seed are the same each time. What makes the difference?",
      "Why might Jesus end with, “Who hath ears to hear, let him hear”?",
    ],
    apply: [
      "Which kind of ground describes you right now?",
    ],
  },
  talents: {
    shape: {
      start: "A master entrusts money to three servants.",
      happens: "He goes away for a long time.",
      response: "Two trade with it; one buries it.",
      change: "The two double what they were given.",
      end: "The master returns and settles accounts.",
    },
    intro:
      "Before leaving on a journey, a master entrusts his property to three servants, each according to his ability.",
    observe: [
      "How much is each servant given, and what does each one do with it?",
      "What does the master do when he returns?",
    ],
    interpret: [
      "Why does the third servant bury his talent?",
      "What does the story suggest about faithfulness?",
    ],
    apply: [
      "What has been entrusted to you, and what are you doing with it?",
    ],
  },
  "lost-sheep": {
    shape: {
      start: "A shepherd has a hundred sheep and loses one.",
      happens: "He leaves the ninety and nine.",
      response: "He searches until he finds it.",
      change: "He carries it home on his shoulders.",
      end: "He calls his friends to rejoice with him.",
    },
    intro:
      "The religious leaders complain that Jesus welcomes sinners and eats with them. He answers with a question about a shepherd.",
    observe: [
      "What does the shepherd leave behind to go after the one?",
      "How does he bring the sheep home, and what does he do next?",
    ],
    interpret: [
      "Why is the story told as a question (“What man of you…?”)?",
      "What does the celebration say about the shepherd?",
    ],
    apply: [
      "Who might feel like the one sheep in your community?",
    ],
  },
};
