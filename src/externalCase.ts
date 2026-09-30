import type {
  ActorId,
  AuthorityGrant,
  AuthorityGrantId,
  AuthorityPermission,
  EntityId,
  InvariantCode,
  SourceAuthority,
} from "./turing-complete-gospel-of-jesus-christ";
import {
  resolveResponsibility,
  type Act,
  type AuthorityContext,
  type Resolution,
} from "./responsibility";

/*
 * External cases.
 *
 * Internal models are built from scripture. External models describe
 * real-world or illustrative cases (a claim denial, a court record, a
 * company decision) in the same grammar, so the same authority and
 * responsibility rules apply to both.
 *
 * An external case is plain JSON. `loadExternalCase` validates it, converts
 * it into model types, and resolves the authority and responsibility of
 * every act. Structural errors (missing fields, broken references) stop the
 * load. Problems with the case itself (an act with no authority, a broken
 * delegation, an actor who is only alleged) do not: the case loads, flagged.
 */

export const EXTERNAL_CASE_SCHEMA_VERSION = 1;

/* -------------------------------------------------------------------------- */
/* FORMAT                                                                      */
/* -------------------------------------------------------------------------- */

export type ExternalSourceKind =
  /** A court's finding of fact or judgment. */
  | "court-judgment"
  /** A charge, complaint or other filing: it alleges, it does not establish. */
  | "court-filing"
  | "statute"
  | "regulation"
  /** A government or regulator's own record. */
  | "official-record"
  /** An organization's own record of its own decision (e.g. a denial letter). */
  | "company-document"
  | "news-report"
  | "other";

/**
 * Source kinds that can establish who performed an act. Everything else
 * (filings, reporting) can only allege it.
 */
export const ESTABLISHING_SOURCE_KINDS: ReadonlySet<ExternalSourceKind> = new Set([
  "court-judgment",
  "official-record",
  "company-document",
]);

export interface ExternalSource {
  readonly id: string;
  readonly kind: ExternalSourceKind;
  readonly title: string;
  readonly url?: string;
  /** ISO date (YYYY-MM-DD). */
  readonly date?: string;
}

export interface ExternalParty {
  readonly id: string;
  readonly label: string;
}

export interface ExternalScope {
  readonly domain: string;
  readonly operations?: readonly string[];
  readonly targets?: readonly string[];
}

export interface ExternalSourceAuthority {
  readonly bearer: string;
  /** Where the authority comes from, e.g. "state insurance licence". */
  readonly source: string;
  readonly sourceRefs: readonly string[];
}

export interface ExternalGrant {
  readonly id: string;
  readonly sourceActor: string;
  readonly bearer: string;
  readonly scope: ExternalScope;
  readonly permissions: readonly AuthorityPermission[];
  readonly derivedFrom?: string;
  readonly sourceRefs: readonly string[];
}

export interface ExternalAct {
  readonly id: string;
  readonly description: string;
  readonly actor?: string;
  /** The operation as named in the authority's scope. */
  readonly operation: string;
  readonly target?: string;
  /** Id of the grant or source-authority bearer the act claims to act under. */
  readonly authority?: string;
  readonly attribution: "established" | "alleged" | "unknown";
  /** True for acts with a legal or material effect; these must be accountable. */
  readonly consequential: boolean;
  readonly sourceRefs: readonly string[];
}

export interface ExternalShape {
  readonly start: string;
  readonly happens: string;
  readonly response: string;
  readonly change: string;
  readonly end: string;
}

export interface ExternalCase {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly title: string;
  readonly summary?: string;
  /** True for invented cases used to demonstrate or test the model. */
  readonly illustrative?: boolean;
  readonly sources: readonly ExternalSource[];
  readonly actors: readonly ExternalParty[];
  readonly entities: readonly ExternalParty[];
  readonly authorities: {
    readonly sources: readonly ExternalSourceAuthority[];
    readonly grants: readonly ExternalGrant[];
  };
  readonly acts: readonly ExternalAct[];
  /** The case in the same five plain steps as the internal stories. */
  readonly shape?: ExternalShape;
}

/* -------------------------------------------------------------------------- */
/* RESULT                                                                      */
/* -------------------------------------------------------------------------- */

export interface LoadIssue {
  readonly severity: "error" | "warning";
  /** JSON path of the offending value, e.g. "acts[2].actor". */
  readonly path: string;
  readonly message: string;
  readonly code?: InvariantCode;
}

export interface LoadedAct {
  readonly source: ExternalAct;
  readonly act: Act;
  readonly resolution: Resolution;
}

export interface LoadedCase {
  readonly case: ExternalCase;
  readonly context: AuthorityContext;
  readonly acts: readonly LoadedAct[];
  /** Warnings: the case loaded, but these need attention. */
  readonly issues: readonly LoadIssue[];
}

export type LoadResult =
  | { readonly ok: true; readonly loaded: LoadedCase }
  | { readonly ok: false; readonly issues: readonly LoadIssue[] };

/* -------------------------------------------------------------------------- */
/* STRUCTURAL VALIDATION                                                       */
/* -------------------------------------------------------------------------- */

const SOURCE_KINDS: ReadonlySet<string> = new Set<ExternalSourceKind>([
  "court-judgment",
  "court-filing",
  "statute",
  "regulation",
  "official-record",
  "company-document",
  "news-report",
  "other",
]);
const PERMISSIONS: ReadonlySet<string> = new Set<AuthorityPermission>(["act", "delegate"]);
const ATTRIBUTIONS: ReadonlySet<string> = new Set(["established", "alleged", "unknown"]);

type Json = Record<string, unknown>;

class Validator {
  readonly issues: LoadIssue[] = [];

  error(path: string, message: string): void {
    this.issues.push({ severity: "error", path, message });
  }

  object(value: unknown, path: string): Json | null {
    if (value && typeof value === "object" && !Array.isArray(value)) return value as Json;
    this.error(path, "must be an object");
    return null;
  }

  array(value: unknown, path: string): unknown[] {
    if (Array.isArray(value)) return value;
    this.error(path, "must be an array");
    return [];
  }

  string(obj: Json, key: string, path: string, required = true): string | undefined {
    const value = obj[key];
    if (value === undefined && !required) return undefined;
    if (typeof value === "string" && value.trim() !== "") return value;
    this.error(`${path}.${key}`, required ? "must be a non-empty string" : "must be a non-empty string when present");
    return undefined;
  }

  stringArray(obj: Json, key: string, path: string, required = true): string[] | undefined {
    const value = obj[key];
    if (value === undefined && !required) return undefined;
    if (Array.isArray(value) && value.every((v) => typeof v === "string" && v !== "")) {
      return value as string[];
    }
    this.error(`${path}.${key}`, "must be an array of non-empty strings");
    return undefined;
  }

  oneOf(obj: Json, key: string, allowed: ReadonlySet<string>, path: string): string | undefined {
    const value = this.string(obj, key, path);
    if (value !== undefined && !allowed.has(value)) {
      this.error(`${path}.${key}`, `must be one of: ${[...allowed].join(", ")}`);
      return undefined;
    }
    return value;
  }

  uniqueIds(items: readonly { id?: unknown }[], path: string): void {
    const seen = new Set<unknown>();
    items.forEach((item, i) => {
      if (item.id === undefined) return;
      if (seen.has(item.id)) this.error(`${path}[${i}].id`, `duplicate id "${String(item.id)}"`);
      seen.add(item.id);
    });
  }
}

/** Checks shape and cross-references. Returns the case only if there are no errors. */
function validate(input: unknown): { value?: ExternalCase; issues: LoadIssue[] } {
  const v = new Validator();
  const root = v.object(input, "$");
  if (!root) return { issues: v.issues };

  if (root.schemaVersion !== EXTERNAL_CASE_SCHEMA_VERSION) {
    v.error("$.schemaVersion", `must be ${EXTERNAL_CASE_SCHEMA_VERSION}`);
  }
  v.string(root, "id", "$");
  v.string(root, "title", "$");
  v.string(root, "summary", "$", false);
  if (root.illustrative !== undefined && typeof root.illustrative !== "boolean") {
    v.error("$.illustrative", "must be true or false");
  }

  const sources = v.array(root.sources, "$.sources");
  sources.forEach((s, i) => {
    const o = v.object(s, `$.sources[${i}]`);
    if (!o) return;
    v.string(o, "id", `$.sources[${i}]`);
    v.oneOf(o, "kind", SOURCE_KINDS, `$.sources[${i}]`);
    v.string(o, "title", `$.sources[${i}]`);
    v.string(o, "url", `$.sources[${i}]`, false);
    const date = v.string(o, "date", `$.sources[${i}]`, false);
    if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      v.error(`$.sources[${i}].date`, "must be an ISO date (YYYY-MM-DD)");
    }
  });
  v.uniqueIds(sources as Json[], "$.sources");

  const parties = (key: "actors" | "entities") => {
    const list = v.array(root[key], `$.${key}`);
    list.forEach((p, i) => {
      const o = v.object(p, `$.${key}[${i}]`);
      if (!o) return;
      v.string(o, "id", `$.${key}[${i}]`);
      v.string(o, "label", `$.${key}[${i}]`);
    });
    return list as Json[];
  };
  const actors = parties("actors");
  const entities = parties("entities");
  v.uniqueIds([...actors, ...entities], "$.actors+entities");

  const authorities = v.object(root.authorities, "$.authorities") ?? {};
  const rootAuthorities = v.array(authorities.sources, "$.authorities.sources");
  rootAuthorities.forEach((a, i) => {
    const path = `$.authorities.sources[${i}]`;
    const o = v.object(a, path);
    if (!o) return;
    v.string(o, "bearer", path);
    v.string(o, "source", path);
    v.stringArray(o, "sourceRefs", path);
  });
  const grants = v.array(authorities.grants, "$.authorities.grants");
  grants.forEach((g, i) => {
    const path = `$.authorities.grants[${i}]`;
    const o = v.object(g, path);
    if (!o) return;
    v.string(o, "id", path);
    v.string(o, "sourceActor", path);
    v.string(o, "bearer", path);
    const scope = v.object(o.scope, `${path}.scope`);
    if (scope) {
      v.string(scope, "domain", `${path}.scope`);
      v.stringArray(scope, "operations", `${path}.scope`, false);
      v.stringArray(scope, "targets", `${path}.scope`, false);
    }
    const perms = v.stringArray(o, "permissions", path);
    perms?.forEach((p, j) => {
      if (!PERMISSIONS.has(p)) v.error(`${path}.permissions[${j}]`, "must be \"act\" or \"delegate\"");
    });
    v.string(o, "derivedFrom", path, false);
    v.stringArray(o, "sourceRefs", path);
  });
  v.uniqueIds(grants as Json[], "$.authorities.grants");

  const acts = v.array(root.acts, "$.acts");
  acts.forEach((a, i) => {
    const path = `$.acts[${i}]`;
    const o = v.object(a, path);
    if (!o) return;
    v.string(o, "id", path);
    v.string(o, "description", path);
    v.string(o, "actor", path, false);
    v.string(o, "operation", path);
    v.string(o, "target", path, false);
    v.string(o, "authority", path, false);
    v.oneOf(o, "attribution", ATTRIBUTIONS, path);
    if (typeof o.consequential !== "boolean") v.error(`${path}.consequential`, "must be true or false");
    v.stringArray(o, "sourceRefs", path);
  });
  v.uniqueIds(acts as Json[], "$.acts");

  if (root.shape !== undefined) {
    const shape = v.object(root.shape, "$.shape");
    if (shape) {
      for (const key of ["start", "happens", "response", "change", "end"]) {
        v.string(shape, key, "$.shape");
      }
    }
  }

  if (v.issues.length > 0) return { issues: v.issues };

  // Shape is valid; now check that every reference points at something.
  const value = root as unknown as ExternalCase;
  const sourceIds = new Set(value.sources.map((s) => s.id));
  const actorIds = new Set(value.actors.map((a) => a.id));
  const partyIds = new Set([...actorIds, ...value.entities.map((e) => e.id)]);
  const entityIds = new Set(value.entities.map((e) => e.id));
  const grantIds = new Set(value.authorities.grants.map((g) => g.id));
  const rootBearers = new Set(value.authorities.sources.map((s) => s.bearer));

  const refs = (list: readonly string[], path: string) =>
    list.forEach((ref, j) => {
      if (!sourceIds.has(ref)) v.error(`${path}.sourceRefs[${j}]`, `unknown source "${ref}"`);
    });
  const actorRef = (id: string | undefined, path: string) => {
    if (id !== undefined && !actorIds.has(id)) v.error(path, `unknown actor "${id}"`);
  };

  value.authorities.sources.forEach((s, i) => {
    const path = `$.authorities.sources[${i}]`;
    actorRef(s.bearer, `${path}.bearer`);
    refs(s.sourceRefs, path);
  });
  value.authorities.grants.forEach((g, i) => {
    const path = `$.authorities.grants[${i}]`;
    actorRef(g.sourceActor, `${path}.sourceActor`);
    actorRef(g.bearer, `${path}.bearer`);
    g.scope.targets?.forEach((t, j) => {
      if (!entityIds.has(t)) v.error(`${path}.scope.targets[${j}]`, `unknown entity "${t}"`);
    });
    refs(g.sourceRefs, path);
    // A missing parent is a broken authority chain, not a broken file: it is
    // reported as a warning after resolution (R022), so the case still loads.
  });
  value.acts.forEach((a, i) => {
    const path = `$.acts[${i}]`;
    if (a.actor !== undefined && !partyIds.has(a.actor)) v.error(`${path}.actor`, `unknown actor "${a.actor}"`);
    if (a.target !== undefined && !entityIds.has(a.target)) {
      v.error(`${path}.target`, `unknown entity "${a.target}"`);
    }
    if (a.authority !== undefined && !grantIds.has(a.authority) && !rootBearers.has(a.authority)) {
      v.error(`${path}.authority`, `unknown grant or source-authority bearer "${a.authority}"`);
    }
    refs(a.sourceRefs, path);
  });

  return v.issues.length > 0 ? { issues: v.issues } : { value, issues: [] };
}

/* -------------------------------------------------------------------------- */
/* LOADING                                                                     */
/* -------------------------------------------------------------------------- */

function toSourceAuthority(s: ExternalSourceAuthority): SourceAuthority {
  return { kind: "source-authority", bearer: s.bearer as ActorId, source: s.source };
}

function toGrant(g: ExternalGrant): AuthorityGrant {
  return {
    kind: "authority-grant",
    id: g.id as AuthorityGrantId,
    sourceActor: g.sourceActor as ActorId,
    bearer: g.bearer as ActorId,
    scope: {
      domain: g.scope.domain,
      operations: g.scope.operations,
      targets: g.scope.targets as EntityId[] | undefined,
    },
    permissions: g.permissions,
    derivedFrom: g.derivedFrom as AuthorityGrantId | undefined,
    provenance: [],
  };
}

/**
 * Validates and loads one external case.
 *
 * - Structural errors (bad shape, unknown references) fail the load.
 * - Every act is resolved with `resolveResponsibility`; broken chains,
 *   acts beyond scope, missing authority and unaccountable consequential
 *   acts are returned as warnings on a successful load.
 * - An act marked "established" whose sources can only allege it (news
 *   reports, court filings) is loaded as "alleged", with a warning.
 */
export function loadExternalCase(input: unknown): LoadResult {
  const { value, issues } = validate(input);
  if (!value) return { ok: false, issues };

  const context: AuthorityContext = {
    grants: value.authorities.grants.map(toGrant),
    sources: value.authorities.sources.map(toSourceAuthority),
  };
  const sourceKinds = new Map(value.sources.map((s) => [s.id, s.kind]));
  const warnings: LoadIssue[] = [];

  const acts = value.acts.map((source, i): LoadedAct => {
    const path = `$.acts[${i}]`;
    let attribution = source.attribution;
    if (
      attribution === "established" &&
      !source.sourceRefs.some((ref) => ESTABLISHING_SOURCE_KINDS.has(sourceKinds.get(ref)!))
    ) {
      attribution = "alleged";
      warnings.push({
        severity: "warning",
        path: `${path}.attribution`,
        message:
          "Marked established, but no cited source can establish who acted (court judgment, official record or the organization's own document). Loaded as alleged.",
      });
    }

    const authority = source.authority
      ? context.grants.find((g) => g.id === source.authority) ??
        context.sources.find((s) => s.bearer === source.authority)
      : undefined;

    const act: Act = {
      actor: source.actor as ActorId | undefined,
      operation: source.operation,
      target: source.target as EntityId | undefined,
      attribution,
      authority,
      eventId: source.id,
    };
    const resolution = resolveResponsibility(act, context);

    for (const finding of resolution.findings) {
      if (resolution.outcome === "authorized") continue;
      warnings.push({ severity: "warning", path, message: finding.message, code: finding.code });
    }
    if (source.consequential && resolution.responsible.length === 0) {
      warnings.push({
        severity: "warning",
        path,
        code: "R023",
        message: "Consequential act with no determined responsible party.",
      });
    }
    return { source, act, resolution };
  });

  return { ok: true, loaded: { case: value, context, acts, issues: warnings } };
}

export interface RegistryLoad {
  readonly cases: ReadonlyMap<string, LoadedCase>;
  /** Cases that failed to load, keyed by their position in the input. */
  readonly failures: ReadonlyArray<{ readonly index: number; readonly id?: string; readonly issues: readonly LoadIssue[] }>;
}

/** Loads many cases at once. A failing case never blocks the others. */
export function loadExternalCases(inputs: readonly unknown[]): RegistryLoad {
  const cases = new Map<string, LoadedCase>();
  const failures: Array<{ index: number; id?: string; issues: readonly LoadIssue[] }> = [];

  inputs.forEach((input, index) => {
    const id =
      input && typeof input === "object" && typeof (input as Json).id === "string"
        ? ((input as Json).id as string)
        : undefined;
    const result = loadExternalCase(input);
    if (!result.ok) {
      failures.push({ index, id, issues: result.issues });
    } else if (cases.has(result.loaded.case.id)) {
      failures.push({
        index,
        id,
        issues: [{ severity: "error", path: "$.id", message: `duplicate case id "${result.loaded.case.id}"` }],
      });
    } else {
      cases.set(result.loaded.case.id, result.loaded);
    }
  });

  return { cases, failures };
}
