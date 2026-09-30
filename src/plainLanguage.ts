/**
 * Plain-language wording for Story mode.
 *
 * The model keeps precise, technical names (operations such as
 * `provide-immediate-care`, phases such as `UNDER_CARE`). Story mode shows a
 * Bible study group everyday wording instead. Nothing here changes the model;
 * it is a presentation layer only. Unknown keys fall back to a readable form
 * of the technical name.
 */

export type StoryKey =
  | "mark-5"
  | "good-samaritan"
  | "prodigal-son"
  | "sower"
  | "talents"
  | "lost-sheep";

/* -------------------------------------------------------------------------- */
/* PEOPLE AND THINGS                                                           */
/* -------------------------------------------------------------------------- */

/** Short names used in sentences ("the Samaritan", not "GoodSamaritan-Samaritan"). */
const CHARACTER_NAMES: Record<string, string> = {
  Jesus: "Jesus",
  Jairus: "Jairus",
  Messengers: "the messengers",
  Community: "the people present",
  JairusDaughter: "the girl",
  "GoodSamaritan-Robbers": "robbers",
  "GoodSamaritan-Priest": "a priest",
  "GoodSamaritan-Levite": "a Levite",
  "GoodSamaritan-Samaritan": "the Samaritan",
  "GoodSamaritan-Innkeeper": "the innkeeper",
  "GoodSamaritan-Traveler": "the traveler",
  "Prodigal-Father": "the father",
  "Prodigal-OlderSon": "the older son",
  "Prodigal-YoungerSon": "the younger son",
  Sower: "the sower",
  "Sower-WaysideSeed": "the seed by the wayside",
  "Sower-StonySeed": "the seed on stony ground",
  "Sower-ThornsSeed": "the seed among thorns",
  "Sower-GoodGroundSeed": "the seed on good ground",
  "Talents-Master": "the master",
  "Talents-ServantFive": "the first servant",
  "Talents-ServantTwo": "the second servant",
  "Talents-ServantOne": "the third servant",
  "LostSheep-Shepherd": "the shepherd",
  "LostSheep-One": "the lost sheep",
};

export function characterName(id: string | undefined): string {
  if (!id) return "";
  return CHARACTER_NAMES[id] ?? humanize(id.replace(/^[A-Za-z]+-/, ""));
}

/* -------------------------------------------------------------------------- */
/* WHAT HAPPENS                                                                */
/* -------------------------------------------------------------------------- */

/** Sentence templates for each operation. {a} = actor, {t} = target. */
const EVENT_SENTENCES: Record<string, string> = {
  "command-rise": "Jesus tells the girl to get up.",
  rise: "The girl gets up.",
  "command-give-food": "Jesus tells them to give her something to eat.",
  attack: "Robbers attack the traveler.",
  "pass-by": "{a} sees him and passes by on the other side.",
  "provide-immediate-care": "The Samaritan stops and bandages his wounds.",
  transport: "The Samaritan takes him to an inn.",
  "transfer-resources": "The Samaritan pays the innkeeper to look after him.",
  "depart-household": "The younger son leaves home for a far country.",
  "spend-resources": "He wastes everything he has.",
  "return-to-father": "He gets up and goes back to his father.",
  "receive-son": "His father runs to meet him and welcomes him home.",
  sow: "The sower scatters seed — some falls on {t_place}.",
  "be-devoured": "Birds come and eat it up.",
  "spring-up": "It springs up quickly.",
  wither: "The sun scorches it and it withers.",
  "be-choked": "The thorns grow up and choke it.",
  "bear-fruit": "It grows and bears fruit.",
  "entrust-five": "The master gives the first servant five talents.",
  "entrust-two": "He gives the second servant two.",
  "entrust-one": "He gives the third servant one.",
  "gain-five": "The first servant trades and gains five more.",
  "gain-two": "The second servant gains two more.",
  "hide-one": "The third servant buries his talent in the ground.",
  "settle-accounts": "The master returns and settles accounts with them.",
  seek: "The shepherd goes after the one that is lost.",
  find: "He finds it.",
  "return-to-flock": "He carries it home on his shoulders.",
};

const SEED_PLACES: Record<string, string> = {
  "Sower-WaysideSeed": "the wayside",
  "Sower-StonySeed": "stony ground",
  "Sower-ThornsSeed": "thorny ground",
  "Sower-GoodGroundSeed": "good ground",
};

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

export function eventSentence(event: {
  operation: string;
  actor?: string;
  target?: string;
}): string {
  const template = EVENT_SENTENCES[event.operation];
  if (!template) {
    const who = capitalize(characterName(event.actor));
    return `${who ? `${who}: ` : ""}${humanize(event.operation)}.`;
  }
  return capitalize(
    template
      .replace("{a}", characterName(event.actor))
      .replace("{t_place}", SEED_PLACES[event.target ?? ""] ?? "the ground")
      .replace("{t}", characterName(event.target))
  );
}

/* -------------------------------------------------------------------------- */
/* HOW THINGS STAND                                                            */
/* -------------------------------------------------------------------------- */

/** Who a group of state values describes, per story. "" = the story's main subject. */
const STATE_SUBJECTS: Record<StoryKey, Record<string, string>> = {
  "mark-5": { "": "Jairus's daughter" },
  "good-samaritan": { "": "The traveler" },
  "prodigal-son": { "": "The younger son" },
  sower: {
    wayside: "Seed by the wayside",
    stony: "Seed on stony ground",
    thorns: "Seed among thorns",
    goodGround: "Seed on good ground",
  },
  talents: {
    five: "First servant",
    two: "Second servant",
    one: "Third servant",
  },
  "lost-sheep": { "": "The lost sheep" },
};

type PropertyWording = {
  label: string;
  values?: Record<string, string>;
};

/**
 * Wording for each state property. `phase` is the model's summary of the
 * other properties, so Story mode hides it when a plainer property changes
 * alongside it; see `plainChanges`.
 */
const PROPERTIES: Record<string, PropertyWording> = {
  phase: {
    label: "situation",
    values: {
      CRISIS_UNRESOLVED: "at the point of death",
      ALIVE: "alive",
      TRAVELING: "on the road",
      INJURED: "left half dead",
      UNDER_CARE: "being cared for",
      HOUSEHOLD_MEMBER_PRESENT: "at home",
      AWAY_FROM_HOUSEHOLD: "far from home",
      RETURNING: "on the way home",
      RECEIVED_INTO_HOUSEHOLD: "welcomed home",
      UNSOWN: "not yet sown",
      RECEIVED: "sown",
      GERMINATED: "sprouted",
      TERMINATED: "gone",
      FRUITFUL: "bearing fruit",
    },
  },
  lifecycle: { label: "life", values: { unknown: "uncertain", alive: "alive" } },
  risen: { label: "risen", values: { false: "lying down", true: "up and walking" } },
  condition: { label: "condition", values: { unknown: "not yet known", injured: "wounded" } },
  care: { label: "care", values: { none: "no one helping", provided: "wounds bandaged" } },
  transported: { label: "where", values: { false: "by the road", true: "at the inn" } },
  resourcesTransferred: {
    label: "provision",
    values: { false: "nothing arranged", true: "paid for at the inn" },
  },
  locationRelation: {
    label: "where",
    values: { "with-household": "at home", away: "far away", "with-father": "with his father" },
  },
  resources: { label: "money", values: { available: "his inheritance", depleted: "all spent" } },
  returnStatus: { label: "journey", values: { "not-returned": "away", returned: "came back" } },
  receptionStatus: { label: "welcome", values: { "not-applicable": "not yet", received: "received by his father" } },
  outcome: {
    label: "outcome",
    values: {
      unknown: "not yet known",
      devoured: "eaten by birds",
      withered: "withered",
      choked: "choked",
      fruitful: "fruitful",
      increased: "doubled",
      "preserved-hidden": "buried, unchanged",
    },
  },
  entrusted: { label: "entrusted", values: { false: "nothing yet", true: "given talents" } },
  accountabilityReached: {
    label: "reckoning",
    values: { false: "not yet", true: "gave account" },
  },
  locatedState: { label: "where", values: { lost: "lost", found: "found", returned: "home with the flock" } },
  searchStatus: {
    label: "search",
    values: { "not-started": "not started", seeking: "being searched for", completed: "over" },
  },
};

export function humanize(id: string): string {
  return id
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .toLowerCase();
}

export interface PlainChange {
  readonly subject: string;
  readonly label: string;
  readonly before: string;
  readonly after: string;
}

function valueWording(prop: string, value: string | undefined): string {
  if (value === undefined) return "—";
  return PROPERTIES[prop]?.values?.[value] ?? humanize(value);
}

/**
 * Turns technical state changes (`properties.care: none → provided`) into
 * plain ones ("The traveler · care: no one helping → wounds bandaged").
 */
export function plainChanges(
  story: StoryKey,
  changes: readonly { key: string; before?: string; after?: string }[]
): PlainChange[] {
  const subjects = STATE_SUBJECTS[story];
  const parsed = changes.map((c) => {
    const parts = c.key.split(".");
    const prop = parts[parts.length - 1];
    const group = parts.length > 1 && parts[0] !== "properties" ? parts[0] : "";
    return { ...c, prop, group };
  });

  return parsed
    .filter((c) => {
      // Skip the summary "situation" when a plainer detail for the same
      // subject changed too, unless it is the only thing that changed.
      if (c.prop !== "phase") return true;
      return !parsed.some(
        (o) => o !== c && o.group === c.group && o.prop !== "phase"
      );
    })
    .map((c) => ({
      subject: subjects[c.group] ?? subjects[""] ?? humanize(c.group),
      label: PROPERTIES[c.prop]?.label ?? humanize(c.prop),
      before: valueWording(c.prop, c.before),
      after: valueWording(c.prop, c.after),
    }));
}

/* -------------------------------------------------------------------------- */
/* HOW A QUOTATION ENTERS THE STORY                                            */
/* -------------------------------------------------------------------------- */

export function plainModality(modality: string): string {
  switch (modality) {
    case "asserted":
      return "narrator";
    case "reported":
      return "reported by someone in the story";
    case "conditional":
      return "“if…”, a setup";
    case "predicted":
      return "a prediction";
    case "questioned":
      return "a question";
    case "hypothetical":
      return "a what-if";
    case "denied":
      return "denied";
    default:
      return humanize(modality);
  }
}

/** Why a quotation is not one of the story's steps, in plain words. */
export function plainNotAStep(outcome: string | undefined): string {
  switch (outcome) {
    case "admitted-claim":
      return "a claim, not a step";
    case "withheld":
      return "set aside";
    default:
      return "sets the scene";
  }
}

/* -------------------------------------------------------------------------- */
/* SOURCES                                                                     */
/* -------------------------------------------------------------------------- */

/** Why a quotation counts as a step, by who vouches for it. */
export function plainWhyItCounts(sourceAuthority: string): string {
  switch (sourceAuthority) {
    case "canonical-narrator":
      return "The narrator tells us this happened.";
    case "jesus":
      return "Jesus says it.";
    case "witness":
      return "Someone in the story reports it.";
    default:
      return "It is added by an agreed way of reading, not by the text itself.";
  }
}

/** Readings (interpretations) and takeaways (applications) in plain words. */
const READING_NAMES: Record<string, string> = {
  "care-pattern": "Care for someone in need",
  "resource-provision": "Generous provision",
  "restoration-pattern": "Restoration",
  RestorationPattern: "Restoration",
  DivergentOutcomePattern: "Same seed, different outcomes",
  AccountabilityPattern: "Faithfulness and accountability",
  RecoveryPattern: "The lost is found",
  "assess-and-address-immediate-material-need":
    "Notice and meet someone's immediate need",
};

export function readingName(label: string): string {
  return READING_NAMES[label] ?? capitalize(humanize(label.replace(/Pattern$/, "")));
}
