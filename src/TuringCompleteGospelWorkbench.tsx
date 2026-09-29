import React, { useMemo, useState } from "react";

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
  type EpistemicLayer,
  type Narrative,
  type NarrativeGraph,
  type ParableAlgebra,
} from "./turing-complete-gospel-of-jesus-christ";

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

function sourceLabel(p: any): string {
  const s = p?.source;
  if (!s) return "Source unavailable";
  const range =
    s.verseEnd && s.verseEnd !== s.verseStart
      ? `${s.verseStart}–${s.verseEnd}`
      : String(s.verseStart);
  return `${s.work} ${s.chapter}:${range}`;
}

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

function flattenSnapshot(
  value: unknown,
  prefix = ""
): Array<[string, string]> {
  if (value === null || value === undefined) return [];
  if (typeof value !== "object") return [[prefix || "value", String(value)]];
  const out: Array<[string, string]> = [];
  for (const [key, next] of Object.entries(value as Record<string, unknown>)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (next && typeof next === "object" && !Array.isArray(next)) {
      out.push(...flattenSnapshot(next, name));
    } else if (!Array.isArray(next)) {
      out.push([name, String(next)]);
    }
  }
  return out.slice(0, 20);
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

function ReaderView({
  entry,
  replayIndex,
  setReplayIndex,
}: {
  entry: RegistryEntry;
  replayIndex: number;
  setReplayIndex: (n: number) => void;
}) {
  const events = entry.narrative.events;
  const visible = events.slice(0, replayIndex);
  const snapshot = replaySnapshot(entry.key, visible);

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
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".08em",
              color: muted,
              textTransform: "uppercase",
            }}
          >
            Narrative evidence
          </div>
          <h2 style={{ margin: "6px 0 14px", fontSize: 21 }}>
            {entry.title}
          </h2>

          <div style={{ display: "grid", gap: 8 }}>
            {entry.narrative.extractions.length === 0 ? (
              <p style={{ color: muted }}>
                This seed has not yet been expanded into visible extraction
                spans.
              </p>
            ) : (
              entry.narrative.extractions.map((x, index) => (
                <div
                  key={x.id}
                  style={{
                    padding: "11px 12px",
                    borderRadius: 8,
                    background: index < replayIndex ? "#f3f7ff" : soft,
                    border: `1px solid ${
                      index < replayIndex ? "#b9c9e8" : line
                    }`,
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
                    <span>{sourceLabel(x.source)}</span>
                    <span>{x.modality}</span>
                  </div>
                  <div style={{ marginTop: 5, fontSize: 14 }}>
                    “{x.sourceSpan}”
                  </div>
                  <div style={{ marginTop: 5, fontSize: 12, color: muted }}>
                    extraction → {x.predicate}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section style={{ ...panel, padding: 18 }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: ".08em",
              color: muted,
              textTransform: "uppercase",
            }}
          >
            Replay state
          </div>
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
            <button type="button" onClick={() => setReplayIndex(events.length)}>
              Replay all
            </button>
          </div>

          {visible.length > 0 && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: "#f8fafc",
                marginBottom: 14,
              }}
            >
              <div style={{ fontSize: 11, color: muted }}>CURRENT EVENT</div>
              <div style={{ fontWeight: 700, marginTop: 3 }}>
                {visible[visible.length - 1].operation}
              </div>
              <div style={{ color: muted, fontSize: 12, marginTop: 3 }}>
                {sourceLabel(visible[visible.length - 1].provenance?.[0])}
              </div>
            </div>
          )}

          <div style={{ display: "grid", gap: 5 }}>
            {flattenSnapshot(snapshot).map(([key, value]) => (
              <div
                key={key}
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0,1fr) auto",
                  gap: 12,
                  fontSize: 12,
                  borderBottom: `1px solid ${soft}`,
                  paddingBottom: 4,
                }}
              >
                <span style={{ color: muted }}>{key}</span>
                <span style={{ textAlign: "right", fontWeight: 600 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section style={{ ...panel, padding: 18 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto 1fr auto 1fr",
            gap: 10,
            alignItems: "stretch",
          }}
          className="tcg-transition-grid"
        >
          <div style={{ padding: 14, background: soft, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: muted }}>BEFORE</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>
              state at step {Math.max(0, replayIndex - 1)}
            </div>
          </div>
          <div style={{ alignSelf: "center", color: muted }}>→</div>
          <div style={{ padding: 14, background: "#f3f7ff", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: muted }}>EVENT</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>
              {visible.length ? visible[visible.length - 1].operation : "—"}
            </div>
          </div>
          <div style={{ alignSelf: "center", color: muted }}>→</div>
          <div style={{ padding: 14, background: soft, borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: muted }}>AFTER</div>
            <div style={{ fontWeight: 700, marginTop: 4 }}>
              state at step {replayIndex}
            </div>
          </div>
        </div>
      </section>
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

function StructureView({
  entry,
  showMathRoles,
  setShowMathRoles,
}: {
  entry: RegistryEntry;
  showMathRoles: boolean;
  setShowMathRoles: (next: boolean) => void;
}) {
  const roles = roleRows(entry);

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
  leftKey,
  rightKey,
  setRightKey,
}: {
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

function AuditView({
  entry,
  enabledLayers,
  toggleLayer,
}: {
  entry: RegistryEntry;
  enabledLayers: Set<EpistemicLayer>;
  toggleLayer: (layer: EpistemicLayer) => void;
}) {
  const graph = entry.lensed;
  const nodes = graph.nodes.filter((n) => enabledLayers.has(n.epistemicLayer));
  const lanes = [
    ["text", "TEXT"],
    ["extraction", "EXTRACTION"],
    ["admitted", "ADMISSION / EVENT"],
    ["derived", "STATE / RULE / AUTHORIZATION"],
    ["interpretive", "INTERPRETATION"],
    ["application", "APPLICATION"],
  ] as const;

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
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: ".08em",
                color: muted,
                textTransform: "uppercase",
              }}
            >
              Audit projection
            </div>
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

      <section style={{ ...panel, padding: 16, overflowX: "auto" }}>
        <div style={{ minWidth: 740, display: "grid", gap: 8 }}>
          {lanes.map(([layer, label]) => {
            const laneNodes = nodes.filter((n) => n.epistemicLayer === layer);
            if (!enabledLayers.has(layer as EpistemicLayer)) return null;
            return (
              <div
                key={layer}
                style={{
                  display: "grid",
                  gridTemplateColumns: "145px 1fr",
                  gap: 12,
                  alignItems: "start",
                  borderBottom: `1px dashed ${line}`,
                  padding: "10px 0",
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
                    <span style={{ color: muted, fontSize: 12 }}>—</span>
                  ) : (
                    laneNodes.map((node) => (
                      <span
                        key={node.id}
                        style={{
                          padding: "6px 8px",
                          borderRadius: 7,
                          border: `1px solid ${line}`,
                          fontSize: 11,
                          background: "#fff",
                        }}
                        title={String(node.payloadId)}
                      >
                        {node.label}
                      </span>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
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

  return (
    <main
      style={{
        maxWidth: 1380,
        margin: "0 auto",
        padding: "24px clamp(14px, 3vw, 32px) 48px",
        color: ink,
        fontFamily:
          'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
    >
      <header style={{ marginBottom: 18 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: ".09em",
            color: muted,
            textTransform: "uppercase",
          }}
        >
          Provenance-aware semantic reasoning workbench
        </div>
        <h1
          style={{
            margin: "5px 0 5px",
            fontSize: "clamp(25px, 4vw, 38px)",
            letterSpacing: "-.035em",
          }}
        >
          The Turing Complete Gospel of Jesus Christ
        </h1>
        <p style={{ margin: 0, color: muted, maxWidth: 900 }}>
          Explore how distinct Gospel narratives instantiate a common
          state-transition grammar while preserving source, authority,
          interpretation, and application boundaries.
        </p>
      </header>

      <nav
        style={{
          ...panel,
          padding: 10,
          display: "flex",
          justifyContent: "space-between",
          gap: 10,
          flexWrap: "wrap",
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(
            [
              ["reader", "Reader"],
              ["structure", "Structure"],
              ["compare", "Compare"],
              ["audit", "Audit"],
            ] as const
          ).map(([mode, label]) => (
            <button
              type="button"
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                border: `1px solid ${viewMode === mode ? "#4b648e" : line}`,
                background: viewMode === mode ? "#eef3fb" : "#fff",
                borderRadius: 7,
                padding: "7px 12px",
                fontWeight: viewMode === mode ? 700 : 500,
              }}
            >
              {label}
            </button>
          ))}
        </div>

        <select
          value={narrativeKey}
          onChange={(e) => changeNarrative(e.target.value as NarrativeKey)}
          aria-label="Select Gospel narrative"
        >
          {ALL_KEYS.map((key) => (
            <option key={key} value={key}>
              {REGISTRY[key].title}
            </option>
          ))}
        </select>
      </nav>

      {viewMode === "reader" && (
        <ReaderView
          entry={entry}
          replayIndex={replayIndex}
          setReplayIndex={setReplayIndex}
        />
      )}

      {viewMode === "structure" && (
        <StructureView
          entry={entry}
          showMathRoles={showMathRoles}
          setShowMathRoles={setShowMathRoles}
        />
      )}

      {viewMode === "compare" && (
        <CompareView
          leftKey={narrativeKey}
          rightKey={compareKey}
          setRightKey={setCompareKey}
        />
      )}

      {viewMode === "audit" && (
        <AuditView
          entry={entry}
          enabledLayers={enabledLayers}
          toggleLayer={toggleLayer}
        />
      )}

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
    </main>
  );
}
