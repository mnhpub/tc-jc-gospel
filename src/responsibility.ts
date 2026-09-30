import {
  ModelInvariantError,
  assertAuthorityGrantValid,
  type ActorId,
  type AuthorityGrant,
  type EntityId,
  type Event,
  type InvariantCode,
  type SourceAuthority,
} from "./turing-complete-gospel-of-jesus-christ";

/*
 * Responsibility resolution.
 *
 * A consequential act must resolve to the authority it was performed under
 * and the party responsible for it, or say exactly why it cannot:
 *
 *   - No authority does not remove responsibility; it concentrates it on
 *     the actor.
 *   - Delegation does not hand responsibility away; delegators stay in the
 *     chain for acts inside the scope they granted.
 *   - An allegation is not attribution; until the actor is established the
 *     responsible party is undetermined, never guessed.
 */

export type Party = ActorId | EntityId;

export interface Act {
  /** Who performed the act, if known. */
  readonly actor?: Party;
  /** The operation as named in the authority's scope (e.g. "manage-five"). */
  readonly operation: string;
  readonly target?: EntityId;
  /**
   * "established": the actor is admitted as fact (an event).
   * "alleged": the actor is only claimed (a report, a charge).
   * "unknown": no actor has been identified.
   */
  readonly attribution: "established" | "alleged" | "unknown";
  /** The authority the act is claimed to have been performed under. */
  readonly authority?: SourceAuthority | AuthorityGrant;
  readonly eventId?: string;
}

/** Builds an act from an admitted event; an event with an actor is established attribution. */
export function actFromEvent(
  event: Event,
  basis: {
    readonly authority?: SourceAuthority | AuthorityGrant;
    readonly operation?: string;
    readonly target?: EntityId;
  } = {}
): Act {
  return {
    actor: event.actor,
    operation: basis.operation ?? event.operation,
    target: basis.target ?? (event.target as EntityId | undefined),
    attribution: event.actor ? "established" : "unknown",
    authority: basis.authority,
    eventId: event.id,
  };
}

export interface AuthorityContext {
  /** Grants that may appear in a chain, looked up by `derivedFrom`. */
  readonly grants: readonly AuthorityGrant[];
  /** Recognized roots: authority that is not itself granted. */
  readonly sources: readonly SourceAuthority[];
}

export type Outcome =
  /** Chain reaches a recognized source and the act is inside its scope. */
  | "authorized"
  /** Chain is valid, but the act goes beyond the scope that was granted. */
  | "exceeds-scope"
  /** No authority was claimed for the act. */
  | "no-authority"
  /** The claimed authority does not trace back to a valid source. */
  | "invalid-chain"
  /** The actor is not established, so no one can be held responsible yet. */
  | "attribution-undetermined";

export type ResponsibleRole =
  /** Performed the act. */
  | "actor"
  /** Granted authority, in the chain, for an act inside that grant's scope. */
  | "delegator"
  /** Issued a grant that is not itself validly held or delegable. */
  | "invalid-grantor";

export interface ResponsibleParty {
  readonly party: Party;
  readonly role: ResponsibleRole;
  readonly reason: string;
}

export interface Finding {
  readonly code?: InvariantCode;
  readonly message: string;
}

export interface Resolution {
  readonly outcome: Outcome;
  /** Links from the act's claimed authority up to its root, act-side first. */
  readonly chain: readonly (SourceAuthority | AuthorityGrant)[];
  readonly responsible: readonly ResponsibleParty[];
  readonly findings: readonly Finding[];
}

type ChainResult =
  | { readonly valid: true; readonly chain: readonly (SourceAuthority | AuthorityGrant)[] }
  | {
      readonly valid: false;
      readonly chain: readonly (SourceAuthority | AuthorityGrant)[];
      readonly finding: Finding;
      /** The grant whose issuer is at fault, when a grant is defective. */
      readonly defectiveGrant?: AuthorityGrant;
    };

function isGrant(a: SourceAuthority | AuthorityGrant): a is AuthorityGrant {
  return a.kind === "authority-grant";
}

/**
 * Walks an authority back to a recognized source, checking each delegation
 * step: the parent must exist, be held by the delegator, permit delegation,
 * and cover the child's scope.
 */
export function traceAuthorityChain(
  authority: SourceAuthority | AuthorityGrant,
  context: AuthorityContext
): ChainResult {
  const chain: (SourceAuthority | AuthorityGrant)[] = [authority];
  const seen = new Set<string>();
  let current = authority;

  while (isGrant(current)) {
    const grant: AuthorityGrant = current;
    if (seen.has(grant.id)) {
      return {
        valid: false,
        chain,
        finding: { code: "R022", message: `Delegation cycle at grant ${grant.id}.` },
        defectiveGrant: grant,
      };
    }
    seen.add(grant.id);

    let parent: SourceAuthority | AuthorityGrant | undefined;
    if (grant.derivedFrom) {
      parent = context.grants.find((g) => g.id === grant.derivedFrom);
      if (!parent) {
        return {
          valid: false,
          chain,
          finding: {
            code: "R022",
            message: `Grant ${grant.id} derives from ${grant.derivedFrom}, which cannot be found.`,
          },
          defectiveGrant: grant,
        };
      }
    } else {
      parent = context.sources.find((s) => s.bearer === grant.sourceActor);
      if (!parent) {
        return {
          valid: false,
          chain,
          finding: {
            code: "R022",
            message: `Grant ${grant.id} is issued by ${grant.sourceActor}, who holds no recognized source authority.`,
          },
          defectiveGrant: grant,
        };
      }
    }

    if (parent.bearer !== grant.sourceActor) {
      return {
        valid: false,
        chain: [...chain, parent],
        finding: {
          code: "R022",
          message: `Grant ${grant.id} is issued by ${grant.sourceActor}, but its parent is held by ${parent.bearer}.`,
        },
        defectiveGrant: grant,
      };
    }

    try {
      assertAuthorityGrantValid(parent, grant);
    } catch (error) {
      if (!(error instanceof ModelInvariantError)) throw error;
      return {
        valid: false,
        chain: [...chain, parent],
        finding: { code: error.code, message: error.message },
        defectiveGrant: grant,
      };
    }

    chain.push(parent);
    current = parent;
  }

  return { valid: true, chain };
}

function actWithinScope(act: Act, authority: SourceAuthority | AuthorityGrant): Finding | null {
  if (!isGrant(authority)) return null; // A source authority is not scope-limited here.
  const { operations, targets } = authority.scope;
  if (operations && operations.length > 0 && !operations.includes(act.operation)) {
    return {
      code: "R004",
      message: `Operation "${act.operation}" is outside grant ${authority.id} (allows: ${operations.join(", ")}).`,
    };
  }
  if (act.target && targets && targets.length > 0 && !targets.includes(act.target)) {
    return {
      code: "R004",
      message: `Target ${act.target} is outside grant ${authority.id} (covers: ${targets.join(", ")}).`,
    };
  }
  return null;
}

/** Everyone who granted authority along a valid chain, nearest first. */
function delegators(chain: readonly (SourceAuthority | AuthorityGrant)[]): Party[] {
  return chain.filter(isGrant).map((g) => g.sourceActor);
}

/**
 * Resolves the authority an act was performed under and who is responsible
 * for it. Never throws for a problem with the act itself; problems are
 * reported as the outcome and findings. Use `assertTraceable` or
 * `assertAccountable` where a gap must stop processing.
 */
export function resolveResponsibility(act: Act, context: AuthorityContext): Resolution {
  const findings: Finding[] = [];
  const traced = act.authority ? traceAuthorityChain(act.authority, context) : undefined;
  const chain = traced?.chain ?? [];

  if (act.attribution !== "established" || !act.actor) {
    findings.push({
      message:
        act.attribution === "alleged"
          ? "The actor is alleged, not established. Responsibility stays undetermined until the evidence establishes who acted."
          : "No actor has been identified for this act.",
    });
    if (traced && !traced.valid) findings.push(traced.finding);
    return { outcome: "attribution-undetermined", chain, responsible: [], findings };
  }

  const actor = act.actor;
  const actorParty: ResponsibleParty = {
    party: actor,
    role: "actor",
    reason: "Performed the act.",
  };

  if (!act.authority || !traced) {
    return {
      outcome: "no-authority",
      chain,
      responsible: [
        { ...actorParty, reason: "Performed the act with no authority; responsibility rests with the actor alone." },
      ],
      findings: [{ message: "No authority was claimed for this act." }],
    };
  }

  if (!traced.valid) {
    const responsible: ResponsibleParty[] = [actorParty];
    if (traced.defectiveGrant && traced.defectiveGrant.sourceActor !== actor) {
      responsible.push({
        party: traced.defectiveGrant.sourceActor,
        role: "invalid-grantor",
        reason: `Issued grant ${traced.defectiveGrant.id}, which does not trace to valid authority.`,
      });
    }
    return { outcome: "invalid-chain", chain, responsible, findings: [traced.finding] };
  }

  if (act.authority.bearer !== actor) {
    return {
      outcome: "invalid-chain",
      chain,
      responsible: [actorParty],
      findings: [
        {
          code: "R022",
          message: `The act claims authority held by ${act.authority.bearer}, not by the actor ${actor}.`,
        },
      ],
    };
  }

  const scopeProblem = actWithinScope(act, act.authority);
  if (scopeProblem) {
    return {
      outcome: "exceeds-scope",
      chain,
      responsible: [
        {
          ...actorParty,
          reason: "Acted beyond the scope granted; delegators are not responsible for the excess.",
        },
      ],
      findings: [scopeProblem],
    };
  }

  const responsible: ResponsibleParty[] = [actorParty];
  for (const party of delegators(chain)) {
    if (party === actor || responsible.some((r) => r.party === party)) continue;
    responsible.push({
      party,
      role: "delegator",
      reason: "Granted the authority this act was performed under.",
    });
  }
  return { outcome: "authorized", chain, responsible, findings };
}

/**
 * Throws unless the act's claimed authority traces to a valid source (an
 * act with no claimed authority is traceable: its finding says so). Uses
 * the code of the broken step, e.g. R005 for a delegation the delegator
 * could not make, or R022 for a chain that never reaches a source.
 */
export function assertTraceable(resolution: Resolution): void {
  if (resolution.outcome !== "invalid-chain") return;
  const problem = resolution.findings.find((f) => f.code) ?? resolution.findings[0];
  throw new ModelInvariantError(problem?.code ?? "R022", problem?.message ?? "Authority chain is invalid.");
}

/** Throws R023 when a consequential act resolves to no responsible party. */
export function assertAccountable(resolution: Resolution): void {
  if (resolution.responsible.length === 0) {
    throw new ModelInvariantError(
      "R023",
      resolution.findings[0]?.message ?? "No responsible party could be determined.",
      { outcome: resolution.outcome }
    );
  }
}
