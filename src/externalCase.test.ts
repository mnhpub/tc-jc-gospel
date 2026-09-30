import { describe, expect, it } from "vitest";

import example from "../cases/illustrative-prior-authorization.json";
import { loadExternalCase, loadExternalCases, type LoadedCase } from "./externalCase";

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

function loaded(input: unknown): LoadedCase {
  const result = loadExternalCase(input);
  if (!result.ok) throw new Error(JSON.stringify(result.issues, null, 2));
  return result.loaded;
}

const act = (c: LoadedCase, id: string) => {
  const found = c.acts.find((a) => a.source.id === id);
  if (!found) throw new Error(`No act ${id}`);
  return found;
};

describe("Illustrative prior-authorization case", () => {
  const c = loaded(example);

  it("loads the case and builds the authority context", () => {
    expect(c.case.illustrative).toBe(true);
    expect(c.context.sources.map((s) => s.bearer)).toEqual(["example-health-plan"]);
    expect(c.context.grants.map((g) => g.id)).toEqual(["grant-review-vendor", "grant-clinical-reviewer"]);
  });

  it("traces the reviewed denial through the vendor to the plan", () => {
    const { resolution } = act(c, "act-reviewed-denial");
    expect(resolution.outcome).toBe("authorized");
    expect(resolution.responsible.map((r) => [r.party, r.role])).toEqual([
      ["clinical-reviewer-a", "actor"],
      ["example-review-co", "delegator"],
      ["example-health-plan", "delegator"],
    ]);
  });

  it("finds the automated denial outside the scope the plan granted", () => {
    const { resolution } = act(c, "act-automated-denial");
    expect(resolution.outcome).toBe("exceeds-scope");
    expect(resolution.responsible.map((r) => r.party)).toEqual(["example-review-co"]);
  });

  it("downgrades a claim backed only by a news report to alleged", () => {
    const reported = act(c, "act-reported-targets");
    expect(reported.source.attribution).toBe("established");
    expect(reported.act.attribution).toBe("alleged");
    expect(reported.resolution.outcome).toBe("attribution-undetermined");
    expect(c.issues.some((i) => i.path === "$.acts[2].attribution")).toBe(true);
  });

  it("flags every problem as a warning, with the rule code where there is one", () => {
    expect(c.issues.every((i) => i.severity === "warning")).toBe(true);
    const codes = c.issues.map((i) => [i.path, i.code]);
    expect(codes).toContainEqual(["$.acts[1]", "R004"]);
    expect(codes).toContainEqual(["$.acts[2]", "R023"]);
    expect(c.issues.some((i) => i.path === "$.acts[0]")).toBe(false);
  });
});

describe("Structural validation", () => {
  it("rejects a non-object", () => {
    const result = loadExternalCase("not a case");
    expect(result.ok).toBe(false);
  });

  it("rejects the wrong schema version and missing fields, reporting every problem", () => {
    const bad = clone(example) as Record<string, unknown>;
    bad.schemaVersion = 2;
    delete bad.title;
    const result = loadExternalCase(bad);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      const paths = result.issues.map((i) => i.path);
      expect(paths).toContain("$.schemaVersion");
      expect(paths).toContain("$.title");
      expect(result.issues.every((i) => i.severity === "error")).toBe(true);
    }
  });

  it("rejects unknown references to actors, entities, grants and sources", () => {
    const bad = clone(example);
    bad.acts[0].actor = "nobody";
    bad.acts[0].target = "request-9";
    bad.acts[0].authority = "grant-missing";
    bad.acts[0].sourceRefs = ["src-missing"];
    const result = loadExternalCase(bad);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      const paths = result.issues.map((i) => i.path);
      expect(paths).toEqual(
        expect.arrayContaining([
          "$.acts[0].actor",
          "$.acts[0].target",
          "$.acts[0].authority",
          "$.acts[0].sourceRefs[0]",
        ])
      );
    }
  });

  it("rejects duplicate ids and invalid enum values", () => {
    const bad = clone(example);
    bad.acts[1].id = bad.acts[0].id;
    (bad.sources[0] as { kind: string }).kind = "rumour";
    (bad.acts[0] as { attribution: string }).attribution = "probably";
    const result = loadExternalCase(bad);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      const paths = result.issues.map((i) => i.path);
      expect(paths).toEqual(
        expect.arrayContaining(["$.acts[1].id", "$.sources[0].kind", "$.acts[0].attribution"])
      );
    }
  });
});

describe("Broken authority chains load, flagged", () => {
  it("loads a grant whose parent is missing, with an R022 warning on the act", () => {
    const broken = clone(example);
    broken.authorities.grants[1].derivedFrom = "grant-that-was-never-issued";
    const c = loaded(broken);

    expect(act(c, "act-reviewed-denial").resolution.outcome).toBe("invalid-chain");
    expect(c.issues).toContainEqual(expect.objectContaining({ path: "$.acts[0]", code: "R022" }));
  });

  it("flags a delegation the vendor was not allowed to make (R005)", () => {
    const broken = clone(example);
    broken.authorities.grants[0].permissions = ["act"];
    const c = loaded(broken);

    const { resolution } = act(c, "act-reviewed-denial");
    expect(resolution.outcome).toBe("invalid-chain");
    expect(resolution.responsible.map((r) => [r.party, r.role])).toEqual([
      ["clinical-reviewer-a", "actor"],
      ["example-review-co", "invalid-grantor"],
    ]);
    expect(c.issues).toContainEqual(expect.objectContaining({ path: "$.acts[0]", code: "R005" }));
  });
});

describe("Loading many cases", () => {
  it("keeps good cases when others fail, and rejects duplicate case ids", () => {
    const second = clone(example);
    second.id = "illustrative-second";
    const broken = { ...clone(example), id: "broken", acts: "not a list" };

    const { cases, failures } = loadExternalCases([example, second, broken, example]);

    expect([...cases.keys()]).toEqual(["illustrative-prior-authorization", "illustrative-second"]);
    expect(failures.map((f) => [f.index, f.id])).toEqual([
      [2, "broken"],
      [3, "illustrative-prior-authorization"],
    ]);
  });
});
