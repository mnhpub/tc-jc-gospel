import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  MARK_5_JAIRUS_NARRATIVE,
  GOOD_SAMARITAN_NARRATIVE,
  PRODIGAL_SON_NARRATIVE,
  SOWER_NARRATIVE,
  TALENTS_NARRATIVE,
  LOST_SHEEP_NARRATIVE,
  MARK_5_GRAPH,
  GOOD_SAMARITAN_GRAPH,
  GOOD_SAMARITAN_LENSED_GRAPH,
  GOOD_SAMARITAN_APPLIED_GRAPH,
  GOOD_SAMARITAN_RULE_BINDINGS,
  PRODIGAL_GRAPH,
  PRODIGAL_LENSED_GRAPH,
  SOWER_GRAPH,
  SOWER_LENSED_GRAPH,
  TALENTS_GRAPH,
  TALENTS_LENSED_GRAPH,
  LOST_SHEEP_GRAPH,
  LOST_SHEEP_LENSED_GRAPH,
  PARABLE_ALGEBRA,
  PARABLE_COMPARISON,
  COMMAND_TALITHA_KOUM,
  EVENTS,
  evaluateCommandFulfillment,
  replayGirl,
  replayTraveler,
  replayProdigal,
  replaySower,
  replayTalents,
  replayLostSheep,
  withRuleAuthorizationNodes,
  type EpistemicLayer,
  type Event,
  type GraphNode,
  type Narrative,
  type NarrativeGraph,
  type ParableAlgebra,
} from "./turing-complete-gospel-of-jesus-christ";
import StoryView from "./StoryView";
import SourcesView from "./SourcesView";
import { SHAPE_STEPS, STUDY_GUIDES } from "./studyGuide";
import {
  admissionForExtraction,
  diffStates,
  eventIndexForExtraction,
  extractionIdsForEvent,
  flattenState,
  traceLineage,
  verseLabel,
  withProvenanceLayers,
} from "./provenance";

type NarrativeKey =
  | "mark-5"
  | "good-samaritan"
  | "prodigal-son"
  | "sower"
  | "talents"
  | "lost-sheep";

type ViewMode = "reader" | "structure" | "compare" | "audit";

type RegistryEntry = {
  key: NarrativeKey;
  shortTitle: string;
  title: string;
  narrative: Narrative;
  canonical: NarrativeGraph;
  lensed: NarrativeGraph;
  /** Graph shown in the Audit view; defaults to `lensed`. */
  audit?: NarrativeGraph;
  algebra?: ParableAlgebra;
};

const REGISTRY: Record<NarrativeKey, RegistryEntry> = {
  "mark-5": {
    key: "mark-5",
    shortTitle: "Jairus's Daughter",
    title: "Jairus's Daughter — Mark 5:21–43",
    narrative: MARK_5_JAIRUS_NARRATIVE,
    canonical: MARK_5_GRAPH,
    lensed: MARK_5_GRAPH,
  },
  "good-samaritan": {
    key: "good-samaritan",
    shortTitle: "Good Samaritan",
    title: "The Good Samaritan — Luke 10:30–37",
    narrative: GOOD_SAMARITAN_NARRATIVE,
    canonical: GOOD_SAMARITAN_GRAPH,
    lensed: GOOD_SAMARITAN_LENSED_GRAPH,
    audit: withRuleAuthorizationNodes(
      GOOD_SAMARITAN_APPLIED_GRAPH,
      GOOD_SAMARITAN_RULE_BINDINGS,
      { disabledRuleIds: new Set(), disputedAuthorizationIds: new Set() }
    ),
    algebra: PARABLE_ALGEBRA.find(
      (x) => x.narrativeId === GOOD_SAMARITAN_NARRATIVE.id
    ),
  },
  "prodigal-son": {
    key: "prodigal-son",
    shortTitle: "Prodigal Son",
    title: "The Prodigal Son — Luke 15:11–32",
    narrative: PRODIGAL_SON_NARRATIVE,
    canonical: PRODIGAL_GRAPH,
    lensed: PRODIGAL_LENSED_GRAPH,
    algebra: PARABLE_ALGEBRA.find(
      (x) => x.narrativeId === PRODIGAL_SON_NARRATIVE.id
    ),
  },
  sower: {
    key: "sower",
    shortTitle: "Sower",
    title: "The Sower — Matthew 13:3–9",
    narrative: SOWER_NARRATIVE,
    canonical: SOWER_GRAPH,
    lensed: SOWER_LENSED_GRAPH,
    algebra: PARABLE_ALGEBRA.find(
      (x) => x.narrativeId === SOWER_NARRATIVE.id
    ),
  },
  talents: {
    key: "talents",
    shortTitle: "Talents",
    title: "The Talents — Matthew 25:14–30",
    narrative: TALENTS_NARRATIVE,
    canonical: TALENTS_GRAPH,
    lensed: TALENTS_LENSED_GRAPH,
    algebra: PARABLE_ALGEBRA.find(
      (x) => x.narrativeId === TALENTS_NARRATIVE.id
    ),
  },
  "lost-sheep": {
    key: "lost-sheep",
    shortTitle: "Lost Sheep",
    title: "The Lost Sheep — Luke 15:3–7",
    narrative: LOST_SHEEP_NARRATIVE,
    canonical: LOST_SHEEP_GRAPH,
    lensed: LOST_SHEEP_LENSED_GRAPH,
    algebra: PARABLE_ALGEBRA.find(
      (x) => x.narrativeId === LOST_SHEEP_NARRATIVE.id
    ),
  },
};

const ALL_KEYS = Object.keys(REGISTRY) as NarrativeKey[];

const LAYERS: readonly EpistemicLayer[] = [
  "text",
  "extraction",
  "admitted",
  "derived",
  "interpretive",
  "application",
];

const panel: React.CSSProperties = {
  border: "1px solid #d7dde6",
  borderRadius: 12,
  background: "#fff",
};

const muted = "#64748b";
const ink = "#172033";
const line = "#d7dde6";
const soft = "#f7f9fc";

function replaySnapshot(
  key: NarrativeKey,
  events: readonly any[]
): unknown {
  switch (key) {
    case "mark-5":
      return replayGirl(events);
    case "good-samaritan":
      return replayTraveler(events);
    case "prodigal-son":
      return replayProdigal(events);
    case "sower":
      return replaySower(events);
    case "talents":
      return replayTalents(events);
    case "lost-sheep":
      return replayLostSheep(events);
  }
}

function roleRows(entry: RegistryEntry): Array<[string, string]> {
  if (!entry.algebra) {
    return [
      ["Initial state", "girl's condition unresolved in modeled state"],
      ["Input / encounter", "Jesus enters the reported crisis"],
      ["Authority", "Jesus as source authority"],
      ["Response", "command and resulting action remain distinct"],
      ["Transition", "girl rises"],
      ["Outcome", "risen state established by admitted event"],
    ];
  }

  return [
    ["Initial state", entry.algebra.initialState],
    ["Input / encounter", entry.algebra.input],
    ["Context", entry.algebra.context],
    ["Authority", entry.algebra.authority],
    ["Response", entry.algebra.response],
    ["Transition δ", entry.algebra.transition],
    ["Outcome", entry.algebra.outcome],
  ];
}

function normalizedRole(name: string): string {
  const map: Record<string, string> = {
    "Initial state": "S₀",
    "Input / encounter": "I",
    Context: "C",
    Authority: "A",
    Response: "R",
    "Transition δ": "δ",
    Transition: "δ",
    Outcome: "S₁",
  };
  return map[name] ?? name;
}

const eyebrow: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: ".08em",
  color: muted,
  textTransform: "uppercase",
};

const current = "#2f5aa8";
const currentSoft = "#e8f0ff";
const replayedSoft = "#f3f7ff";
const replayedLine = "#b9c9e8";

function ReaderView({
  entry,
  replayIndex,
  setReplayIndex,
}: {
  entry: RegistryEntry;
  replayIndex: number;
  setReplayIndex: (n: number) => void;
}) {
  const narrative = entry.narrative;
  const events = narrative.events;
  const currentEvent = replayIndex > 0 ? events[replayIndex - 1] : undefined;

  const { snapshot, changes, currentExtractions, replayedExtractions } =
    useMemo(() => {
      const visible = events.slice(0, replayIndex);
      const after = replaySnapshot(entry.key, visible);
      const before = replaySnapshot(entry.key, events.slice(0, Math.max(0, replayIndex - 1)));
      const replayed = new Set<string>();
      for (const event of visible) {
        for (const id of extractionIdsForEvent(narrative, event)) replayed.add(id);
      }
      return {
        snapshot: after,
        changes: replayIndex > 0 ? diffStates(before, after) : [],
        currentExtractions: currentEvent
          ? extractionIdsForEvent(narrative, currentEvent)
          : new Set<string>(),
        replayedExtractions: replayed,
      };
    }, [entry.key, narrative, events, replayIndex, currentEvent]);

  const changedKeys = new Set(changes.map((c) => c.key));

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(280px, .8fr)",
          gap: 16,
        }}
        className="tcg-two-column"
      >
        <section style={{ ...panel, padding: 18 }}>
          <div style={eyebrow}>Narrative evidence</div>
          <h2 style={{ margin: "6px 0 4px", fontSize: 21 }}>{entry.title}</h2>
          <p style={{ margin: "0 0 14px", fontSize: 12, color: muted }}>
            Each quotation is highlighted when the event admitted from it is
            replayed. Select a quotation to jump to its event.
          </p>

          <div style={{ display: "grid", gap: 8 }}>
            {narrative.extractions.length === 0 ? (
              <p style={{ color: muted }}>
                This seed has not yet been expanded into visible extraction
                spans.
              </p>
            ) : (
              narrative.extractions.map((x) => {
                const admission = admissionForExtraction(narrative, x);
                const eventIndex = eventIndexForExtraction(narrative, x);
                const isCurrent = currentExtractions.has(x.id);
                const isReplayed = !isCurrent && replayedExtractions.has(x.id);
                const linked = eventIndex >= 0;
                const status = isCurrent
                  ? "current event"
                  : isReplayed
                    ? "replayed"
                    : linked
                      ? `event ${eventIndex + 1}`
                      : admission?.outcome === "admitted-claim"
                        ? "admitted as claim, not an event"
                        : admission
                          ? admission.outcome
                          : "not admitted";

                return (
                  <button
                    type="button"
                    key={x.id}
                    className="tcg-evidence"
                    disabled={!linked}
                    aria-current={isCurrent ? "step" : undefined}
                    onClick={() => setReplayIndex(eventIndex + 1)}
                    style={{
                      textAlign: "left",
                      font: "inherit",
                      color: ink,
                      padding: "11px 12px",
                      borderRadius: 8,
                      cursor: linked ? "pointer" : "default",
                      opacity: 1,
                      background: isCurrent
                        ? currentSoft
                        : isReplayed
                          ? replayedSoft
                          : soft,
                      border: `1px solid ${
                        isCurrent ? current : isReplayed ? replayedLine : line
                      }`,
                      boxShadow: isCurrent ? `inset 3px 0 0 ${current}` : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        fontSize: 12,
                        color: muted,
                      }}
                    >
                      <span>{verseLabel(x.source)}</span>
                      <span>{x.modality}</span>
                    </div>
                    <div style={{ marginTop: 5, fontSize: 14 }}>
                      “{x.sourceSpan}”
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        marginTop: 5,
                        fontSize: 12,
                        color: muted,
                      }}
                    >
                      <span>extraction → {x.predicate}</span>
                      <span
                        style={{
                          color: isCurrent ? current : muted,
                          fontWeight: isCurrent ? 700 : 400,
                        }}
                      >
                        {status}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        <section style={{ ...panel, padding: 18 }}>
          <div style={eyebrow}>Replay state</div>
          <h3 style={{ margin: "6px 0 10px" }}>
            Step {replayIndex} of {events.length}
          </h3>

          <input
            style={{ width: "100%" }}
            type="range"
            min={0}
            max={events.length}
            value={replayIndex}
            onChange={(e) => setReplayIndex(Number(e.target.value))}
            aria-label="Narrative replay position"
          />

          <div
            style={{
              display: "flex",
              gap: 8,
              margin: "10px 0 16px",
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={() => setReplayIndex(Math.max(0, replayIndex - 1))}
              disabled={replayIndex === 0}
            >
              Previous
            </button>
            <button
              type="button"
              onClick={() =>
                setReplayIndex(Math.min(events.length, replayIndex + 1))
              }
              disabled={replayIndex === events.length}
            >
              Next event
            </button>
            <button
              type="button"
              onClick={() => setReplayIndex(events.length)}
              disabled={replayIndex === events.length}
            >
              Replay all
            </button>
            <button
              type="button"
              onClick={() => setReplayIndex(0)}
              disabled={replayIndex === 0}
            >
              Reset
            </button>
          </div>

          {currentEvent && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: currentSoft,
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 11, color: muted }}>CURRENT EVENT</div>
              <div style={{ fontWeight: 700, marginTop: 3 }}>
                {currentEvent.operation}
              </div>
              <div style={{ color: muted, fontSize: 12, marginTop: 3 }}>
                {verseLabel(currentEvent.provenance?.[0])}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gap: 5 }}>
            {flattenState(snapshot).map(([key, value]) => {
              const changed = changedKeys.has(key);
              return (
                <div
                  key={key}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "minmax(0,1fr) auto",
                    gap: 12,
                    fontSize: 12,
                    borderBottom: `1px solid ${soft}`,
                    padding: "2px 4px 4px",
                    borderRadius: 4,
                    background: changed ? currentSoft : "transparent",
                  }}
                >
                  <span style={{ color: muted }}>{key}</span>
                  <span
                    style={{
                      textAlign: "right",
                      fontWeight: 600,
                      color: changed ? current : ink,
                    }}
                  >
                    {value}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      <section style={{ ...panel, padding: 18 }} aria-live="polite">
        <div style={eyebrow}>State transition</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr auto 1fr",
            gap: 10,
            alignItems: "stretch",
            marginTop: 10,
          }}
          className="tcg-transition-grid"
        >
          <div style={{ padding: 14, background: soft, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: muted }}>
              BEFORE · step {Math.max(0, replayIndex - 1)}
            </div>
            <ChangeList changes={changes} side="before" idle={!currentEvent} />
          </div>
          <div style={{ alignSelf: "center", color: muted }}>→</div>
          <div style={{ padding: 14, background: currentSoft, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: muted }}>EVENT</div>
            {currentEvent ? (
              <>
                <div style={{ fontWeight: 700, marginTop: 4 }}>
                  {currentEvent.operation}
                </div>
                <div style={{ fontSize: 12, color: muted, marginTop: 3 }}>
                  {currentEvent.kind} ·{" "}
                  {verseLabel(currentEvent.provenance?.[0])}
                </div>
              </>
            ) : (
              <div style={{ marginTop: 4, fontSize: 13, color: muted }}>
                Initial state. Choose <strong>Next event</strong> to apply the
                first admitted event.
              </div>
            )}
          </div>
          <div style={{ alignSelf: "center", color: muted }}>→</div>
          <div style={{ padding: 14, background: soft, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: muted }}>
              AFTER · step {replayIndex}
            </div>
            <ChangeList changes={changes} side="after" idle={!currentEvent} />
          </div>
        </div>
        {currentEvent && changes.length === 0 && (
          <p style={{ margin: "10px 0 0", fontSize: 12, color: muted }}>
            This event is recorded in the stream but does not change the
            modeled aggregate state.
          </p>
        )}
      </section>
    </div>
  );
}

function ChangeList({
  changes,
  side,
  idle,
}: {
  changes: readonly { key: string; before?: string; after?: string }[];
  side: "before" | "after";
  idle: boolean;
}) {
  if (idle || changes.length === 0) {
    return (
      <div style={{ marginTop: 4, fontSize: 13, color: muted }}>
        {idle ? "—" : "no modeled change"}
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: 4, marginTop: 6 }}>
      {changes.map((c) => (
        <div key={c.key} style={{ fontSize: 12 }}>
          <span style={{ color: muted }}>{c.key}</span>{" "}
          <strong style={{ color: side === "after" ? current : ink }}>
            {(side === "before" ? c.before : c.after) ?? "—"}
          </strong>
        </div>
      ))}
    </div>
  );
}

function AuthorityDemo() {
  const [authorityEnabled, setAuthorityEnabled] = useState(true);

  const executionEvent = EVENTS.find((e) => e.operation === "rise");
  const result = evaluateCommandFulfillment({
    command: COMMAND_TALITHA_KOUM,
    executionEvent,
    authorityEnabled,
  });

  const checks = [
    ["Authority", result.authorityValid],
    ["Command validity", result.commandValid],
    ["Action observed", result.executionObserved],
    ["Execution conforms", result.executionConforms],
    ["Scope valid", result.scopeValid],
  ] as const;

  return (
    <section style={{ ...panel, padding: 18 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".08em",
              color: muted,
              textTransform: "uppercase",
            }}
          >
            Authority / fulfillment experiment
          </div>
          <h3 style={{ margin: "5px 0 0" }}>
            Same observed action, different fulfillment semantics
          </h3>
          <p style={{ margin: "4px 0 0", fontSize: 12, color: muted }}>
            Worked example from Jairus's Daughter — “Talitha koum”, Mark
            5:41–42. It uses this command whichever narrative is selected
            above.
          </p>
        </div>
        <label
          style={{
            display: "inline-flex",
            gap: 8,
            alignItems: "center",
            fontSize: 13,
          }}
        >
          <input
            type="checkbox"
            checked={authorityEnabled}
            onChange={(e) => setAuthorityEnabled(e.target.checked)}
          />
          Authority enabled
        </label>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
          gap: 10,
          marginTop: 16,
        }}
        className="tcg-four-column"
      >
        {[
          ["AUTHORITY", authorityEnabled ? "present" : "removed"],
          ["COMMAND", result.commandValid ? "valid" : "invalid"],
          ["ACTION", result.executionObserved ? "occurred" : "not observed"],
          [
            "FULFILLMENT",
            result.status === "fulfilled" ? "fulfilled" : "not established",
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              border: `1px solid ${line}`,
              borderRadius: 9,
              padding: 12,
              background: label === "FULFILLMENT" ? "#f8fafc" : "#fff",
            }}
          >
            <div style={{ fontSize: 11, color: muted }}>{label}</div>
            <div style={{ fontWeight: 800, marginTop: 5 }}>{value}</div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          gap: 6,
          marginTop: 12,
        }}
        className="tcg-five-column"
      >
        {checks.map(([label, pass]) => (
          <div
            key={label}
            style={{
              padding: "7px 8px",
              borderRadius: 7,
              background: pass ? "#f2f8f2" : "#fff4f4",
              fontSize: 11,
            }}
          >
            {pass ? "✓" : "×"} {label}
          </div>
        ))}
      </div>

      <p style={{ margin: "12px 0 0", fontSize: 12, color: muted }}>
        In this model, removing authority does not erase the observed action.
        It prevents the same action from satisfying the modeled conditions for
        authoritative command fulfillment.
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* STORY MODE: PATTERN AND COMPARE                                             */
/* -------------------------------------------------------------------------- */

function storyTitle(entry: RegistryEntry) {
  const [title, reference = ""] = entry.title.split(" — ");
  return { title, reference };
}

function PatternView({ entry }: { entry: RegistryEntry }) {
  const shape = STUDY_GUIDES[entry.key].shape;
  const { title, reference } = storyTitle(entry);
  return (
    <div className="stack">
      <section className="card">
        <div className="eyebrow">The shape of the story</div>
        <h2 className="story-title">{title}</h2>
        <p className="muted">
          Jesus's stories often move the same way: a situation, something
          happens, someone responds, something changes, and there is a result.
          Here is {reference} in those five steps.
        </p>
        <ol className="shape">
          {SHAPE_STEPS.map(([key, label], i) => (
            <li key={key} className={i === SHAPE_STEPS.length - 1 ? "shape-end" : ""}>
              <span className="shape-label">{label}</span>
              <span className="shape-text">{shape[key]}</span>
            </li>
          ))}
        </ol>
      </section>
      <p className="muted small center">
        Open <strong>Compare</strong> to set this story beside another one.
      </p>
    </div>
  );
}

function PlainCompare({
  left,
  right,
  rightKey,
  setRightKey,
}: {
  left: RegistryEntry;
  right: RegistryEntry;
  rightKey: NarrativeKey;
  setRightKey: (key: NarrativeKey) => void;
}) {
  const a = STUDY_GUIDES[left.key].shape;
  const b = STUDY_GUIDES[right.key].shape;
  return (
    <div className="stack">
      <section className="card">
        <div className="eyebrow">Stories side by side</div>
        <h2 className="story-title">Different stories, the same shape</h2>
        <p className="muted">
          Put two stories next to each other and look for what they share.
        </p>
        <label className="compare-picker">
          <span>
            <strong>{storyTitle(left).title}</strong> compared with
          </span>
          <select
            value={rightKey}
            onChange={(e) => setRightKey(e.target.value as NarrativeKey)}
          >
            {ALL_KEYS.filter((key) => key !== left.key).map((key) => (
              <option key={key} value={key}>
                {storyTitle(REGISTRY[key]).title}
              </option>
            ))}
          </select>
        </label>
      </section>

      <div className="compare-grid" role="table" aria-label="Story comparison">
        <div className="compare-head" role="row">
          <span role="columnheader" />
          <span role="columnheader">{storyTitle(left).title}</span>
          <span role="columnheader">{storyTitle(right).title}</span>
        </div>
        {SHAPE_STEPS.map(([key, label]) => (
          <div key={key} className="compare-row" role="row">
            <span className="compare-label" role="rowheader">{label}</span>
            <span className="compare-cell" role="cell">
              <em>{storyTitle(left).title}</em>
              {a[key]}
            </span>
            <span className="compare-cell" role="cell">
              <em>{storyTitle(right).title}</em>
              {b[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StructureView({
  entry,
  plain,
  showMathRoles,
  setShowMathRoles,
}: {
  entry: RegistryEntry;
  plain: boolean;
  showMathRoles: boolean;
  setShowMathRoles: (next: boolean) => void;
}) {
  const roles = roleRows(entry);

  if (plain) return <PatternView entry={entry} />;

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section style={{ ...panel, padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".08em",
                color: muted,
                textTransform: "uppercase",
              }}
            >
              Parable algebra
            </div>
            <h2 style={{ margin: "5px 0 4px" }}>
              Concrete story → common transition grammar
            </h2>
            <p style={{ margin: 0, color: muted, fontSize: 13 }}>
              Sₜ₊₁ = δ(Sₜ, I, C, A?, R)
            </p>
          </div>

          <label
            style={{
              display: "inline-flex",
              gap: 8,
              alignItems: "center",
              fontSize: 13,
            }}
          >
            <input
              type="checkbox"
              checked={showMathRoles}
              onChange={(e) => setShowMathRoles(e.target.checked)}
            />
            Mathematical roles
          </label>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${roles.length}, minmax(105px, 1fr))`,
            gap: 6,
            marginTop: 18,
            overflowX: "auto",
          }}
        >
          {roles.map(([role, value], index) => (
            <React.Fragment key={role}>
              <div
                style={{
                  minWidth: 105,
                  padding: 12,
                  borderRadius: 9,
                  border: `1px solid ${line}`,
                  background: index === roles.length - 1 ? "#f3f7ff" : soft,
                }}
              >
                <div
                  style={{
                    fontSize: showMathRoles ? 20 : 11,
                    color: showMathRoles ? ink : muted,
                    fontWeight: 800,
                  }}
                >
                  {showMathRoles ? normalizedRole(role) : role.toUpperCase()}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    marginTop: 7,
                    color: showMathRoles ? muted : ink,
                  }}
                >
                  {showMathRoles ? role : value}
                </div>
                {showMathRoles && (
                  <div style={{ marginTop: 6, fontSize: 11, color: muted }}>
                    {value}
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </section>

      <section style={{ ...panel, padding: 20 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: ".08em",
            color: muted,
            textTransform: "uppercase",
          }}
        >
          What changes / what stays invariant
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginTop: 12,
          }}
          className="tcg-two-column"
        >
          <div>
            <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>
              Narrative variables
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: muted }}>
              <li>actors and objects</li>
              <li>setting and imagery</li>
              <li>quantities and temporal details</li>
              <li>specific response path</li>
            </ul>
          </div>
          <div>
            <h3 style={{ margin: "0 0 8px", fontSize: 15 }}>
              Structural invariants
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, color: muted }}>
              <li>identity and state</li>
              <li>input / encounter</li>
              <li>context and response</li>
              <li>transition and outcome</li>
              <li>provenance and authority constraints</li>
            </ul>
          </div>
        </div>
      </section>

      <AuthorityDemo />
    </div>
  );
}

function CompareView({
  plain,
  leftKey,
  rightKey,
  setRightKey,
}: {
  plain: boolean;
  leftKey: NarrativeKey;
  rightKey: NarrativeKey;
  setRightKey: (key: NarrativeKey) => void;
}) {
  const left = REGISTRY[leftKey];
  const right = REGISTRY[rightKey];
  const leftRoles = roleRows(left);
  const rightRoles = roleRows(right);

  const rows = leftRoles.map(([role, leftValue]) => {
    const rightValue =
      rightRoles.find(([candidate]) => candidate === role)?.[1] ?? "—";
    return [role, leftValue, rightValue] as const;
  });

  if (plain) {
    return (
      <PlainCompare
        left={left}
        right={right}
        rightKey={rightKey}
        setRightKey={setRightKey}
      />
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section style={{ ...panel, padding: 20 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".08em",
                color: muted,
                textTransform: "uppercase",
              }}
            >
              Structural isomorphism
            </div>
            <h2 style={{ margin: "5px 0 0" }}>
              Different story surfaces, comparable transition grammar
            </h2>
          </div>
          <select
            value={rightKey}
            onChange={(e) => setRightKey(e.target.value as NarrativeKey)}
          >
            {ALL_KEYS.map((key) => (
              <option key={key} value={key}>
                {REGISTRY[key].shortTitle}
              </option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: "auto", marginTop: 16 }}>
          <table
            style={{
              width: "100%",
              minWidth: 720,
              borderCollapse: "collapse",
              fontSize: 13,
            }}
          >
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: 9, borderBottom: `1px solid ${line}` }}>
                  Role
                </th>
                <th style={{ textAlign: "left", padding: 9, borderBottom: `1px solid ${line}` }}>
                  {left.shortTitle}
                </th>
                <th style={{ textAlign: "left", padding: 9, borderBottom: `1px solid ${line}` }}>
                  {right.shortTitle}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([role, leftValue, rightValue]) => (
                <tr key={role}>
                  <td style={{ padding: 9, borderBottom: `1px solid ${soft}`, fontWeight: 700 }}>
                    {normalizedRole(role)} · {role}
                  </td>
                  <td style={{ padding: 9, borderBottom: `1px solid ${soft}`, color: muted }}>
                    {leftValue}
                  </td>
                  <td style={{ padding: 9, borderBottom: `1px solid ${soft}`, color: muted }}>
                    {rightValue}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section style={{ ...panel, padding: 20 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr",
            gap: 14,
            alignItems: "center",
          }}
          className="tcg-compare-flow"
        >
          <div style={{ padding: 16, borderRadius: 10, background: soft }}>
            <strong>{left.shortTitle}</strong>
            <div style={{ marginTop: 8, color: muted, fontSize: 13 }}>
              concrete narrative
            </div>
          </div>
          <div style={{ color: muted, textAlign: "center" }}>
            <div>→ normalize →</div>
            <strong style={{ display: "block", marginTop: 6, color: ink }}>
              (S₀, I, C, A?, R, δ, S₁)
            </strong>
          </div>
          <div style={{ padding: 16, borderRadius: 10, background: soft }}>
            <strong>{right.shortTitle}</strong>
            <div style={{ marginTop: 8, color: muted, fontSize: 13 }}>
              concrete narrative
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...panel, padding: 20 }}>
        <h3 style={{ marginTop: 0 }}>Corpus comparison projection</h3>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 820,
              borderCollapse: "collapse",
              fontSize: 12,
            }}
          >
            <thead>
              <tr>
                {[
                  "Narrative",
                  "Events",
                  "Actors",
                  "Aggregates",
                  "Resources",
                  "Delegation",
                  "Return/Find",
                  "Care",
                  "Search",
                  "Divergence",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: 8,
                      borderBottom: `1px solid ${line}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PARABLE_COMPARISON.map((row) => (
                <tr key={row.narrativeId}>
                  <td style={{ padding: 8, borderBottom: `1px solid ${soft}` }}>
                    {row.title}
                  </td>
                  <td style={{ padding: 8, borderBottom: `1px solid ${soft}` }}>{row.eventCount}</td>
                  <td style={{ padding: 8, borderBottom: `1px solid ${soft}` }}>{row.actorCount}</td>
                  <td style={{ padding: 8, borderBottom: `1px solid ${soft}` }}>{row.aggregateCount}</td>
                  {[
                    row.hasResourceTransfer,
                    row.hasDelegationPattern,
                    row.hasReturnPattern,
                    row.hasCarePattern,
                    row.hasSearchPattern,
                    row.hasDivergentOutcomePattern,
                  ].map((value, i) => (
                    <td key={i} style={{ padding: 8, borderBottom: `1px solid ${soft}` }}>
                      {value ? "✓" : "—"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

const AUDIT_LANES = [
  ["text", "TEXT"],
  ["extraction", "EXTRACTION"],
  ["admitted", "ADMISSION / EVENT"],
  ["derived", "STATE / RULE / AUTHORIZATION"],
  ["interpretive", "INTERPRETATION"],
  ["application", "APPLICATION"],
] as const;

const EMPTY_LANE_REASON: Record<EpistemicLayer, string> = {
  text: "No source verses are attached to this narrative's extractions yet.",
  extraction: "No extractions are modeled for this narrative yet.",
  admitted: "No admitted events, actors, or entities are modeled yet.",
  derived:
    "No rules or rule authorizations are bound to this narrative yet, so no derived conclusions appear here.",
  interpretive: "No interpretive lens has been applied to this narrative yet.",
  application:
    "No application is modeled. An interpretation only becomes an application through an explicit, authorized normative bridge.",
};

type EdgeLine = {
  id: string;
  d: string;
  labelX: number;
  labelY: number;
  relation: string;
};

function edgePath(from: DOMRect, to: DOMRect, origin: DOMRect) {
  const sx = from.left + from.width / 2 - origin.left;
  const tx = to.left + to.width / 2 - origin.left;
  const sCy = from.top + from.height / 2;
  const tCy = to.top + to.height / 2;

  if (sCy < tCy - 10) {
    const sy = from.bottom - origin.top;
    const ty = to.top - origin.top;
    const my = (sy + ty) / 2;
    return {
      d: `M ${sx} ${sy} C ${sx} ${my}, ${tx} ${my}, ${tx} ${ty}`,
      labelX: (sx + tx) / 2,
      labelY: my,
    };
  }
  if (sCy > tCy + 10) {
    const sy = from.top - origin.top;
    const ty = to.bottom - origin.top;
    const my = (sy + ty) / 2;
    return {
      d: `M ${sx} ${sy} C ${sx} ${my}, ${tx} ${my}, ${tx} ${ty}`,
      labelX: (sx + tx) / 2,
      labelY: my,
    };
  }
  // Same lane: arc over the top of both nodes.
  const sy = from.top - origin.top;
  const ty = to.top - origin.top;
  const lift = Math.min(28, 10 + Math.abs(tx - sx) / 8);
  const cy = Math.min(sy, ty) - lift;
  return {
    d: `M ${sx} ${sy} C ${sx} ${cy}, ${tx} ${cy}, ${tx} ${ty}`,
    labelX: (sx + tx) / 2,
    labelY: cy + lift / 4,
  };
}

function nodeDisplayLabel(node: GraphNode): string {
  if (node.kind === "command") return `command: ${node.label}`;
  // Authorization nodes are labelled only by status; name what they authorize.
  if (node.id.startsWith("authorization:")) {
    return `${String(node.payloadId).replace(/^Authz-/, "")} · ${node.label}`;
  }
  return node.label;
}

function auditGraph(entry: RegistryEntry): NarrativeGraph {
  return withProvenanceLayers(entry.audit ?? entry.lensed, entry.narrative);
}

function AuditView({
  plain,
  ...props
}: {
  plain: boolean;
  entry: RegistryEntry;
  enabledLayers: Set<EpistemicLayer>;
  toggleLayer: (layer: EpistemicLayer) => void;
}) {
  const graph = useMemo(() => auditGraph(props.entry), [props.entry]);
  if (plain) {
    return <SourcesView narrative={props.entry.narrative} graph={graph} />;
  }
  return <ModelAuditView {...props} graph={graph} />;
}

function ModelAuditView({
  entry,
  graph,
  enabledLayers,
  toggleLayer,
}: {
  entry: RegistryEntry;
  graph: NarrativeGraph;
  enabledLayers: Set<EpistemicLayer>;
  toggleLayer: (layer: EpistemicLayer) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lines, setLines] = useState<EdgeLine[]>([]);
  const [layoutTick, setLayoutTick] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());

  const nodesById = useMemo(
    () => new Map(graph.nodes.map((n) => [n.id as string, n])),
    [graph]
  );
  const selected = selectedId ? nodesById.get(selectedId) : undefined;
  const lineage = useMemo(
    () => (selectedId ? traceLineage(graph, selectedId) : null),
    [graph, selectedId]
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => setLayoutTick((t) => t + 1));
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !lineage) {
      setLines([]);
      return;
    }
    const origin = container.getBoundingClientRect();
    const next: EdgeLine[] = [];
    for (const edge of lineage.edges) {
      const from = nodeRefs.current.get(edge.source);
      const to = nodeRefs.current.get(edge.target);
      if (!from || !to) continue;
      next.push({
        id: edge.id,
        relation: edge.relation,
        ...edgePath(
          from.getBoundingClientRect(),
          to.getBoundingClientRect(),
          origin
        ),
      });
    }
    setLines(next);
  }, [lineage, enabledLayers, layoutTick]);

  const nodeLabel = (id: string) => {
    const node = nodesById.get(id);
    return node ? nodeDisplayLabel(node) : id;
  };
  const layerRank = (id: string) =>
    LAYERS.indexOf(nodesById.get(id)?.epistemicLayer ?? "application");

  const pathEdges = lineage
    ? [...lineage.edges].sort(
        (a, b) =>
          layerRank(a.source) - layerRank(b.source) ||
          layerRank(a.target) - layerRank(b.target)
      )
    : [];

  const selectedExtraction =
    selected?.epistemicLayer === "extraction"
      ? entry.narrative.extractions.find((x) => x.id === selected.payloadId)
      : undefined;
  const selectedAdmission = selectedExtraction
    ? admissionForExtraction(entry.narrative, selectedExtraction)
    : undefined;

  function nodeStyle(node: GraphNode): React.CSSProperties {
    const isSelected = node.id === selectedId;
    const inPath = lineage?.nodeIds.has(node.id) ?? false;
    const dimmed = Boolean(lineage) && !inPath;
    return {
      position: "relative",
      zIndex: 1,
      minHeight: 0,
      padding: "6px 8px",
      borderRadius: 7,
      border: `1px solid ${isSelected ? current : inPath ? replayedLine : line}`,
      boxShadow: isSelected ? `0 0 0 2px ${currentSoft}` : "none",
      fontSize: 11,
      fontWeight: isSelected ? 700 : 400,
      color: dimmed ? "#a3adbd" : ink,
      background: isSelected ? currentSoft : inPath ? replayedSoft : "#fff",
      transition: "color .15s, background .15s",
    };
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <section style={{ ...panel, padding: 18 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={eyebrow}>Audit projection</div>
            <h2 style={{ margin: "5px 0 0" }}>
              TEXT → EXTRACTION → ADMISSION → EVENT → STATE → RULE →
              AUTHORIZATION → INTERPRETATION → APPLICATION
            </h2>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {LAYERS.map((layer) => (
              <label key={layer} style={{ fontSize: 12 }}>
                <input
                  type="checkbox"
                  checked={enabledLayers.has(layer)}
                  onChange={() => toggleLayer(layer)}
                />{" "}
                {layer}
              </label>
            ))}
          </div>
        </div>
      </section>

      <section
        style={{ ...panel, padding: 16, overflowX: "auto" }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setSelectedId(null);
        }}
      >
        <p style={{ margin: "0 0 6px", fontSize: 12, color: muted }}>
          Select any node to trace everything it depends on and everything
          derived from it. Press Esc to clear.
        </p>
        <div
          ref={containerRef}
          style={{ minWidth: 740, display: "grid", gap: 8, position: "relative" }}
        >
          <svg
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              overflow: "visible",
              zIndex: 0,
            }}
          >
            <defs>
              <marker
                id="tcg-arrow"
                viewBox="0 0 8 8"
                refX="7"
                refY="4"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M0,0 L8,4 L0,8 z" fill={current} />
              </marker>
            </defs>
            {lines.map((l) => (
              <g key={l.id}>
                <path
                  d={l.d}
                  fill="none"
                  stroke={current}
                  strokeOpacity={0.55}
                  strokeWidth={1.5}
                  markerEnd="url(#tcg-arrow)"
                />
                <text
                  x={l.labelX}
                  y={l.labelY}
                  textAnchor="middle"
                  dy="-3"
                  fontSize={9}
                  fill={current}
                  stroke="#fff"
                  strokeWidth={3}
                  paintOrder="stroke"
                >
                  {l.relation}
                </text>
              </g>
            ))}
          </svg>

          {AUDIT_LANES.map(([layer, label]) => {
            if (!enabledLayers.has(layer)) return null;
            const laneNodes = graph.nodes.filter(
              (n) => n.epistemicLayer === layer
            );
            return (
              <div
                key={layer}
                style={{
                  display: "grid",
                  gridTemplateColumns: "145px 1fr",
                  gap: 12,
                  alignItems: "start",
                  borderBottom: `1px dashed ${line}`,
                  padding: "16px 0 10px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 800,
                    color: muted,
                    letterSpacing: ".06em",
                  }}
                >
                  {label}
                </div>
                <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
                  {laneNodes.length === 0 ? (
                    <span style={{ color: muted, fontSize: 12 }}>
                      {EMPTY_LANE_REASON[layer]}
                    </span>
                  ) : (
                    laneNodes.map((node) => (
                      <button
                        type="button"
                        key={node.id}
                        ref={(el) => {
                          if (el) nodeRefs.current.set(node.id, el);
                          else nodeRefs.current.delete(node.id);
                        }}
                        aria-pressed={node.id === selectedId}
                        onClick={() =>
                          setSelectedId((cur) =>
                            cur === node.id ? null : node.id
                          )
                        }
                        style={nodeStyle(node)}
                        title={`${node.kind} · ${String(node.payloadId)}`}
                      >
                        {nodeDisplayLabel(node)}
                      </button>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section style={{ ...panel, padding: 18 }} aria-live="polite">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            alignItems: "baseline",
            flexWrap: "wrap",
          }}
        >
          <div style={eyebrow}>Provenance trace</div>
          {selected && (
            <button type="button" onClick={() => setSelectedId(null)}>
              Clear selection
            </button>
          )}
        </div>

        {!selected ? (
          <p style={{ margin: "8px 0 0", fontSize: 13, color: muted }}>
            Nothing selected. Try an event in the ADMISSION / EVENT lane to see
            the verse and extraction it was admitted from and the
            interpretations built on it.
          </p>
        ) : (
          <>
            <h3 style={{ margin: "6px 0 2px" }}>
              {nodeDisplayLabel(selected)}
            </h3>
            <div style={{ fontSize: 12, color: muted }}>
              {selected.kind} · {selected.epistemicLayer} layer
              {selected.sourceRef ? ` · ${selected.sourceRef}` : ""}
            </div>

            {selectedExtraction && (
              <div
                style={{
                  marginTop: 10,
                  padding: 10,
                  borderRadius: 8,
                  background: soft,
                  fontSize: 13,
                }}
              >
                “{selectedExtraction.sourceSpan}”
                {selectedAdmission && (
                  <div style={{ marginTop: 6, fontSize: 12, color: muted }}>
                    Admission: {selectedAdmission.outcome} ·{" "}
                    {selectedAdmission.epistemicStatus} ·{" "}
                    {selectedAdmission.authentication.basis}
                  </div>
                )}
              </div>
            )}

            {pathEdges.length === 0 ? (
              <p style={{ margin: "10px 0 0", fontSize: 12, color: muted }}>
                This node has no recorded links to other nodes.
              </p>
            ) : (
              <ol
                style={{
                  margin: "10px 0 0",
                  paddingLeft: 20,
                  display: "grid",
                  gap: 4,
                  fontSize: 12,
                }}
              >
                {pathEdges.map((edge) => (
                  <li key={edge.id}>
                    <button
                      type="button"
                      className="tcg-link"
                      onClick={() => setSelectedId(edge.source)}
                    >
                      {nodeLabel(edge.source)}
                    </button>{" "}
                    <span style={{ color: muted }}>—{edge.relation}→</span>{" "}
                    <button
                      type="button"
                      className="tcg-link"
                      onClick={() => setSelectedId(edge.target)}
                    >
                      {nodeLabel(edge.target)}
                    </button>
                    {!enabledLayers.has(
                      nodesById.get(edge.source)?.epistemicLayer ?? "text"
                    ) ||
                    !enabledLayers.has(
                      nodesById.get(edge.target)?.epistemicLayer ?? "text"
                    ) ? (
                      <span style={{ color: muted }}> (hidden layer)</span>
                    ) : null}
                  </li>
                ))}
              </ol>
            )}
          </>
        )}
      </section>

      <section style={{ ...panel, padding: 18 }}>
        <h3 style={{ marginTop: 0 }}>Evaluation questions</h3>
        <ol style={{ marginBottom: 0, color: muted }}>
          <li>Can each admitted event be traced back to a source extraction?</li>
          <li>Does replay reconstruct state deterministically?</li>
          <li>Can conflicting claims remain distinct from computed state?</li>
          <li>Does disabling authority/rules remove dependent conclusions?</li>
          <li>Can interpretation become application only through an explicit bridge?</li>
        </ol>
      </section>
    </div>
  );
}

const MODEL_MODE_KEY = "tcg:model-mode";

/** Story mode is the default; `?mode=model` or a saved choice opens the model. */
function readModelMode(): boolean {
  if (typeof window === "undefined") return false;
  const param = new URLSearchParams(window.location.search).get("mode");
  if (param) return param === "model";
  try {
    return localStorage.getItem(MODEL_MODE_KEY) === "1";
  } catch {
    return false;
  }
}

const REPLAYERS: Partial<Record<NarrativeKey, (events: readonly Event[]) => unknown>> = {};

/** A stable replay function per story, so StoryView can memoize on it. */
function replayFor(key: NarrativeKey) {
  return (REPLAYERS[key] ??= (events) => replaySnapshot(key, events));
}

export default function TuringCompleteGospelWorkbench() {
  const [narrativeKey, setNarrativeKey] =
    useState<NarrativeKey>("good-samaritan");
  const [viewMode, setViewMode] = useState<ViewMode>("reader");
  const [compareKey, setCompareKey] = useState<NarrativeKey>("sower");
  const [replayIndex, setReplayIndex] = useState(0);
  const [showMathRoles, setShowMathRoles] = useState(false);
  const [enabledLayers, setEnabledLayers] = useState<Set<EpistemicLayer>>(
    new Set(LAYERS)
  );
  const [evaluationStep, setEvaluationStep] = useState<number | null>(null);
  const [modelMode, setModelModeState] = useState<boolean>(readModelMode);

  function setModelMode(next: boolean) {
    setModelModeState(next);
    try {
      localStorage.setItem(MODEL_MODE_KEY, next ? "1" : "0");
    } catch {
      // Storage can be unavailable (private mode); the switch still works.
    }
  }

  const entry = REGISTRY[narrativeKey];

  const evaluationMessages = [
    "Trace an admitted event back to its source and extraction.",
    "Replay the event stream and verify that aggregate state follows the event prefix.",
    "Use Mark 5 to inspect conflicting state claims without silently collapsing them.",
    "Remove authority or disable a rule and verify that dependent fulfillment or conclusions fail.",
    "Inspect an application path and verify that interpretation does not silently become obligation.",
  ];

  function toggleLayer(layer: EpistemicLayer) {
    setEnabledLayers((current) => {
      const next = new Set(current);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }

  function changeNarrative(next: NarrativeKey) {
    setNarrativeKey(next);
    setReplayIndex(0);
  }

  const tabs = (
    [
      ["reader", modelMode ? "Reader" : "Story", ICONS.reader],
      ["structure", modelMode ? "Structure" : "Pattern", ICONS.structure],
      ["compare", "Compare", ICONS.compare],
      ["audit", modelMode ? "Audit" : "Sources", ICONS.audit],
    ] as const
  ).map(([mode, label, icon]) => (
    <button
      type="button"
      key={mode}
      role="tab"
      aria-selected={viewMode === mode}
      className="tab"
      onClick={() => setViewMode(mode)}
    >
      {icon}
      <span>{label}</span>
    </button>
  ));

  return (
    <div className={`app${modelMode ? " app-model" : ""}`}>
      <header className="topbar">
        <div className="topbar-brand">
          <div className="brand-kicker">
            {modelMode
              ? "Provenance-aware semantic reasoning workbench"
              : "Bible study companion"}
          </div>
          <h1 className="brand-title">
            The Turing Complete Gospel of Jesus Christ
          </h1>
        </div>

        <div className="topbar-controls">
          <label className="story-picker">
            <span className="visually-hidden">Choose a story</span>
            <select
              value={narrativeKey}
              onChange={(e) => changeNarrative(e.target.value as NarrativeKey)}
            >
              {ALL_KEYS.map((key) => (
                <option key={key} value={key}>
                  {modelMode
                    ? REGISTRY[key].title
                    : REGISTRY[key].title.split(" — ")[0]}
                </option>
              ))}
            </select>
          </label>
          <label className="switch">
            <input
              type="checkbox"
              checked={modelMode}
              onChange={(e) => setModelMode(e.target.checked)}
            />
            <span className="switch-track" aria-hidden="true" />
            <span>Show the model</span>
          </label>
        </div>

        <nav className="tabs tabs-top" role="tablist" aria-label="Views">
          {tabs}
        </nav>
      </header>

      <main className="content">
        {viewMode === "reader" &&
          (modelMode ? (
            <ReaderView
              entry={entry}
              replayIndex={replayIndex}
              setReplayIndex={setReplayIndex}
            />
          ) : (
            <StoryView
              key={narrativeKey}
              storyKey={narrativeKey}
              title={entry.title.split(" — ")[0]}
              reference={entry.title.split(" — ")[1] ?? ""}
              narrative={entry.narrative}
              replay={replayFor(narrativeKey)}
              step={replayIndex}
              setStep={setReplayIndex}
            />
          ))}

        {viewMode === "structure" && (
          <StructureView
            entry={entry}
            plain={!modelMode}
            showMathRoles={showMathRoles}
            setShowMathRoles={setShowMathRoles}
          />
        )}

        {viewMode === "compare" && (
          <CompareView
            plain={!modelMode}
            leftKey={narrativeKey}
            rightKey={
              compareKey === narrativeKey
                ? ALL_KEYS.find((key) => key !== narrativeKey)!
                : compareKey
            }
            setRightKey={setCompareKey}
          />
        )}

        {viewMode === "audit" && (
          <AuditView
            key={narrativeKey}
            plain={!modelMode}
            entry={entry}
            enabledLayers={enabledLayers}
            toggleLayer={toggleLayer}
          />
        )}

        {modelMode && (
          <section
            style={{
              ...panel,
              padding: 16,
              marginTop: 18,
              background: "#fbfcfe",
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: muted,
                letterSpacing: ".07em",
                textTransform: "uppercase",
              }}
            >
              Evaluation mode
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
                gap: 7,
                marginTop: 10,
              }}
              className="tcg-five-column"
            >
              {["Provenance", "Replay", "Conflict", "Authority", "Application"].map(
                (label, index) => (
                  <button
                    type="button"
                    key={label}
                    onClick={() => setEvaluationStep(index)}
                    style={{
                      minHeight: 42,
                      borderRadius: 7,
                      border: `1px solid ${
                        evaluationStep === index ? "#4b648e" : line
                      }`,
                      background: evaluationStep === index ? "#eef3fb" : "#fff",
                      fontWeight: evaluationStep === index ? 700 : 500,
                    }}
                  >
                    {index + 1}. {label}
                  </button>
                )
              )}
            </div>

            <div
              style={{
                marginTop: 10,
                minHeight: 38,
                fontSize: 13,
                color: muted,
              }}
            >
              {evaluationStep === null
                ? "Choose an evaluation step to surface the question the system should answer."
                : evaluationMessages[evaluationStep]}
            </div>
          </section>
        )}
      </main>

      <nav className="tabs tabs-bottom" role="tablist" aria-label="Views">
        {tabs}
      </nav>
    </div>
  );
}

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
} as const;

const ICONS = {
  reader: (
    <svg {...ICON_PROPS}>
      <path d="M12 6c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5v-13c-3-.5-6 0-8 1.5z" />
      <path d="M12 6v13" />
    </svg>
  ),
  structure: (
    <svg {...ICON_PROPS}>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
      <path d="M7 12h3M14 12h3" />
    </svg>
  ),
  compare: (
    <svg {...ICON_PROPS}>
      <rect x="3" y="4" width="7" height="16" rx="1.5" />
      <rect x="14" y="4" width="7" height="16" rx="1.5" />
    </svg>
  ),
  audit: (
    <svg {...ICON_PROPS}>
      <circle cx="12" cy="5" r="2" />
      <circle cx="12" cy="19" r="2" />
      <path d="M12 7v10" />
      <path d="M8 11l4-4 4 4" />
    </svg>
  ),
};
