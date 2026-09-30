import {
  EVENTS,
  JESUS_SOURCE_AUTHORITY,
  TALENTS_ASSET_1,
  TALENTS_ASSET_2,
  TALENTS_ASSET_5,
  TALENTS_AUTHORITY_GRANT_1,
  TALENTS_AUTHORITY_GRANT_2,
  TALENTS_AUTHORITY_GRANT_5,
  TALENTS_EVENTS,
  TALENTS_MASTER_SOURCE_AUTHORITY,
  type AuthorityGrant,
  type EntityId,
  type Event,
  type SourceAuthority,
} from "./turing-complete-gospel-of-jesus-christ";
import type { LoadIssue, LoadedCase } from "./externalCase";
import { verseLabel } from "./provenance";
import type { StoryKey } from "./plainLanguage";
import {
  actFromEvent,
  resolveResponsibility,
  type AuthorityContext,
  type Outcome,
  type Resolution,
} from "./responsibility";
import { SHAPE_STEPS, STUDY_GUIDES } from "./studyGuide";

/*
 * Comparison report.
 *
 * Lines an external case up against the six internal (scripture) models.
 * The report is structural: it says which acts share an authority pattern
 * with an act in scripture, lays the story shapes side by side, and asks
 * questions. It never says what a case means, whether an act was right, or
 * who is guilty. Moving from a pattern to a judgment needs an authorized
 * normative bridge, which only a person can supply.
 */

export const COMPARISON_NOTICE =
  "Structural comparison only. Matching patterns show that two acts have the same authority structure, not that they are alike in meaning or in merit. Nothing here is a finding of fact, of law or of fault.";

/** How far an act's authority is from its root. */
export type Delegation =
  /** No authority was claimed. */
  | "none"
  /** Acted on the actor's own source authority. */
  | "direct"
  /** Acted under one grant from the source. */
  | "delegated"
  /** Acted under a grant derived from another grant. */
  | "sub-delegated";

export interface ActPattern {
  readonly outcome: Outcome;
  readonly delegation: Delegation;
}

export function patternOf(resolution: Resolution, claimedAuthority: boolean): ActPattern {
  const grants = resolution.chain.filter((a) => a.kind === "authority-grant").length;
  const delegation: Delegation = !claimedAuthority
    ? "none"
    : grants === 0
      ? "direct"
      : grants === 1
        ? "delegated"
        : "sub-delegated";
  return { outcome: resolution.outcome, delegation };
}

/* -------------------------------------------------------------------------- */
/* INTERNAL MODELS                                                             */
/* -------------------------------------------------------------------------- */

export interface InternalAct {
  readonly story: StoryKey;
  readonly label: string;
  readonly verse: string;
  readonly pattern: ActPattern;
  readonly resolution: Resolution;
}

export interface InternalModel {
  readonly story: StoryKey;
  readonly title: string;
  /** False when the story's model has no authority structure to compare. */
  readonly authorityModelled: boolean;
  readonly acts: readonly InternalAct[];
}

function eventByOperation(events: readonly Event[], operation: string): Event {
  const found = events.find((e) => e.operation === operation);
  if (!found) throw new Error(`No event with operation "${operation}"`);
  return found;
}

function internalAct(
  story: StoryKey,
  label: string,
  event: Event,
  basis: { authority: SourceAuthority | AuthorityGrant; operation: string; target?: EntityId },
  context: AuthorityContext
): InternalAct {
  const resolution = resolveResponsibility(actFromEvent(event, basis), context);
  return {
    story,
    label,
    verse: verseLabel(event.provenance?.[0]),
    pattern: patternOf(resolution, true),
    resolution,
  };
}

const SHORT_TITLES: Record<StoryKey, string> = {
  "mark-5": "Jairus's Daughter",
  "good-samaritan": "Good Samaritan",
  "prodigal-son": "Prodigal Son",
  sower: "Sower",
  talents: "Talents",
  "lost-sheep": "Lost Sheep",
};

const TITLES: Record<StoryKey, string> = {
  "mark-5": "Jairus's Daughter (Mark 5:21–43)",
  "good-samaritan": "The Good Samaritan (Luke 10:30–37)",
  "prodigal-son": "The Prodigal Son (Luke 15:11–32)",
  sower: "The Sower (Matthew 13:3–9)",
  talents: "The Talents (Matthew 25:14–30)",
  "lost-sheep": "The Lost Sheep (Luke 15:3–7)",
};

/** The six scripture models, with the acts whose authority the model records. */
export function internalModels(): readonly InternalModel[] {
  const mark5: AuthorityContext = { grants: [], sources: [JESUS_SOURCE_AUTHORITY] };
  const talents: AuthorityContext = {
    grants: [TALENTS_AUTHORITY_GRANT_5, TALENTS_AUTHORITY_GRANT_2, TALENTS_AUTHORITY_GRANT_1],
    sources: [TALENTS_MASTER_SOURCE_AUTHORITY],
  };

  const acts: Partial<Record<StoryKey, InternalAct[]>> = {
    "mark-5": [
      internalAct(
        "mark-5",
        "Jesus commands the girl to rise",
        eventByOperation(EVENTS, "command-rise"),
        { authority: JESUS_SOURCE_AUTHORITY, operation: "rise" },
        mark5
      ),
    ],
    talents: [
      internalAct(
        "talents",
        "The first servant trades with five talents",
        eventByOperation(TALENTS_EVENTS, "gain-five"),
        { authority: TALENTS_AUTHORITY_GRANT_5, operation: "manage-five", target: TALENTS_ASSET_5 },
        talents
      ),
      internalAct(
        "talents",
        "The second servant trades with two talents",
        eventByOperation(TALENTS_EVENTS, "gain-two"),
        { authority: TALENTS_AUTHORITY_GRANT_2, operation: "manage-two", target: TALENTS_ASSET_2 },
        talents
      ),
      internalAct(
        "talents",
        "The third servant hides his talent",
        eventByOperation(TALENTS_EVENTS, "hide-one"),
        { authority: TALENTS_AUTHORITY_GRANT_1, operation: "manage-one", target: TALENTS_ASSET_1 },
        talents
      ),
    ],
  };

  return (Object.keys(TITLES) as StoryKey[]).map((story) => ({
    story,
    title: TITLES[story],
    authorityModelled: (acts[story]?.length ?? 0) > 0,
    acts: acts[story] ?? [],
  }));
}

/* -------------------------------------------------------------------------- */
/* REPORT                                                                      */
/* -------------------------------------------------------------------------- */

export interface PatternMatch {
  readonly act: InternalAct;
  /** "same": outcome and delegation match. "outcome": only the outcome does. */
  readonly strength: "same" | "outcome";
}

export interface ActComparison {
  readonly id: string;
  readonly description: string;
  readonly actor?: string;
  readonly attribution: "established" | "alleged" | "unknown";
  readonly consequential: boolean;
  readonly pattern: ActPattern;
  /** Parties in the authority chain, act-side first, as labels. */
  readonly chain: readonly string[];
  readonly responsible: ReadonlyArray<{ readonly party: string; readonly role: string }>;
  readonly matches: readonly PatternMatch[];
  /** Questions for the people using the report. Never answers. */
  readonly questions: readonly string[];
}

export interface StorySummary {
  readonly story: StoryKey;
  readonly title: string;
  readonly authorityModelled: boolean;
  /** Ids of the case's acts that share a full pattern with this story. */
  readonly sharedActs: readonly string[];
}

export interface ShapeRow {
  readonly step: string;
  readonly external?: string;
  readonly stories: Readonly<Record<StoryKey, string>>;
}

export interface ComparisonReport {
  readonly caseId: string;
  readonly title: string;
  readonly illustrative: boolean;
  readonly notice: string;
  readonly acts: readonly ActComparison[];
  readonly stories: readonly StorySummary[];
  readonly shape: readonly ShapeRow[];
  /** Outcomes in the case that no internal model shows. */
  readonly unmatchedOutcomes: readonly Outcome[];
  readonly issues: readonly LoadIssue[];
}

function questionsFor(
  outcome: Outcome,
  labels: { actor: string; chain: readonly string[]; authority?: string },
  hasTalentsMatch: boolean
): string[] {
  switch (outcome) {
    case "authorized": {
      const q = [
        `The chain runs ${labels.chain.join(" → ")}. Was each link in force, and within its conditions, when the act was done?`,
      ];
      if (hasTalentsMatch) {
        q.push(
          "In the Talents, acting within a grant did not end the matter: the master still settled accounts (Matthew 25:19). What accounting applies to this act, and who carries it out?"
        );
      } else {
        q.push("Being within authority does not make an act right. What standard, beyond authority, applies here?");
      }
      return q;
    }
    case "exceeds-scope":
      return [
        `${labels.actor} acted beyond ${labels.authority ? `the grant ${labels.authority}` : "the authority"} as granted. Who was responsible for keeping the act within scope?`,
        "Does another source of authority cover the act? If so, it needs to be added to the case with its sources.",
      ];
    case "invalid-chain":
      return [
        "Which link in the chain is missing or defective, and is there a record that would supply it?",
        `If the link cannot be supplied, on what basis did ${labels.actor} act?`,
      ];
    case "no-authority":
      return [`Under what authority, if any, did ${labels.actor} act? Which source would show it?`];
    case "attribution-undetermined":
      return [
        "What source could establish who performed this act: a court judgment, an official record, or the organization's own document?",
        "Until then, the report names no responsible party. Is anyone treating this act as established without such a source?",
      ];
  }
}

/** Compares one loaded external case with the internal models. */
export function compareCase(
  loaded: LoadedCase,
  models: readonly InternalModel[] = internalModels()
): ComparisonReport {
  const labels = new Map(
    [...loaded.case.actors, ...loaded.case.entities].map((p) => [p.id, p.label] as const)
  );
  const label = (id: string | undefined) => (id ? labels.get(id) ?? id : "an unidentified actor");
  const internal = models.flatMap((m) => m.acts);

  const acts = loaded.acts.map(({ source, act, resolution }): ActComparison => {
    const pattern = patternOf(resolution, act.authority !== undefined);
    const matches: PatternMatch[] = internal
      .filter((i) => i.pattern.outcome === pattern.outcome)
      .map((i) => ({
        act: i,
        strength: i.pattern.delegation === pattern.delegation ? ("same" as const) : ("outcome" as const),
      }))
      .sort((a, b) => (a.strength === b.strength ? 0 : a.strength === "same" ? -1 : 1));

    // The chain as the people in it: bearer of each link, then the root's bearer.
    const chain = resolution.chain
      .map((link) => label(link.bearer))
      .filter((name, i, all) => all.indexOf(name) === i);
    const chainForQuestion = [...chain].reverse();

    return {
      id: source.id,
      description: source.description,
      actor: source.actor ? label(source.actor) : undefined,
      attribution: act.attribution,
      consequential: source.consequential,
      pattern,
      chain,
      responsible: resolution.responsible.map((r) => ({ party: label(r.party), role: r.role })),
      matches,
      questions: questionsFor(
        pattern.outcome,
        { actor: label(source.actor), chain: chainForQuestion, authority: source.authority },
        // The Talents' accounting speaks to any act done under a grant.
        pattern.delegation !== "direct" &&
          pattern.delegation !== "none" &&
          matches.some((m) => m.act.story === "talents")
      ),
    };
  });

  const stories = models.map(
    (m): StorySummary => ({
      story: m.story,
      title: m.title,
      authorityModelled: m.authorityModelled,
      sharedActs: acts
        .filter((a) => a.matches.some((x) => x.strength === "same" && x.act.story === m.story))
        .map((a) => a.id),
    })
  );

  const shape = SHAPE_STEPS.map(
    ([key, step]): ShapeRow => ({
      step,
      external: loaded.case.shape?.[key],
      stories: Object.fromEntries(
        models.map((m) => [m.story, STUDY_GUIDES[m.story].shape[key]])
      ) as Record<StoryKey, string>,
    })
  );

  const internalOutcomes = new Set(internal.map((i) => i.pattern.outcome));
  const unmatchedOutcomes = [...new Set(acts.map((a) => a.pattern.outcome))].filter(
    (o) => !internalOutcomes.has(o)
  );

  return {
    caseId: loaded.case.id,
    title: loaded.case.title,
    illustrative: loaded.case.illustrative === true,
    notice: COMPARISON_NOTICE,
    acts,
    stories,
    shape,
    unmatchedOutcomes,
    issues: loaded.issues,
  };
}

/* -------------------------------------------------------------------------- */
/* MARKDOWN                                                                    */
/* -------------------------------------------------------------------------- */

const OUTCOME_LABELS: Record<Outcome, string> = {
  authorized: "Authorized",
  "exceeds-scope": "Exceeds scope",
  "no-authority": "No authority claimed",
  "invalid-chain": "Invalid authority chain",
  "attribution-undetermined": "Attribution undetermined",
};

const DELEGATION_LABELS: Record<Delegation, string> = {
  none: "no authority claimed",
  direct: "on the actor's own authority",
  delegated: "under a grant from the source",
  "sub-delegated": "under a grant derived from another grant",
};

const cell = (s: string | undefined) => (s ?? "—").replace(/\|/g, "\\|");

/** Renders the report as Markdown, for review and for version control. */
export function renderComparisonMarkdown(report: ComparisonReport): string {
  const out: string[] = [];
  out.push(`# Comparison: ${report.title}`, "");
  if (report.illustrative) out.push("_Illustrative case: the parties and documents are invented._", "");
  out.push(`> ${report.notice}`, "");

  out.push("## Acts", "");
  for (const a of report.acts) {
    out.push(`### ${a.description}`, "");
    out.push(
      `- **Outcome:** ${OUTCOME_LABELS[a.pattern.outcome]}, ${DELEGATION_LABELS[a.pattern.delegation]}`,
      `- **Attribution:** ${a.attribution}${a.consequential ? " · consequential" : ""}`
    );
    if (a.chain.length > 0) out.push(`- **Authority chain:** ${a.chain.join(" ← ")}`);
    out.push(
      `- **Responsible:** ${
        a.responsible.length > 0
          ? a.responsible.map((r) => `${r.party} (${r.role})`).join(", ")
          : "undetermined"
      }`
    );
    const same = a.matches.filter((m) => m.strength === "same");
    const outcomeOnly = a.matches.filter((m) => m.strength === "outcome");
    if (same.length > 0) {
      out.push(`- **Same pattern in scripture:** ${same.map((m) => `${m.act.label} (${m.act.verse})`).join("; ")}`);
    }
    if (outcomeOnly.length > 0) {
      out.push(
        `- **Same outcome, different delegation:** ${outcomeOnly
          .map((m) => `${m.act.label} (${m.act.verse}, ${DELEGATION_LABELS[m.act.pattern.delegation]})`)
          .join("; ")}`
      );
    }
    if (a.matches.length === 0) out.push("- **In scripture:** no internal model shows this outcome.");
    out.push("", "Questions:", "", ...a.questions.map((q) => `- ${q}`), "");
  }

  out.push("## The internal models", "");
  out.push("| Story | Authority modelled | Acts with the same pattern |", "| --- | --- | --- |");
  for (const s of report.stories) {
    out.push(
      `| ${s.title} | ${s.authorityModelled ? "yes" : "no"} | ${s.sharedActs.length > 0 ? s.sharedActs.join(", ") : "—"} |`
    );
  }
  out.push("");
  if (report.unmatchedOutcomes.length > 0) {
    out.push(
      `No internal model shows: ${report.unmatchedOutcomes.map((o) => OUTCOME_LABELS[o].toLowerCase()).join(", ")}. The comparison has nothing to line these acts up with.`,
      ""
    );
  }

  out.push("## Shapes side by side", "");
  out.push(
    "Shown for people to compare. The report does not score how alike they are.",
    ""
  );
  const stories = report.stories.map((s) => s.story);
  out.push(
    `| Step | This case | ${stories.map((s) => cell(SHORT_TITLES[s])).join(" | ")} |`,
    `| --- | --- | ${stories.map(() => "---").join(" | ")} |`
  );
  for (const row of report.shape) {
    out.push(`| ${row.step} | ${cell(row.external)} | ${stories.map((s) => cell(row.stories[s])).join(" | ")} |`);
  }
  out.push("");

  if (report.issues.length > 0) {
    out.push("## Loader warnings", "");
    for (const i of report.issues) out.push(`- \`${i.path}\`${i.code ? ` ${i.code}` : ""}: ${i.message}`);
    out.push("");
  }
  return out.join("\n");
}
