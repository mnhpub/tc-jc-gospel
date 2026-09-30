import { describe, expect, it } from "vitest";

import example from "../cases/illustrative-prior-authorization.json";
import {
  COMPARISON_NOTICE,
  compareCase,
  internalModels,
  renderComparisonMarkdown,
} from "./comparison";
import { loadExternalCase, type LoadedCase } from "./externalCase";

function loaded(input: unknown): LoadedCase {
  const result = loadExternalCase(input);
  if (!result.ok) throw new Error(JSON.stringify(result.issues, null, 2));
  return result.loaded;
}

const report = compareCase(loaded(example));
const act = (id: string) => {
  const found = report.acts.find((a) => a.id === id);
  if (!found) throw new Error(`No act ${id}`);
  return found;
};

describe("Internal models", () => {
  const models = internalModels();

  it("covers all six stories and says which record authority", () => {
    expect(models.map((m) => m.story)).toEqual([
      "mark-5",
      "good-samaritan",
      "prodigal-son",
      "sower",
      "talents",
      "lost-sheep",
    ]);
    expect(models.filter((m) => m.authorityModelled).map((m) => m.story)).toEqual(["mark-5", "talents"]);
  });

  it("resolves the scripture acts with the same rules as external acts", () => {
    const acts = models.flatMap((m) => m.acts);
    expect(acts.map((a) => [a.story, a.pattern.outcome, a.pattern.delegation])).toEqual([
      ["mark-5", "authorized", "direct"],
      ["talents", "authorized", "delegated"],
      ["talents", "authorized", "delegated"],
      ["talents", "authorized", "delegated"],
    ]);
    expect(acts.map((a) => a.verse)).toEqual(["Mark 5:41", "Matthew 25:16", "Matthew 25:17", "Matthew 25:18"]);
  });
});

describe("Comparing the illustrative case", () => {
  it("carries the notice that the report is structural only", () => {
    expect(report.notice).toBe(COMPARISON_NOTICE);
    expect(report.illustrative).toBe(true);
  });

  it("classifies each act by outcome and delegation", () => {
    expect(report.acts.map((a) => [a.id, a.pattern.outcome, a.pattern.delegation])).toEqual([
      ["act-reviewed-denial", "authorized", "sub-delegated"],
      ["act-automated-denial", "exceeds-scope", "delegated"],
      ["act-reported-targets", "attribution-undetermined", "none"],
    ]);
  });

  it("lines the reviewed denial up with authorized acts in scripture, by outcome only", () => {
    const a = act("act-reviewed-denial");
    expect(a.chain).toEqual(["Clinical Reviewer A", "Example Review Co.", "Example Health Plan"]);
    expect(a.matches.map((m) => [m.act.story, m.strength])).toEqual([
      ["mark-5", "outcome"],
      ["talents", "outcome"],
      ["talents", "outcome"],
      ["talents", "outcome"],
    ]);
    expect(a.questions.some((q) => q.includes("Matthew 25:19"))).toBe(true);
  });

  it("finds a same-pattern match when the delegation depth matches", () => {
    // Collapse the sub-delegation: the vendor acts under the plan's grant directly.
    const direct = JSON.parse(JSON.stringify(example));
    direct.acts[0].actor = "example-review-co";
    direct.acts[0].authority = "grant-review-vendor";
    const r = compareCase(loaded(direct));
    const a = r.acts[0];

    expect(a.pattern).toEqual({ outcome: "authorized", delegation: "delegated" });
    expect(a.matches.filter((m) => m.strength === "same").map((m) => m.act.story)).toEqual([
      "talents",
      "talents",
      "talents",
    ]);
    expect(a.questions.some((q) => q.includes("Matthew 25:19"))).toBe(true);
    expect(r.stories.find((s) => s.story === "talents")?.sharedActs).toEqual(["act-reviewed-denial"]);
  });

  it("has nothing in scripture to match scope overreach or undetermined attribution", () => {
    expect(act("act-automated-denial").matches).toEqual([]);
    expect(act("act-reported-targets").matches).toEqual([]);
    expect(report.unmatchedOutcomes).toEqual(["exceeds-scope", "attribution-undetermined"]);
  });

  it("names no responsible party for an alleged act, and asks what would establish it", () => {
    const a = act("act-reported-targets");
    expect(a.attribution).toBe("alleged");
    expect(a.responsible).toEqual([]);
    expect(a.questions[0]).toMatch(/court judgment, an official record/);
  });

  it("asks questions and never states a verdict", () => {
    const text = renderComparisonMarkdown(report).toLowerCase();
    for (const word of ["guilty", "liable", "at fault", "wrongful", "unlawful", "should be punished"]) {
      expect(text).not.toContain(word);
    }
    for (const a of report.acts) expect(a.questions.length).toBeGreaterThan(0);
  });

  it("lays the shapes side by side without scoring them", () => {
    expect(report.shape.map((r) => r.step)).toEqual([
      "At the start",
      "What happens",
      "The response",
      "What changes",
      "How it ends",
    ]);
    expect(report.shape[0].external).toBe(example.shape.start);
    expect(report.shape[0].stories.talents).toBe("A master entrusts money to three servants.");
  });
});

describe("Committed report", () => {
  it("matches the generator (npx vitest run -u to regenerate)", async () => {
    await expect(renderComparisonMarkdown(report)).toMatchFileSnapshot(
      "../cases/reports/illustrative-prior-authorization.md"
    );
  });
});
