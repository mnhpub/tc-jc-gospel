import { describe, expect, it } from "vitest";

import {
  EVENTS,
  JESUS,
  JESUS_SOURCE_AUTHORITY,
  ModelInvariantError,
  TALENTS_ASSET_1,
  TALENTS_ASSET_5,
  TALENTS_AUTHORITY_GRANT_1,
  TALENTS_AUTHORITY_GRANT_2,
  TALENTS_AUTHORITY_GRANT_5,
  TALENTS_EVENTS,
  TALENTS_MASTER,
  TALENTS_MASTER_SOURCE_AUTHORITY,
  TALENTS_SERVANT_1,
  TALENTS_SERVANT_5,
  type ActorId,
  type AuthorityGrant,
  type AuthorityGrantId,
} from "./turing-complete-gospel-of-jesus-christ";
import {
  actFromEvent,
  assertAccountable,
  assertTraceable,
  resolveResponsibility,
  traceAuthorityChain,
  type AuthorityContext,
} from "./responsibility";

const TALENTS: AuthorityContext = {
  grants: [TALENTS_AUTHORITY_GRANT_5, TALENTS_AUTHORITY_GRANT_2, TALENTS_AUTHORITY_GRANT_1],
  sources: [TALENTS_MASTER_SOURCE_AUTHORITY],
};

const MARK_5: AuthorityContext = { grants: [], sources: [JESUS_SOURCE_AUTHORITY] };

const talentsEvent = (op: string) => {
  const found = TALENTS_EVENTS.find((e) => e.operation === op);
  if (!found) throw new Error(`No Talents event ${op}`);
  return found;
};

const parties = (r: ReturnType<typeof resolveResponsibility>) =>
  r.responsible.map((p) => [p.party, p.role]);

/** A made-up steward, used only to test sub-delegation. */
const STEWARD = "Talents-Steward" as ActorId;

const subGrant = (overrides: Partial<AuthorityGrant> = {}): AuthorityGrant => ({
  kind: "authority-grant",
  id: "AuthorityGrant-Steward" as AuthorityGrantId,
  sourceActor: TALENTS_SERVANT_5,
  bearer: STEWARD,
  scope: {
    domain: "entrusted-assets",
    operations: ["manage-five"],
    targets: [TALENTS_ASSET_5],
  },
  permissions: ["act"],
  derivedFrom: TALENTS_AUTHORITY_GRANT_5.id,
  provenance: [],
  ...overrides,
});

describe("Talents: delegation followed by an accounting", () => {
  it("traces the first servant's gain to the master and holds both responsible", () => {
    const act = actFromEvent(talentsEvent("gain-five"), {
      authority: TALENTS_AUTHORITY_GRANT_5,
      operation: "manage-five",
      target: TALENTS_ASSET_5,
    });
    const r = resolveResponsibility(act, TALENTS);

    expect(r.outcome).toBe("authorized");
    expect(r.chain).toEqual([TALENTS_AUTHORITY_GRANT_5, TALENTS_MASTER_SOURCE_AUTHORITY]);
    expect(parties(r)).toEqual([
      [TALENTS_SERVANT_5, "actor"],
      [TALENTS_MASTER, "delegator"],
    ]);
    expect(() => assertTraceable(r)).not.toThrow();
    expect(() => assertAccountable(r)).not.toThrow();
  });

  it("treats hiding the talent as authorized: a poor use of authority is still within it", () => {
    const act = actFromEvent(talentsEvent("hide-one"), {
      authority: TALENTS_AUTHORITY_GRANT_1,
      operation: "manage-one",
      target: TALENTS_ASSET_1,
    });
    const r = resolveResponsibility(act, TALENTS);

    expect(r.outcome).toBe("authorized");
    expect(parties(r)).toEqual([
      [TALENTS_SERVANT_1, "actor"],
      [TALENTS_MASTER, "delegator"],
    ]);
  });

  it("holds only the actor responsible when a servant acts beyond the scope granted", () => {
    const r = resolveResponsibility(
      {
        actor: TALENTS_SERVANT_1,
        operation: "manage-one",
        target: TALENTS_ASSET_5,
        attribution: "established",
        authority: TALENTS_AUTHORITY_GRANT_1,
      },
      TALENTS
    );

    expect(r.outcome).toBe("exceeds-scope");
    expect(parties(r)).toEqual([[TALENTS_SERVANT_1, "actor"]]);
    expect(r.findings[0].code).toBe("R004");
  });
});

describe("Mark 5: the same act with and without authority", () => {
  const command = EVENTS.find((e) => e.operation === "command-rise")!;

  it("traces Jesus's command to his source authority", () => {
    const r = resolveResponsibility(
      actFromEvent(command, { authority: JESUS_SOURCE_AUTHORITY, operation: "rise" }),
      MARK_5
    );

    expect(r.outcome).toBe("authorized");
    expect(r.chain).toEqual([JESUS_SOURCE_AUTHORITY]);
    expect(parties(r)).toEqual([[JESUS, "actor"]]);
  });

  it("keeps the actor responsible when no authority is claimed", () => {
    const r = resolveResponsibility(actFromEvent(command), MARK_5);

    expect(r.outcome).toBe("no-authority");
    expect(parties(r)).toEqual([[JESUS, "actor"]]);
    expect(() => assertTraceable(r)).not.toThrow();
    expect(() => assertAccountable(r)).not.toThrow();
  });
});

describe("Sub-delegation", () => {
  it("keeps every delegator in the chain for an in-scope act", () => {
    const delegable = { ...TALENTS_AUTHORITY_GRANT_5, permissions: ["act", "delegate"] as const };
    const context: AuthorityContext = { ...TALENTS, grants: [delegable, ...TALENTS.grants.slice(1)] };
    const steward = subGrant();

    const r = resolveResponsibility(
      {
        actor: STEWARD,
        operation: "manage-five",
        target: TALENTS_ASSET_5,
        attribution: "established",
        authority: steward,
      },
      context
    );

    expect(r.outcome).toBe("authorized");
    expect(r.chain).toEqual([steward, delegable, TALENTS_MASTER_SOURCE_AUTHORITY]);
    expect(parties(r)).toEqual([
      [STEWARD, "actor"],
      [TALENTS_SERVANT_5, "delegator"],
      [TALENTS_MASTER, "delegator"],
    ]);
  });

  it("rejects a delegation the delegator was not allowed to make (R005) and names the grantor", () => {
    const r = resolveResponsibility(
      {
        actor: STEWARD,
        operation: "manage-five",
        target: TALENTS_ASSET_5,
        attribution: "established",
        authority: subGrant(),
      },
      TALENTS
    );

    expect(r.outcome).toBe("invalid-chain");
    expect(r.findings[0].code).toBe("R005");
    expect(parties(r)).toEqual([
      [STEWARD, "actor"],
      [TALENTS_SERVANT_5, "invalid-grantor"],
    ]);
    expect(() => assertTraceable(r)).toThrow(ModelInvariantError);
  });

  it("rejects a sub-grant wider than its parent (R004)", () => {
    const delegable = { ...TALENTS_AUTHORITY_GRANT_5, permissions: ["act", "delegate"] as const };
    const context: AuthorityContext = { ...TALENTS, grants: [delegable] };
    const wider = subGrant({
      scope: { domain: "entrusted-assets", operations: ["manage-five", "sell-estate"] },
    });

    const result = traceAuthorityChain(wider, context);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.finding.code).toBe("R004");
  });
});

describe("Broken chains (R022)", () => {
  it("rejects a grant that derives from a grant that does not exist", () => {
    const orphan = subGrant({ derivedFrom: "AuthorityGrant-Missing" as AuthorityGrantId });
    const r = resolveResponsibility(
      { actor: STEWARD, operation: "manage-five", attribution: "established", authority: orphan },
      TALENTS
    );

    expect(r.outcome).toBe("invalid-chain");
    expect(r.findings[0].code).toBe("R022");
    expect(() => assertTraceable(r)).toThrow(/R022/);
  });

  it("rejects a root grant whose issuer holds no recognized source authority", () => {
    const rootless = subGrant({ derivedFrom: undefined });
    const result = traceAuthorityChain(rootless, TALENTS);

    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.finding.code).toBe("R022");
  });

  it("rejects a grant issued by someone who does not hold its parent", () => {
    const forged = subGrant({ sourceActor: TALENTS_SERVANT_1 });
    const result = traceAuthorityChain(forged, TALENTS);

    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.finding.code).toBe("R022");
  });

  it("stops on a delegation cycle instead of looping", () => {
    const a = subGrant({
      id: "AuthorityGrant-A" as AuthorityGrantId,
      sourceActor: STEWARD,
      bearer: STEWARD,
      permissions: ["act", "delegate"],
      derivedFrom: "AuthorityGrant-B" as AuthorityGrantId,
    });
    const b = subGrant({
      id: "AuthorityGrant-B" as AuthorityGrantId,
      sourceActor: STEWARD,
      bearer: STEWARD,
      permissions: ["act", "delegate"],
      derivedFrom: "AuthorityGrant-A" as AuthorityGrantId,
    });
    const result = traceAuthorityChain(a, { grants: [a, b], sources: [] });

    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.finding.code).toBe("R022");
  });

  it("rejects an act claiming authority held by someone else", () => {
    const r = resolveResponsibility(
      {
        actor: TALENTS_SERVANT_1,
        operation: "manage-five",
        target: TALENTS_ASSET_5,
        attribution: "established",
        authority: TALENTS_AUTHORITY_GRANT_5,
      },
      TALENTS
    );

    expect(r.outcome).toBe("invalid-chain");
    expect(parties(r)).toEqual([[TALENTS_SERVANT_1, "actor"]]);
  });
});

describe("Attribution", () => {
  it("leaves responsibility undetermined for an alleged actor, whatever the authority", () => {
    const r = resolveResponsibility(
      { actor: TALENTS_SERVANT_1, operation: "take", attribution: "alleged" },
      TALENTS
    );

    expect(r.outcome).toBe("attribution-undetermined");
    expect(r.responsible).toEqual([]);
    expect(() => assertAccountable(r)).toThrow(/R023/);
  });

  it("treats an act with no identified actor as undetermined", () => {
    const r = resolveResponsibility({ operation: "take", attribution: "unknown" }, TALENTS);

    expect(r.outcome).toBe("attribution-undetermined");
    expect(() => assertAccountable(r)).toThrow(ModelInvariantError);
  });
});
