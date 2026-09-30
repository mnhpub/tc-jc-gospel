/* turing-complete-gospel.model.ts
 *
 * Formal conceptual model for the Mark 5:21–43 pilot.
 * Focus: provenance-preserving event sourcing, authority lineage,
 * epistemic separation, projections/lenses, and executable invariants.
 */

export type Brand<T, B extends string> = T & { readonly __brand: B };

export type ActorId = Brand<string, "ActorId">;
export type EntityId = Brand<string, "EntityId">;
export type AggregateId = Brand<string, "AggregateId">;
export type EventId = Brand<string, "EventId">;
export type ClaimId = Brand<string, "ClaimId">;
export type PropositionId = Brand<string, "PropositionId">;
export type CommandId = Brand<string, "CommandId">;
export type AuthorityGrantId = Brand<string, "AuthorityGrantId">;
export type RuleId = Brand<string, "RuleId">;
export type RuleAuthorizationId = Brand<string, "RuleAuthorizationId">;
export type ProjectionId = Brand<string, "ProjectionId">;
export type LensId = Brand<string, "LensId">;
export type InterpretationId = Brand<string, "InterpretationId">;
export type ApplicationId = Brand<string, "ApplicationId">;
export type AdmissionId = Brand<string, "AdmissionId">;
export type ExtractionId = Brand<string, "ExtractionId">;
export type NarrativeId = Brand<string, "NarrativeId">;
export type RelationId = Brand<string, "RelationId">;
export type GraphNodeId = Brand<string, "GraphNodeId">;
export type GraphEdgeId = Brand<string, "GraphEdgeId">;

export type EpistemicLayer =
  | "text"
  | "extraction"
  | "admitted"
  | "derived"
  | "interpretive"
  | "application";

export type EpistemicStatus =
  | "asserted"
  | "reported"
  | "observed"
  | "declared"
  | "predicted"
  | "hypothetical"
  | "conditional"
  | "questioned"
  | "denied"
  | "disputed"
  | "unknown"
  | "derived"
  | "interpretive";

export type GospelWork = "Matthew" | "Mark" | "Luke" | "John";

export interface TextSpan {
  readonly work: GospelWork;
  readonly chapter: number;
  readonly verseStart: number;
  readonly verseEnd: number;
  readonly text?: string;
  readonly translation?: string;
}

export interface Provenance {
  readonly source: TextSpan;
  readonly sourceType: "canonical-text";
  readonly parentIds?: readonly string[];
  readonly normalizationRuleIds?: readonly RuleId[];
}

export interface Actor {
  readonly id: ActorId;
  readonly label: string;
}

export interface Entity {
  readonly id: EntityId;
  readonly label: string;
  readonly mentions: readonly {
    readonly surface: string;
    readonly provenance: Provenance;
  }[];
}

/* -------------------------------------------------------------------------- */
/* AUTHORITY                                                                   */
/* -------------------------------------------------------------------------- */

export type AuthorityPermission = "act" | "delegate";

export interface AuthorityScope {
  readonly domain: string;
  readonly operations?: readonly string[];
  readonly targets?: readonly EntityId[];
}

export interface SourceAuthority {
  readonly kind: "source-authority";
  readonly bearer: ActorId;
  readonly source: "Jesus";
}

export interface AuthorityGrant {
  readonly kind: "authority-grant";
  readonly id: AuthorityGrantId;
  readonly sourceActor: ActorId;
  readonly bearer: ActorId;
  readonly scope: AuthorityScope;
  readonly permissions: readonly AuthorityPermission[];
  readonly derivedFrom?: AuthorityGrantId;
  readonly conditions?: readonly string[];
  readonly provenance: readonly Provenance[];
}

/* -------------------------------------------------------------------------- */
/* COMMAND                                                                     */
/* -------------------------------------------------------------------------- */

export interface TransitionIntent {
  readonly from?: string;
  readonly to?: string;
  readonly description: string;
}

export interface Command {
  readonly id: CommandId;
  readonly issuer: ActorId;
  readonly authority: SourceAuthority | AuthorityGrant;
  readonly recipient: ActorId | EntityId;
  readonly operation: string;
  readonly target?: EntityId;
  readonly scope: AuthorityScope;
  readonly conditions?: readonly string[];
  readonly intendedTransition?: TransitionIntent;
  readonly provenance: Provenance;
}

export interface CommandExecution {
  readonly commandId: CommandId;
  readonly executor: ActorId | EntityId;
  readonly status: "unknown" | "attempted" | "completed" | "refused" | "prevented";
  readonly provenance?: Provenance;
}

/* -------------------------------------------------------------------------- */
/* TEXT / EXTRACTION / PROPOSITION / CLAIM                                    */
/* -------------------------------------------------------------------------- */

export type ExtractionKind =
  | "event-proposition"
  | "state-proposition"
  | "command"
  | "speech"
  | "observation"
  | "declaration";

export type Modality =
  | "asserted"
  | "reported"
  | "conditional"
  | "predicted"
  | "questioned"
  | "hypothetical"
  | "denied";

export interface Extraction {
  readonly id: ExtractionId;
  readonly source: Provenance;
  readonly sourceSpan: string;
  readonly kind: ExtractionKind;
  readonly subject?: EntityId | ActorId;
  readonly predicate: string;
  readonly arguments?: readonly unknown[];
  readonly modality: Modality;
  readonly polarity: "positive" | "negative";
  readonly normalizationRuleIds: readonly RuleId[];
}

export interface Proposition {
  readonly id: PropositionId;
  readonly subject?: EntityId | ActorId;
  readonly predicate: string;
  readonly arguments?: readonly unknown[];
  readonly provenance: readonly Provenance[];
  readonly epistemicLayer: EpistemicLayer;
}

export interface StateClaim {
  readonly id: ClaimId;
  readonly subject: EntityId;
  readonly property: string;
  readonly value: unknown;
  readonly validAt?: string;
  readonly claimant?: ActorId;
  readonly source: Provenance;
  readonly epistemicStatus: EpistemicStatus;
}

/* -------------------------------------------------------------------------- */
/* AUTHENTICATION / ADMISSION                                                  */
/* -------------------------------------------------------------------------- */

export interface Authentication {
  readonly sourceAuthority:
    | "canonical-narrator"
    | "jesus"
    | "witness"
    | "formal-ontology"
    | "semantic-convention"
    | "theological-lens";
  readonly basis: string;
  readonly provenance: readonly Provenance[];
}

export type AdmissionOutcome =
  | "admitted-event"
  | "admitted-claim"
  | "admitted-speech"
  | "withheld";

export interface Admission {
  readonly id: AdmissionId;
  readonly extractionId: ExtractionId;
  readonly ruleAuthorizationId: RuleAuthorizationId;
  readonly authentication: Authentication;
  readonly outcome: AdmissionOutcome;
  readonly epistemicStatus: EpistemicStatus;
  readonly resultingIds: readonly string[];
  readonly provenance: readonly Provenance[];
}

/* -------------------------------------------------------------------------- */
/* EVENTS                                                                      */
/* -------------------------------------------------------------------------- */

export type EventKind =
  | "speech"
  | "action"
  | "report"
  | "observation"
  | "declaration"
  | "state-transition";

export interface Event {
  readonly id: EventId;
  readonly kind: EventKind;
  readonly actor?: ActorId | EntityId;
  readonly target?: ActorId | EntityId;
  readonly operation: string;
  readonly affectedAggregates: readonly AggregateId[];
  readonly admittedFrom: readonly AdmissionId[];
  readonly provenance: readonly Provenance[];
}

/* -------------------------------------------------------------------------- */
/* AGGREGATE / STATE / PHASE                                                   */
/* -------------------------------------------------------------------------- */

export interface AggregateState {
  readonly aggregateId: AggregateId;
  readonly entityId: EntityId;
  readonly version: number;
  readonly phase: string;
  readonly properties: Readonly<Record<string, unknown>>;
}

export interface AggregateDefinition {
  readonly id: AggregateId;
  readonly entityId: EntityId;
  readonly invariants: readonly string[];
  readonly permittedOperations: readonly string[];
  readonly transitionRuleIds: readonly RuleId[];
}

export interface StateTransition {
  readonly aggregateId: AggregateId;
  readonly eventId: EventId;
  readonly before: AggregateState;
  readonly after: AggregateState;
}

export interface PhaseShift {
  readonly aggregateId: AggregateId;
  readonly transition: StateTransition;
  readonly fromPhase: string;
  readonly toPhase: string;
  readonly materiallyChanged:
    readonly ("capabilities" | "invariants" | "valid-commands" | "transition-rules")[];
}

/* -------------------------------------------------------------------------- */
/* RULES / AUTHORIZATION                                                       */
/* -------------------------------------------------------------------------- */

export type RuleKind =
  | "normalization"
  | "logical"
  | "semantic"
  | "domain"
  | "aggregate"
  | "theological"
  | "interpretive"
  | "admission"
  | "causal"
  | "normative";

export interface Rule {
  readonly id: RuleId;
  readonly name: string;
  readonly kind: RuleKind;
  readonly premises: readonly string[];
  readonly conclusion: string;
  readonly justification: string;
}

export type RuleAuthoritySource =
  | "scripture"
  | "formal-ontology"
  | "semantic-convention"
  | "scriptural-pattern"
  | "theological-lens"
  | "institutional-authority";

export interface RuleAuthorization {
  readonly id: RuleAuthorizationId;
  readonly ruleId: RuleId;
  readonly authoritySource: RuleAuthoritySource;
  readonly basis:
    | "direct-definition"
    | "formal-derivation"
    | "semantic-convention"
    | "inductive-pattern"
    | "declared-lens"
    | "delegated-authority";
  readonly scope: string;
  readonly status:
    | "authorized"
    | "authorized-for-lens"
    | "unauthorized"
    | "disputed";
  readonly provenance: readonly Provenance[];
}

/* -------------------------------------------------------------------------- */
/* INFERENCE / PROJECTION / LENS / APPLICATION                                 */
/* -------------------------------------------------------------------------- */

export interface Inference {
  readonly premises: readonly PropositionId[];
  readonly ruleId: RuleId;
  readonly ruleAuthorizationId: RuleAuthorizationId;
  readonly conclusion: PropositionId;
  readonly status: "derived";
}

export interface Projection<TInput, TOutput> {
  readonly id: ProjectionId;
  readonly name: string;
  readonly derive: (input: TInput) => TOutput;
}

export interface DerivedConcept<T = unknown> {
  readonly name: string;
  readonly value: T;
  readonly sourceEventIds: readonly EventId[];
  readonly sourceAggregateIds: readonly AggregateId[];
  readonly sourceProjectionIds?: readonly ProjectionId[];
  readonly derivationRuleId: RuleId;
  readonly ruleAuthorizationId: RuleAuthorizationId;
  readonly lensId: LensId;
  readonly epistemicStatus: "interpretive";
}

export interface Lens<TInput> {
  readonly id: LensId;
  readonly name: string;
  readonly interpret: (input: TInput) => readonly DerivedConcept[];
}

export type ApplicationModality =
  | "observation"
  | "possibility"
  | "permission"
  | "recommendation"
  | "expectation"
  | "obligation"
  | "prohibition"
  | "procedure"
  | "institutional-rule";

export interface ApplicationContext {
  readonly actor?: ActorId;
  readonly institution?: string;
  readonly jurisdiction?: string;
  readonly time?: string;
  readonly circumstances: readonly string[];
  readonly affectedPopulation?: readonly string[];
  readonly availableResources?: readonly string[];
}

export interface NormativeBridge {
  readonly ruleId: RuleId;
  readonly ruleAuthorizationId: RuleAuthorizationId;
  readonly sourceInterpretationIds: readonly InterpretationId[];
  readonly targetContext: string;
  readonly permittedModalities: readonly ApplicationModality[];
}

export interface Application {
  readonly id: ApplicationId;
  readonly sourceInterpretationIds: readonly InterpretationId[];
  readonly bridge: NormativeBridge;
  readonly target: string;
  readonly context: ApplicationContext;
  readonly action: string;
  readonly modality: ApplicationModality;
  readonly authority: RuleAuthorizationId | AuthorityGrantId;
  readonly scope: string;
  readonly assumptions: readonly string[];
  readonly exceptions: readonly string[];
}

/* -------------------------------------------------------------------------- */
/* MODEL INVARIANTS                                                            */
/* -------------------------------------------------------------------------- */

export type InvariantCode =
  | "R000"
  | "R001"
  | "R002"
  | "R003"
  | "R004"
  | "R005"
  | "R006"
  | "R007"
  | "R008"
  | "R009"
  | "R010"
  | "R011"
  | "R012"
  | "R013"
  | "R014"
  | "R015"
  | "R016"
  | "R017"
  | "R018"
  | "R019"
  | "R020"
  | "R021";

export const INVARIANT_NAMES: Readonly<Record<InvariantCode, string>> = {
  R000: "AuthorityNonEscalation",
  R001: "HistoryImmutability",
  R002: "DerivedFactNonPromotion",
  R003: "CommandRequiresEffect",
  R004: "AuthorityScopeIntegrity",
  R005: "DelegationRequiresAuthority",
  R006: "NoUnauthorizedOntologyPromotion",
  R007: "NoUnauthorizedNormativity",
  R008: "ApplicationCannotCreateAuthority",
  R009: "NoSelfAuthorizingRule",
  R010: "ProvenanceIntegrity",
  R011: "EpistemicStatusIntegrity",
  R012: "ModalityIntegrity",
  R013: "ReportedClaimNonPromotion",
  R014: "CausalityRequiresRule",
  R015: "ProjectionCannotWriteHistory",
  R016: "NoInterpretiveCircularity",
  R017: "ContextIntegrity",
  R018: "NoUnauthorizedGeneralization",
  R019: "SuccessDoesNotImplyAuthority",
  R020: "NoLexicalOntologyInjection",
  R021: "NoHiddenInterpretation",
};

export class ModelInvariantError extends Error {
  constructor(
    public readonly code: InvariantCode,
    message: string,
    public readonly details?: Readonly<Record<string, unknown>>
  ) {
    super(`${code} ${INVARIANT_NAMES[code]}: ${message}`);
    this.name = "ModelInvariantError";
  }
}

/* -------------------------------------------------------------------------- */
/* SEED RULES                                                                  */
/* -------------------------------------------------------------------------- */

const rule = (id: string) => id as RuleId;
const authz = (id: string) => id as RuleAuthorizationId;
const actor = (id: string) => id as ActorId;
const entity = (id: string) => id as EntityId;
const aggregate = (id: string) => id as AggregateId;
const event = (id: string) => id as EventId;
const extraction = (id: string) => id as ExtractionId;
const admission = (id: string) => id as AdmissionId;
const command = (id: string) => id as CommandId;

export const RULES: readonly Rule[] = [
  {
    id: rule("LexicalNormalizeAriseToRise"),
    name: "LexicalNormalizeAriseToRise",
    kind: "normalization",
    premises: ['surface predicate = "arose"'],
    conclusion: 'normalized predicate = "rise"',
    justification: "Controlled lexical normalization only.",
  },
  {
    id: rule("CanonicalNarrativeAssertion"),
    name: "CanonicalNarrativeAssertion",
    kind: "admission",
    premises: ["canonical source", "narrative assertion", "positive polarity"],
    conclusion: "admit occurrence as event",
    justification: "Pilot canonical textual admission policy.",
  },
  {
    id: rule("QuotedSpeechAsSpeechEvent"),
    name: "QuotedSpeechAsSpeechEvent",
    kind: "admission",
    premises: ["canonical source", "quoted speech"],
    conclusion: "admit speaking occurrence; preserve embedded proposition separately",
    justification: "Speech occurrence is distinct from truth of embedded proposition.",
  },
  {
    id: rule("RiseImpliesAlive"),
    name: "RiseImpliesAlive",
    kind: "semantic",
    premises: ["Person(x)", "Rose(x)"],
    conclusion: "Alive(x)",
    justification: "Embodied-person semantic rule.",
  },
  {
    id: rule("DirectCommandDoesNotImplyResult"),
    name: "DirectCommandDoesNotImplyResult",
    kind: "aggregate",
    premises: ["CommandIssued(c)"],
    conclusion: "No resulting event is created without effect/execution evidence",
    justification: "Command and result remain separate.",
  },
];

export const RULE_AUTHORIZATIONS: readonly RuleAuthorization[] = [
  {
    id: authz("Authz-LexicalNormalizeAriseToRise"),
    ruleId: rule("LexicalNormalizeAriseToRise"),
    authoritySource: "semantic-convention",
    basis: "semantic-convention",
    scope: "extraction-normalization",
    status: "authorized",
    provenance: [],
  },
  {
    id: authz("Authz-CanonicalNarrativeAssertion"),
    ruleId: rule("CanonicalNarrativeAssertion"),
    authoritySource: "scripture",
    basis: "direct-definition",
    scope: "pilot-admission-policy",
    status: "authorized",
    provenance: [],
  },
  {
    id: authz("Authz-QuotedSpeechAsSpeechEvent"),
    ruleId: rule("QuotedSpeechAsSpeechEvent"),
    authoritySource: "scripture",
    basis: "direct-definition",
    scope: "pilot-admission-policy",
    status: "authorized",
    provenance: [],
  },
  {
    id: authz("Authz-RiseImpliesAlive"),
    ruleId: rule("RiseImpliesAlive"),
    authoritySource: "formal-ontology",
    basis: "formal-derivation",
    scope: "semantic-inference",
    status: "authorized",
    provenance: [],
  },
];

/* -------------------------------------------------------------------------- */
/* MARK 5 SEED                                                                 */
/* -------------------------------------------------------------------------- */

export const JESUS = actor("Jesus");
export const JAIRUS = actor("Jairus");
export const MESSENGERS = actor("Messengers");
export const COMMUNITY = actor("Community");
export const GIRL = entity("JairusDaughter");
export const GIRL_AGGREGATE = aggregate("GirlAggregate");

export const JESUS_SOURCE_AUTHORITY: SourceAuthority = {
  kind: "source-authority",
  bearer: JESUS,
  source: "Jesus",
};

const gospel = (
  work: GospelWork,
  chapter: number,
  verseStart: number,
  verseEnd: number,
  text?: string
): Provenance => ({
  source: {
    work,
    chapter,
    verseStart,
    verseEnd,
    text,
  },
  sourceType: "canonical-text",
});

const mark = (
  verseStart: number,
  verseEnd: number,
  text?: string
): Provenance => gospel("Mark", 5, verseStart, verseEnd, text);

const luke10 = (
  verseStart: number,
  verseEnd: number,
  text?: string
): Provenance => gospel("Luke", 10, verseStart, verseEnd, text);

export const GIRL_ENTITY: Entity = {
  id: GIRL,
  label: "Jairus's daughter",
  mentions: [
    { surface: "daughter", provenance: mark(35, 35) },
    { surface: "child", provenance: mark(39, 41) },
    { surface: "girl", provenance: mark(41, 42) },
  ],
};

export const GIRL_AGGREGATE_DEFINITION: AggregateDefinition = {
  id: GIRL_AGGREGATE,
  entityId: GIRL,
  invariants: [
    "Computed state changes only through admitted events.",
    "State claims do not directly mutate aggregate state.",
    "Phase shift requires a change in operational regime.",
  ],
  permittedOperations: ["rise", "receive-food"],
  transitionRuleIds: [rule("DirectCommandDoesNotImplyResult")],
};

export const EXTRACT_CHILD_REPORTED_DEAD: Extraction = {
  id: extraction("Extract-ChildReportedDead"),
  source: mark(35, 35, "Your daughter is dead"),
  sourceSpan: "Your daughter is dead",
  kind: "state-proposition",
  subject: GIRL,
  predicate: "dead",
  modality: "reported",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const EXTRACT_TALITHA_KOUM: Extraction = {
  id: extraction("Extract-TalithaKoum"),
  source: mark(41, 41, "Talitha koum"),
  sourceSpan: "Talitha koum",
  kind: "command",
  subject: JESUS,
  predicate: "command-rise",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const EXTRACT_CHILD_ROSE: Extraction = {
  id: extraction("Extract-ChildRose"),
  source: mark(42, 42, "the girl arose"),
  sourceSpan: "the girl arose",
  kind: "event-proposition",
  subject: GIRL,
  predicate: "rise",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [rule("LexicalNormalizeAriseToRise")],
};

export const EXTRACT_GIVE_FOOD: Extraction = {
  id: extraction("Extract-GiveFood"),
  source: mark(43, 43, "Give her something to eat"),
  sourceSpan: "Give her something to eat",
  kind: "command",
  subject: JESUS,
  predicate: "command-give-food",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const ADMISSIONS: readonly Admission[] = [
  {
    id: admission("Admission-ChildReportedDead"),
    extractionId: EXTRACT_CHILD_REPORTED_DEAD.id,
    ruleAuthorizationId: authz("Authz-QuotedSpeechAsSpeechEvent"),
    authentication: {
      sourceAuthority: "canonical-narrator",
      basis: "Canonical narrator asserts that messengers made the report.",
      provenance: [mark(35, 35)],
    },
    outcome: "admitted-claim",
    epistemicStatus: "reported",
    resultingIds: ["Claim-GirlDead-Reported"],
    provenance: [mark(35, 35)],
  },
  {
    id: admission("Admission-TalithaKoum"),
    extractionId: EXTRACT_TALITHA_KOUM.id,
    ruleAuthorizationId: authz("Authz-QuotedSpeechAsSpeechEvent"),
    authentication: {
      sourceAuthority: "canonical-narrator",
      basis: "Canonical narrator asserts that Jesus spoke the command.",
      provenance: [mark(41, 41)],
    },
    outcome: "admitted-speech",
    epistemicStatus: "asserted",
    resultingIds: ["Event-JesusCommandedTalithaKoum"],
    provenance: [mark(41, 41)],
  },
  {
    id: admission("Admission-ChildRose"),
    extractionId: EXTRACT_CHILD_ROSE.id,
    ruleAuthorizationId: authz("Authz-CanonicalNarrativeAssertion"),
    authentication: {
      sourceAuthority: "canonical-narrator",
      basis: "Direct canonical narrative assertion.",
      provenance: [mark(42, 42)],
    },
    outcome: "admitted-event",
    epistemicStatus: "asserted",
    resultingIds: ["Event-ChildRose"],
    provenance: [mark(42, 42)],
  },
  {
    id: admission("Admission-GiveFood"),
    extractionId: EXTRACT_GIVE_FOOD.id,
    ruleAuthorizationId: authz("Authz-QuotedSpeechAsSpeechEvent"),
    authentication: {
      sourceAuthority: "canonical-narrator",
      basis: "Canonical narrator asserts that Jesus issued the food command.",
      provenance: [mark(43, 43)],
    },
    outcome: "admitted-speech",
    epistemicStatus: "asserted",
    resultingIds: ["Event-JesusCommandedGiveFood"],
    provenance: [mark(43, 43)],
  },
];

export const COMMAND_TALITHA_KOUM: Command = {
  id: command("Command-TalithaKoum"),
  issuer: JESUS,
  authority: JESUS_SOURCE_AUTHORITY,
  recipient: GIRL,
  operation: "rise",
  target: GIRL,
  scope: {
    domain: "girl-present-condition",
    operations: ["rise"],
    targets: [GIRL],
  },
  intendedTransition: {
    description: "Girl moves from prior condition to risen condition.",
  },
  provenance: mark(41, 41),
};

export const COMMAND_GIVE_FOOD: Command = {
  id: command("Command-GiveFood"),
  issuer: JESUS,
  authority: JESUS_SOURCE_AUTHORITY,
  recipient: COMMUNITY,
  operation: "provide-food",
  target: GIRL,
  scope: {
    domain: "care-of-girl",
    operations: ["provide-food"],
    targets: [GIRL],
  },
  intendedTransition: {
    description: "Girl receives nourishment.",
  },
  provenance: mark(43, 43),
};

export const EVENTS: readonly Event[] = [
  {
    id: event("Event-JesusCommandedTalithaKoum"),
    kind: "speech",
    actor: JESUS,
    target: GIRL,
    operation: "command-rise",
    affectedAggregates: [GIRL_AGGREGATE],
    admittedFrom: [admission("Admission-TalithaKoum")],
    provenance: [mark(41, 41)],
  },
  {
    id: event("Event-ChildRose"),
    kind: "action",
    actor: GIRL,
    operation: "rise",
    affectedAggregates: [GIRL_AGGREGATE],
    admittedFrom: [admission("Admission-ChildRose")],
    provenance: [mark(42, 42)],
  },
  {
    id: event("Event-JesusCommandedGiveFood"),
    kind: "speech",
    actor: JESUS,
    target: COMMUNITY,
    operation: "command-give-food",
    affectedAggregates: [GIRL_AGGREGATE],
    admittedFrom: [admission("Admission-GiveFood")],
    provenance: [mark(43, 43)],
  },
];

/* -------------------------------------------------------------------------- */
/* REDUCER                                                                     */
/* -------------------------------------------------------------------------- */

export const INITIAL_GIRL_STATE: AggregateState = {
  aggregateId: GIRL_AGGREGATE,
  entityId: GIRL,
  version: 0,
  phase: "CRISIS_UNRESOLVED",
  properties: {
    lifecycle: "unknown",
    risen: false,
    nourishment: "unknown",
  },
};

export function reduceGirl(
  state: AggregateState,
  e: Event
): AggregateState {
  if (e.affectedAggregates.indexOf(GIRL_AGGREGATE) < 0) {
    return state;
  }

  switch (e.operation) {
    case "rise":
      return {
        ...state,
        version: state.version + 1,
        phase: "ALIVE",
        properties: {
          ...state.properties,
          lifecycle: "alive",
          risen: true,
        },
      };

    // Intentionally no "command-give-food" mutation.
    // R003: command does not manufacture GirlFed/nourished state.
    default:
      return state;
  }
}

export function replayGirl(events: readonly Event[]): AggregateState {
  return events.reduce(reduceGirl, INITIAL_GIRL_STATE);
}

/* -------------------------------------------------------------------------- */
/* INVARIANT CHECKS                                                            */
/* -------------------------------------------------------------------------- */

export function assertAuthorityGrantValid(
  parent: SourceAuthority | AuthorityGrant,
  child: AuthorityGrant
): void {
  if ("permissions" in parent && !parent.permissions.includes("delegate")) {
    throw new ModelInvariantError(
      "R005",
      "Delegator lacks delegation authority.",
      { childGrant: child.id }
    );
  }

  if ("scope" in parent) {
    const parentOps = new Set(parent.scope.operations ?? []);
    for (const op of child.scope.operations ?? []) {
      if (parentOps.size > 0 && !parentOps.has(op)) {
        throw new ModelInvariantError(
          "R004",
          "Child authority exceeds parent operation scope.",
          { operation: op, childGrant: child.id }
        );
      }
    }
  }
}

export function assertNoDerivedPromotion(
  from: EpistemicLayer,
  to: EpistemicLayer
): void {
  const rank: Record<EpistemicLayer, number> = {
    text: 5,
    extraction: 4,
    admitted: 5,
    derived: 3,
    interpretive: 2,
    application: 1,
  };

  if (from === "derived" && to === "admitted") {
    throw new ModelInvariantError(
      "R002",
      "Derived proposition cannot silently become an admitted fact."
    );
  }

  if (rank[to] > rank[from] && from !== "text") {
    throw new ModelInvariantError(
      "R000",
      "Operation attempted an authority escalation.",
      { from, to }
    );
  }
}

export function assertCausalLinkAuthorized(
  ruleAuthorization?: RuleAuthorization
): void {
  if (!ruleAuthorization) {
    throw new ModelInvariantError(
      "R014",
      "Causal relationship requires an authorized causal rule."
    );
  }
}

export function assertProjectionCannotWriteEvent(
  source: "projection" | "lens",
  attemptedEvent: Event
): never {
  throw new ModelInvariantError(
    source === "projection" ? "R015" : "R001",
    `${source} cannot write or mutate admitted history.`,
    { attemptedEvent: attemptedEvent.id }
  );
}

/* -------------------------------------------------------------------------- */
/* BASIC PROJECTIONS                                                           */
/* -------------------------------------------------------------------------- */

export interface GirlStatusProjectionValue {
  readonly identity: EntityId;
  readonly lifecycle: unknown;
  readonly risen: unknown;
  readonly nourishment: unknown;
  readonly phase: string;
  readonly version: number;
}

export const GirlStatusProjection: Projection<
  AggregateState,
  GirlStatusProjectionValue
> = {
  id: "Projection-GirlStatus" as ProjectionId,
  name: "GirlStatusProjection",
  derive: (state) => ({
    identity: state.entityId,
    lifecycle: state.properties.lifecycle,
    risen: state.properties.risen,
    nourishment: state.properties.nourishment,
    phase: state.phase,
    version: state.version,
  }),
};

export interface CommandProjectionValue {
  readonly issuer: ActorId;
  readonly recipient: ActorId | EntityId;
  readonly operation: string;
  readonly target?: EntityId;
}

export const CommandProjection: Projection<
  readonly Command[],
  readonly CommandProjectionValue[]
> = {
  id: "Projection-Commands" as ProjectionId,
  name: "CommandProjection",
  derive: (commands) =>
    commands.map((c) => ({
      issuer: c.issuer,
      recipient: c.recipient,
      operation: c.operation,
      target: c.target,
    })),
};

/* -------------------------------------------------------------------------- */
/* PILOT SNAPSHOT                                                              */
/* -------------------------------------------------------------------------- */

export const PILOT_SNAPSHOT = {
  aggregate: replayGirl(EVENTS),
  commands: [COMMAND_TALITHA_KOUM, COMMAND_GIVE_FOOD] as const,
  events: EVENTS,
  admissions: ADMISSIONS,
  rules: RULES,
  ruleAuthorizations: RULE_AUTHORIZATIONS,
} as const;


/* -------------------------------------------------------------------------- */
/* NARRATIVE ABSTRACTION                                                       */
/* -------------------------------------------------------------------------- */

export type NarrativeKind =
  | "historical-narrative"
  | "parable"
  | "discourse"
  | "sign"
  | "mixed";

export interface ScriptureReference {
  readonly work: GospelWork;
  readonly chapter: number;
  readonly verseStart: number;
  readonly verseEnd: number;
}

export interface NarrativeRelation {
  readonly id: RelationId;
  readonly sourceId: string;
  readonly targetId: string;
  readonly relation:
    | "precedes"
    | "targets"
    | "reports"
    | "declares"
    | "encounters"
    | "acts-on"
    | "transfers-resource"
    | "affects"
    | "belongs-to";
  readonly provenance: readonly Provenance[];
  readonly epistemicLayer: EpistemicLayer;
}

export interface Narrative {
  readonly id: NarrativeId;
  readonly title: string;
  readonly kind: NarrativeKind;
  readonly source: ScriptureReference;

  readonly actors: readonly Actor[];
  readonly entities: readonly Entity[];
  readonly aggregates: readonly AggregateDefinition[];

  readonly extractions: readonly Extraction[];
  readonly admissions: readonly Admission[];
  readonly events: readonly Event[];
  readonly commands: readonly Command[];
  readonly stateClaims: readonly StateClaim[];
  readonly relations: readonly NarrativeRelation[];
}

/* -------------------------------------------------------------------------- */
/* MARK 5 AS A REUSABLE NARRATIVE                                              */
/* -------------------------------------------------------------------------- */

export const MARK_5_JAIRUS_NARRATIVE: Narrative = {
  id: "Narrative-Mark-5-Jairus" as NarrativeId,
  title: "Jairus's Daughter",
  kind: "historical-narrative",
  source: {
    work: "Mark",
    chapter: 5,
    verseStart: 21,
    verseEnd: 43,
  },
  actors: [
    { id: JESUS, label: "Jesus" },
    { id: JAIRUS, label: "Jairus" },
    { id: MESSENGERS, label: "Messengers" },
    { id: COMMUNITY, label: "People present" },
  ],
  entities: [GIRL_ENTITY],
  aggregates: [GIRL_AGGREGATE_DEFINITION],
  extractions: [
    EXTRACT_CHILD_REPORTED_DEAD,
    EXTRACT_TALITHA_KOUM,
    EXTRACT_CHILD_ROSE,
    EXTRACT_GIVE_FOOD,
  ],
  admissions: ADMISSIONS,
  events: EVENTS,
  commands: [COMMAND_TALITHA_KOUM, COMMAND_GIVE_FOOD],
  stateClaims: [
    {
      id: "Claim-GirlDead-Reported" as ClaimId,
      subject: GIRL,
      property: "lifecycle",
      value: "dead",
      claimant: MESSENGERS,
      source: mark(35, 35, "Your daughter is dead"),
      epistemicStatus: "reported",
    },
    {
      id: "Claim-GirlSleeping-Declared" as ClaimId,
      subject: GIRL,
      property: "condition",
      value: "sleeping",
      claimant: JESUS,
      source: mark(39, 39, "The child is not dead but sleeping"),
      epistemicStatus: "declared",
    },
  ],
  relations: [
    {
      id: "Relation-Talitha-Targets-Girl" as RelationId,
      sourceId: COMMAND_TALITHA_KOUM.id,
      targetId: GIRL,
      relation: "targets",
      provenance: [mark(41, 41)],
      epistemicLayer: "admitted",
    },
    {
      id: "Relation-GiveFood-Targets-Girl" as RelationId,
      sourceId: COMMAND_GIVE_FOOD.id,
      targetId: GIRL,
      relation: "targets",
      provenance: [mark(43, 43)],
      epistemicLayer: "admitted",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* GOOD SAMARITAN GENERALIZATION TEST — LUKE 10:30–37                         */
/* -------------------------------------------------------------------------- */

export const TRAVELER = entity("GoodSamaritan-Traveler");
export const ROBBERS = actor("GoodSamaritan-Robbers");
export const PRIEST = actor("GoodSamaritan-Priest");
export const LEVITE = actor("GoodSamaritan-Levite");
export const SAMARITAN = actor("GoodSamaritan-Samaritan");
export const INNKEEPER = actor("GoodSamaritan-Innkeeper");
export const TRAVELER_AGGREGATE = aggregate("GoodSamaritan-TravelerAggregate");

export const TRAVELER_ENTITY: Entity = {
  id: TRAVELER,
  label: "The traveler",
  mentions: [
    {
      surface: "a man",
      provenance: luke10(30, 30),
    },
    {
      surface: "him",
      provenance: luke10(30, 35),
    },
  ],
};

export const TRAVELER_AGGREGATE_DEFINITION: AggregateDefinition = {
  id: TRAVELER_AGGREGATE,
  entityId: TRAVELER,
  invariants: [
    "Computed state changes only through admitted events.",
    "Encounter alone does not imply care.",
    "Resource transfer requires an admitted transfer/action event.",
  ],
  permittedOperations: [
    "travel",
    "be-attacked",
    "receive-care",
    "be-transported",
    "receive-resources",
  ],
  transitionRuleIds: [rule("DirectCommandDoesNotImplyResult")],
};

export const GS_EXTRACT_ATTACKED: Extraction = {
  id: extraction("GS-Extract-Attacked"),
  source: luke10(30, 30, "fell among robbers"),
  sourceSpan: "fell among robbers",
  kind: "event-proposition",
  subject: TRAVELER,
  predicate: "attacked",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const GS_EXTRACT_LEFT_INJURED: Extraction = {
  id: extraction("GS-Extract-LeftInjured"),
  source: luke10(30, 30, "leaving him half dead"),
  sourceSpan: "leaving him half dead",
  kind: "state-proposition",
  subject: TRAVELER,
  predicate: "severely-injured",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const GS_EXTRACT_PRIEST_PASSED: Extraction = {
  id: extraction("GS-Extract-PriestPassed"),
  source: luke10(31, 31, "he passed by on the other side"),
  sourceSpan: "he passed by on the other side",
  kind: "event-proposition",
  subject: PRIEST,
  predicate: "passed-by",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const GS_EXTRACT_LEVITE_PASSED: Extraction = {
  id: extraction("GS-Extract-LevitePassed"),
  source: luke10(32, 32, "passed by on the other side"),
  sourceSpan: "passed by on the other side",
  kind: "event-proposition",
  subject: LEVITE,
  predicate: "passed-by",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const GS_EXTRACT_SAMARITAN_CARED: Extraction = {
  id: extraction("GS-Extract-SamaritanCared"),
  source: luke10(33, 34, "bound up his wounds"),
  sourceSpan: "bound up his wounds",
  kind: "event-proposition",
  subject: SAMARITAN,
  predicate: "provided-immediate-care",
  arguments: [TRAVELER],
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const GS_EXTRACT_TRANSPORTED: Extraction = {
  id: extraction("GS-Extract-Transported"),
  source: luke10(34, 34, "brought him to an inn"),
  sourceSpan: "brought him to an inn",
  kind: "event-proposition",
  subject: SAMARITAN,
  predicate: "transported",
  arguments: [TRAVELER],
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const GS_EXTRACT_RESOURCE_TRANSFER: Extraction = {
  id: extraction("GS-Extract-ResourceTransfer"),
  source: luke10(35, 35, "gave them to the innkeeper"),
  sourceSpan: "gave them to the innkeeper",
  kind: "event-proposition",
  subject: SAMARITAN,
  predicate: "transferred-resources",
  arguments: [INNKEEPER, TRAVELER],
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const GS_ADMISSIONS: readonly Admission[] = [
  GS_EXTRACT_ATTACKED,
  GS_EXTRACT_PRIEST_PASSED,
  GS_EXTRACT_LEVITE_PASSED,
  GS_EXTRACT_SAMARITAN_CARED,
  GS_EXTRACT_TRANSPORTED,
  GS_EXTRACT_RESOURCE_TRANSFER,
].map((x) => ({
  id: admission(`Admission-${x.id}`),
  extractionId: x.id,
  ruleAuthorizationId: authz("Authz-CanonicalNarrativeAssertion"),
  authentication: {
    sourceAuthority: "canonical-narrator" as const,
    basis: "Direct canonical narrative assertion within the parable.",
    provenance: [x.source],
  },
  outcome: "admitted-event" as const,
  epistemicStatus: "asserted" as const,
  resultingIds: [`Event-${x.id}`],
  provenance: [x.source],
}));

export const GS_EVENTS: readonly Event[] = [
  {
    id: event("Event-GS-Attacked"),
    kind: "action",
    actor: ROBBERS,
    target: TRAVELER,
    operation: "attack",
    affectedAggregates: [TRAVELER_AGGREGATE],
    admittedFrom: [GS_ADMISSIONS[0].id],
    provenance: [luke10(30, 30)],
  },
  {
    id: event("Event-GS-PriestPassed"),
    kind: "action",
    actor: PRIEST,
    target: TRAVELER,
    operation: "pass-by",
    affectedAggregates: [TRAVELER_AGGREGATE],
    admittedFrom: [GS_ADMISSIONS[1].id],
    provenance: [luke10(31, 31)],
  },
  {
    id: event("Event-GS-LevitePassed"),
    kind: "action",
    actor: LEVITE,
    target: TRAVELER,
    operation: "pass-by",
    affectedAggregates: [TRAVELER_AGGREGATE],
    admittedFrom: [GS_ADMISSIONS[2].id],
    provenance: [luke10(32, 32)],
  },
  {
    id: event("Event-GS-SamaritanCared"),
    kind: "action",
    actor: SAMARITAN,
    target: TRAVELER,
    operation: "provide-immediate-care",
    affectedAggregates: [TRAVELER_AGGREGATE],
    admittedFrom: [GS_ADMISSIONS[3].id],
    provenance: [luke10(33, 34)],
  },
  {
    id: event("Event-GS-Transported"),
    kind: "action",
    actor: SAMARITAN,
    target: TRAVELER,
    operation: "transport",
    affectedAggregates: [TRAVELER_AGGREGATE],
    admittedFrom: [GS_ADMISSIONS[4].id],
    provenance: [luke10(34, 34)],
  },
  {
    id: event("Event-GS-ResourceTransfer"),
    kind: "action",
    actor: SAMARITAN,
    target: INNKEEPER,
    operation: "transfer-resources",
    affectedAggregates: [TRAVELER_AGGREGATE],
    admittedFrom: [GS_ADMISSIONS[5].id],
    provenance: [luke10(35, 35)],
  },
];

export const GOOD_SAMARITAN_NARRATIVE: Narrative = {
  id: "Narrative-Luke-10-Good-Samaritan" as NarrativeId,
  title: "The Good Samaritan",
  kind: "parable",
  source: {
    work: "Luke",
    chapter: 10,
    verseStart: 30,
    verseEnd: 37,
  },
  actors: [
    { id: ROBBERS, label: "Robbers" },
    { id: PRIEST, label: "Priest" },
    { id: LEVITE, label: "Levite" },
    { id: SAMARITAN, label: "Samaritan" },
    { id: INNKEEPER, label: "Innkeeper" },
  ],
  entities: [TRAVELER_ENTITY],
  aggregates: [TRAVELER_AGGREGATE_DEFINITION],
  extractions: [
    GS_EXTRACT_ATTACKED,
    GS_EXTRACT_LEFT_INJURED,
    GS_EXTRACT_PRIEST_PASSED,
    GS_EXTRACT_LEVITE_PASSED,
    GS_EXTRACT_SAMARITAN_CARED,
    GS_EXTRACT_TRANSPORTED,
    GS_EXTRACT_RESOURCE_TRANSFER,
  ],
  admissions: GS_ADMISSIONS,
  events: GS_EVENTS,
  commands: [],
  stateClaims: [
    {
      id: "Claim-GS-SeverelyInjured" as ClaimId,
      subject: TRAVELER,
      property: "condition",
      value: "severely-injured",
      source: luke10(30, 30, "leaving him half dead"),
      epistemicStatus: "asserted",
    },
  ],
  relations: [
    {
      id: "GS-Rel-Robbers-ActOn-Traveler" as RelationId,
      sourceId: ROBBERS,
      targetId: TRAVELER,
      relation: "acts-on",
      provenance: [luke10(30, 30)],
      epistemicLayer: "admitted",
    },
    {
      id: "GS-Rel-Samaritan-ActOn-Traveler" as RelationId,
      sourceId: SAMARITAN,
      targetId: TRAVELER,
      relation: "acts-on",
      provenance: [luke10(33, 35)],
      epistemicLayer: "admitted",
    },
    {
      id: "GS-Rel-Samaritan-Transfers-Innkeeper" as RelationId,
      sourceId: SAMARITAN,
      targetId: INNKEEPER,
      relation: "transfers-resource",
      provenance: [luke10(35, 35)],
      epistemicLayer: "admitted",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* GRAPH DTO FOR TSX / D3                                                      */
/* -------------------------------------------------------------------------- */

export type GraphNodeKind =
  | "actor"
  | "entity"
  | "aggregate"
  | "event"
  | "command"
  | "state-claim"
  | "derived"
  | "interpretation"
  | "application";

export interface GraphNode {
  readonly id: GraphNodeId;
  readonly kind: GraphNodeKind;
  readonly label: string;
  readonly epistemicLayer: EpistemicLayer;
  readonly sourceRef?: string;
  readonly payloadId: string;
}

export interface GraphEdge {
  readonly id: GraphEdgeId;
  readonly source: GraphNodeId;
  readonly target: GraphNodeId;
  readonly relation: string;
  readonly epistemicLayer: EpistemicLayer;
}

export interface NarrativeGraph {
  readonly narrativeId: NarrativeId;
  readonly nodes: readonly GraphNode[];
  readonly edges: readonly GraphEdge[];
}

export function narrativeToGraph(narrative: Narrative): NarrativeGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  const nodeId = (prefix: string, id: string) =>
    `${prefix}:${id}` as GraphNodeId;

  for (const a of narrative.actors) {
    nodes.push({
      id: nodeId("actor", a.id),
      kind: "actor",
      label: a.label,
      epistemicLayer: "admitted",
      payloadId: a.id,
    });
  }

  for (const e of narrative.entities) {
    nodes.push({
      id: nodeId("entity", e.id),
      kind: "entity",
      label: e.label,
      epistemicLayer: "admitted",
      payloadId: e.id,
    });
  }

  for (const ag of narrative.aggregates) {
    nodes.push({
      id: nodeId("aggregate", ag.id),
      kind: "aggregate",
      label: ag.id,
      epistemicLayer: "admitted",
      payloadId: ag.id,
    });
    edges.push({
      id: `edge:aggregate:${ag.id}` as GraphEdgeId,
      source: nodeId("aggregate", ag.id),
      target: nodeId("entity", ag.entityId),
      relation: "governs",
      epistemicLayer: "admitted",
    });
  }

  for (const e of narrative.events) {
    nodes.push({
      id: nodeId("event", e.id),
      kind: "event",
      label: e.operation,
      epistemicLayer: "admitted",
      sourceRef: `${e.provenance[0]?.source.work ?? ""} ${e.provenance[0]?.source.chapter ?? ""}:${e.provenance[0]?.source.verseStart ?? ""}`,
      payloadId: e.id,
    });

    if (e.actor) {
      const actorExists = narrative.actors.some((a) => a.id === e.actor);
      const prefix = actorExists ? "actor" : "entity";
      edges.push({
        id: `edge:actor:${e.id}` as GraphEdgeId,
        source: nodeId(prefix, e.actor as string),
        target: nodeId("event", e.id),
        relation: "performs",
        epistemicLayer: "admitted",
      });
    }

    if (e.target) {
      const actorExists = narrative.actors.some((a) => a.id === e.target);
      const prefix = actorExists ? "actor" : "entity";
      edges.push({
        id: `edge:target:${e.id}` as GraphEdgeId,
        source: nodeId("event", e.id),
        target: nodeId(prefix, e.target as string),
        relation: "targets",
        epistemicLayer: "admitted",
      });
    }
  }

  for (const c of narrative.commands) {
    nodes.push({
      id: nodeId("command", c.id),
      kind: "command",
      label: c.operation,
      epistemicLayer: "admitted",
      sourceRef: `${c.provenance.source.work} ${c.provenance.source.chapter}:${c.provenance.source.verseStart}`,
      payloadId: c.id,
    });

    edges.push({
      id: `edge:command-issuer:${c.id}` as GraphEdgeId,
      source: nodeId("actor", c.issuer),
      target: nodeId("command", c.id),
      relation: "issues",
      epistemicLayer: "admitted",
    });
  }

  for (const c of narrative.stateClaims) {
    nodes.push({
      id: nodeId("state-claim", c.id),
      kind: "state-claim",
      label: `${c.property} = ${String(c.value)}`,
      epistemicLayer:
        c.epistemicStatus === "derived" ? "derived" : "extraction",
      sourceRef: `${c.source.source.work} ${c.source.source.chapter}:${c.source.source.verseStart}`,
      payloadId: c.id,
    });

    edges.push({
      id: `edge:claim:${c.id}` as GraphEdgeId,
      source: nodeId("state-claim", c.id),
      target: nodeId("entity", c.subject),
      relation: "claims-about",
      epistemicLayer: "extraction",
    });
  }

  return {
    narrativeId: narrative.id,
    nodes,
    edges,
  };
}

export const MARK_5_GRAPH = narrativeToGraph(MARK_5_JAIRUS_NARRATIVE);
export const GOOD_SAMARITAN_GRAPH = narrativeToGraph(GOOD_SAMARITAN_NARRATIVE);

export const PILOT_CORPUS: readonly Narrative[] = [
  MARK_5_JAIRUS_NARRATIVE,
  GOOD_SAMARITAN_NARRATIVE,
];

/* -------------------------------------------------------------------------- */
/* GOOD SAMARITAN RUNTIME                                                      */
/* -------------------------------------------------------------------------- */

export const INITIAL_TRAVELER_STATE: AggregateState = {
  aggregateId: TRAVELER_AGGREGATE,
  entityId: TRAVELER,
  version: 0,
  phase: "TRAVELING",
  properties: {
    condition: "unknown",
    care: "none",
    transported: false,
    resourcesTransferred: false,
  },
};

export function reduceTraveler(
  state: AggregateState,
  e: Event
): AggregateState {
  if (e.affectedAggregates.indexOf(TRAVELER_AGGREGATE) < 0) return state;

  switch (e.operation) {
    case "attack":
      return {
        ...state,
        version: state.version + 1,
        phase: "INJURED",
        properties: {
          ...state.properties,
          condition: "injured",
        },
      };
    case "provide-immediate-care":
      return {
        ...state,
        version: state.version + 1,
        phase: "UNDER_CARE",
        properties: {
          ...state.properties,
          care: "provided",
        },
      };
    case "transport":
      return {
        ...state,
        version: state.version + 1,
        properties: {
          ...state.properties,
          transported: true,
        },
      };
    case "transfer-resources":
      return {
        ...state,
        version: state.version + 1,
        properties: {
          ...state.properties,
          resourcesTransferred: true,
        },
      };
    default:
      return state;
  }
}

export function replayTraveler(events: readonly Event[]): AggregateState {
  return events.reduce(reduceTraveler, INITIAL_TRAVELER_STATE);
}

export const GOOD_SAMARITAN_SNAPSHOT = {
  aggregate: replayTraveler(GS_EVENTS),
  events: GS_EVENTS,
  admissions: GS_ADMISSIONS,
} as const;

/* -------------------------------------------------------------------------- */
/* FIRST INTERPRETIVE LENSES                                                   */
/* -------------------------------------------------------------------------- */

export const CARE_LENS_ID = "Lens-Care" as LensId;
export const RESOURCE_LENS_ID = "Lens-Resource" as LensId;
export const RESTORATION_LENS_ID = "Lens-Restoration" as LensId;

export const CARE_RULE: Rule = {
  id: rule("CarePatternRule"),
  name: "CarePatternRule",
  kind: "interpretive",
  premises: [
    "one or more admitted events materially address a subject's immediate condition",
  ],
  conclusion: "CarePattern(subject)",
  justification: "Interpretive classification of admitted care actions.",
};

export const RESOURCE_RULE: Rule = {
  id: rule("ResourceTransferPatternRule"),
  name: "ResourceTransferPatternRule",
  kind: "interpretive",
  premises: ["admitted resource-transfer event exists"],
  conclusion: "ResourceProvisionPattern(subject)",
  justification: "Interpretive classification of resource transfer.",
};

export const RESTORATION_RULE: Rule = {
  id: rule("RestorationPatternRule"),
  name: "RestorationPatternRule",
  kind: "interpretive",
  premises: [
    "aggregate moves from materially impaired condition toward functioning/care state",
  ],
  conclusion: "RestorationPattern(subject)",
  justification: "Interpretive lens only; not a canonical event.",
};

export const LENS_RULE_AUTHORIZATIONS: readonly RuleAuthorization[] = [
  {
    id: authz("Authz-CarePatternRule"),
    ruleId: CARE_RULE.id,
    authoritySource: "theological-lens",
    basis: "declared-lens",
    scope: "CareLens",
    status: "authorized-for-lens",
    provenance: [],
  },
  {
    id: authz("Authz-ResourceTransferPatternRule"),
    ruleId: RESOURCE_RULE.id,
    authoritySource: "theological-lens",
    basis: "declared-lens",
    scope: "ResourceLens",
    status: "authorized-for-lens",
    provenance: [],
  },
  {
    id: authz("Authz-RestorationPatternRule"),
    ruleId: RESTORATION_RULE.id,
    authoritySource: "theological-lens",
    basis: "declared-lens",
    scope: "RestorationLens",
    status: "authorized-for-lens",
    provenance: [],
  },
];

export const CARE_RULE_AUTHORIZATION =
  LENS_RULE_AUTHORIZATIONS.find((x) => x.ruleId === CARE_RULE.id)!;

export const RESOURCE_RULE_AUTHORIZATION =
  LENS_RULE_AUTHORIZATIONS.find((x) => x.ruleId === RESOURCE_RULE.id)!;

export const RESTORATION_RULE_AUTHORIZATION =
  LENS_RULE_AUTHORIZATIONS.find((x) => x.ruleId === RESTORATION_RULE.id)!;

export const CareLens: Lens<{ narrative: Narrative; state: AggregateState }> = {
  id: CARE_LENS_ID,
  name: "CareLens",
  interpret: ({ narrative }) => {
    const careEvents = narrative.events.filter((e) =>
      ["provide-immediate-care", "transport", "transfer-resources"].includes(
        e.operation
      )
    );
    if (careEvents.length === 0) return [];
    return [
      {
        name: "care-pattern",
        value: true,
        sourceEventIds: careEvents.map((e) => e.id),
        sourceAggregateIds: [TRAVELER_AGGREGATE],
        derivationRuleId: CARE_RULE.id,
        ruleAuthorizationId: authz("Authz-CarePatternRule"),
        lensId: CARE_LENS_ID,
        epistemicStatus: "interpretive",
      },
    ];
  },
};

export const ResourceLens: Lens<{ narrative: Narrative; state: AggregateState }> = {
  id: RESOURCE_LENS_ID,
  name: "ResourceLens",
  interpret: ({ narrative }) => {
    const transfer = narrative.events.find(
      (e) => e.operation === "transfer-resources"
    );
    if (!transfer) return [];
    return [
      {
        name: "resource-provision",
        value: true,
        sourceEventIds: [transfer.id],
        sourceAggregateIds: [TRAVELER_AGGREGATE],
        derivationRuleId: RESOURCE_RULE.id,
        ruleAuthorizationId: authz("Authz-ResourceTransferPatternRule"),
        lensId: RESOURCE_LENS_ID,
        epistemicStatus: "interpretive",
      },
    ];
  },
};

export const RestorationLens: Lens<{
  narrative: Narrative;
  initial: AggregateState;
  current: AggregateState;
}> = {
  id: RESTORATION_LENS_ID,
  name: "RestorationLens",
  interpret: ({ narrative, initial, current }) => {
    const changed =
      initial.phase !== current.phase ||
      JSON.stringify(initial.properties) !== JSON.stringify(current.properties);
    if (!changed) return [];
    return [
      {
        name: "restoration-pattern",
        value: {
          fromPhase: initial.phase,
          toPhase: current.phase,
        },
        sourceEventIds: narrative.events.map((e) => e.id),
        sourceAggregateIds: [current.aggregateId],
        derivationRuleId: RESTORATION_RULE.id,
        ruleAuthorizationId: authz("Authz-RestorationPatternRule"),
        lensId: RESTORATION_LENS_ID,
        epistemicStatus: "interpretive",
      },
    ];
  },
};

/* -------------------------------------------------------------------------- */
/* GRAPH OVERLAYS                                                              */
/* -------------------------------------------------------------------------- */

export function withDerivedConcepts(
  graph: NarrativeGraph,
  concepts: readonly DerivedConcept[]
): NarrativeGraph {
  const nodes = [...graph.nodes];
  const edges = [...graph.edges];

  for (const [index, concept] of concepts.entries()) {
    const conceptNodeId = `derived:${concept.lensId}:${index}:${concept.name}` as GraphNodeId;
    nodes.push({
      id: conceptNodeId,
      kind: "interpretation",
      label: concept.name,
      epistemicLayer: "interpretive",
      payloadId: `${concept.lensId}:${concept.name}`,
    });

    for (const sourceEventId of concept.sourceEventIds) {
      const eventNodeId = `event:${sourceEventId}` as GraphNodeId;
      if (!nodes.some((n) => n.id === eventNodeId)) continue;
      edges.push({
        id: `edge:derived:${conceptNodeId}:${eventNodeId}` as GraphEdgeId,
        source: eventNodeId,
        target: conceptNodeId,
        relation: "interpreted-as",
        epistemicLayer: "interpretive",
      });
    }
  }

  return { ...graph, nodes, edges };
}

export const GOOD_SAMARITAN_CARE_CONCEPTS = CareLens.interpret({
  narrative: GOOD_SAMARITAN_NARRATIVE,
  state: GOOD_SAMARITAN_SNAPSHOT.aggregate,
});

export const GOOD_SAMARITAN_RESOURCE_CONCEPTS = ResourceLens.interpret({
  narrative: GOOD_SAMARITAN_NARRATIVE,
  state: GOOD_SAMARITAN_SNAPSHOT.aggregate,
});

export const GOOD_SAMARITAN_RESTORATION_CONCEPTS = RestorationLens.interpret({
  narrative: GOOD_SAMARITAN_NARRATIVE,
  initial: INITIAL_TRAVELER_STATE,
  current: GOOD_SAMARITAN_SNAPSHOT.aggregate,
});

export const GOOD_SAMARITAN_LENSED_GRAPH = withDerivedConcepts(
  withDerivedConcepts(
    withDerivedConcepts(
      GOOD_SAMARITAN_GRAPH,
      GOOD_SAMARITAN_CARE_CONCEPTS
    ),
    GOOD_SAMARITAN_RESOURCE_CONCEPTS
  ),
  GOOD_SAMARITAN_RESTORATION_CONCEPTS
);


/* -------------------------------------------------------------------------- */
/* ADDITIONAL PARABLE SEEDS                                                    */
/* -------------------------------------------------------------------------- */

export const PRODIGAL_YOUNGER = entity("Prodigal-YoungerSon");
export const PRODIGAL_FATHER = actor("Prodigal-Father");
export const PRODIGAL_OLDER = actor("Prodigal-OlderSon");
export const PRODIGAL_AGGREGATE = aggregate("Prodigal-YoungerSonAggregate");

export const PRODIGAL_ENTITY: Entity = {
  id: PRODIGAL_YOUNGER,
  label: "Younger son",
  mentions: [
    { surface: "younger of them", provenance: gospel("Luke", 15, 12, 12) },
    { surface: "this my son", provenance: gospel("Luke", 15, 24, 24) },
  ],
};

export const PRODIGAL_AGGREGATE_DEFINITION: AggregateDefinition = {
  id: PRODIGAL_AGGREGATE,
  entityId: PRODIGAL_YOUNGER,
  invariants: [
    "Relational state is reconstructed only from admitted events.",
    "Resource depletion does not by itself imply moral interpretation.",
    "Return does not by itself imply reconciliation; reception must be separately admitted.",
    "Interpretive categories such as restoration remain downstream unless formally authorized.",
  ],
  permittedOperations: [
    "depart-household",
    "spend-resources",
    "return-to-father",
    "be-received",
  ],
  transitionRuleIds: [],
};

export const PRODIGAL_EXTRACT_DEPARTURE: Extraction = {
  id: extraction("Prodigal-Extract-Departure"),
  source: gospel("Luke", 15, 13, 13, "took his journey into a far country"),
  sourceSpan: "took his journey into a far country",
  kind: "event-proposition",
  subject: PRODIGAL_YOUNGER,
  predicate: "depart-household",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const PRODIGAL_EXTRACT_SPENDING: Extraction = {
  id: extraction("Prodigal-Extract-Spending"),
  source: gospel("Luke", 15, 13, 13, "wasted his substance"),
  sourceSpan: "wasted his substance",
  kind: "event-proposition",
  subject: PRODIGAL_YOUNGER,
  predicate: "spend-resources",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const PRODIGAL_EXTRACT_NEED: Extraction = {
  id: extraction("Prodigal-Extract-Need"),
  source: gospel("Luke", 15, 14, 16, "he began to be in want"),
  sourceSpan: "he began to be in want",
  kind: "state-proposition",
  subject: PRODIGAL_YOUNGER,
  predicate: "in-need",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const PRODIGAL_EXTRACT_RETURN: Extraction = {
  id: extraction("Prodigal-Extract-Return"),
  source: gospel("Luke", 15, 20, 20, "he arose, and came to his father"),
  sourceSpan: "he arose, and came to his father",
  kind: "event-proposition",
  subject: PRODIGAL_YOUNGER,
  predicate: "return-to-father",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const PRODIGAL_EXTRACT_RECEIVED: Extraction = {
  id: extraction("Prodigal-Extract-Received"),
  source: gospel("Luke", 15, 20, 24, "his father ... had compassion"),
  sourceSpan: "his father ... had compassion",
  kind: "event-proposition",
  subject: PRODIGAL_FATHER,
  predicate: "receive-son",
  arguments: [PRODIGAL_YOUNGER],
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const PRODIGAL_ADMISSIONS: readonly Admission[] = [
  PRODIGAL_EXTRACT_DEPARTURE,
  PRODIGAL_EXTRACT_SPENDING,
  PRODIGAL_EXTRACT_RETURN,
  PRODIGAL_EXTRACT_RECEIVED,
].map((x) => ({
  id: admission(`Admission-${x.id}`),
  extractionId: x.id,
  ruleAuthorizationId: authz("Authz-CanonicalNarrativeAssertion"),
  authentication: {
    sourceAuthority: "canonical-narrator" as const,
    basis: "Direct canonical narrative assertion within the parable.",
    provenance: [x.source],
  },
  outcome: "admitted-event" as const,
  epistemicStatus: "asserted" as const,
  resultingIds: [`Event-${x.id}`],
  provenance: [x.source],
}));

export const PRODIGAL_NEED_ADMISSION: Admission = {
  id: admission("Admission-Prodigal-InNeed"),
  extractionId: PRODIGAL_EXTRACT_NEED.id,
  ruleAuthorizationId: authz("Authz-CanonicalNarrativeAssertion"),
  authentication: {
    sourceAuthority: "canonical-narrator",
    basis: "Direct canonical narrative assertion of the son's condition.",
    provenance: [PRODIGAL_EXTRACT_NEED.source],
  },
  outcome: "admitted-claim",
  epistemicStatus: "asserted",
  resultingIds: ["Claim-Prodigal-InNeed"],
  provenance: [PRODIGAL_EXTRACT_NEED.source],
};

export const PRODIGAL_EVENTS: readonly Event[] = [
  {
    id: event("Event-Prodigal-Departed"),
    kind: "action",
    actor: PRODIGAL_YOUNGER,
    operation: "depart-household",
    affectedAggregates: [PRODIGAL_AGGREGATE],
    admittedFrom: [PRODIGAL_ADMISSIONS[0].id],
    provenance: [gospel("Luke", 15, 13, 13)],
  },
  {
    id: event("Event-Prodigal-Spent"),
    kind: "action",
    actor: PRODIGAL_YOUNGER,
    operation: "spend-resources",
    affectedAggregates: [PRODIGAL_AGGREGATE],
    admittedFrom: [PRODIGAL_ADMISSIONS[1].id],
    provenance: [gospel("Luke", 15, 13, 13)],
  },
  {
    id: event("Event-Prodigal-Returned"),
    kind: "action",
    actor: PRODIGAL_YOUNGER,
    target: PRODIGAL_FATHER,
    operation: "return-to-father",
    affectedAggregates: [PRODIGAL_AGGREGATE],
    admittedFrom: [PRODIGAL_ADMISSIONS[2].id],
    provenance: [gospel("Luke", 15, 20, 20)],
  },
  {
    id: event("Event-Prodigal-Received"),
    kind: "action",
    actor: PRODIGAL_FATHER,
    target: PRODIGAL_YOUNGER,
    operation: "receive-son",
    affectedAggregates: [PRODIGAL_AGGREGATE],
    admittedFrom: [PRODIGAL_ADMISSIONS[3].id],
    provenance: [gospel("Luke", 15, 20, 24)],
  },
];

export const PRODIGAL_STATE_CLAIMS: readonly StateClaim[] = [{
  id: "Claim-Prodigal-InNeed" as ClaimId,
  subject: PRODIGAL_YOUNGER,
  property: "material-condition",
  value: "in-need",
  source: PRODIGAL_EXTRACT_NEED.source,
  epistemicStatus: "asserted",
}];

export const INITIAL_PRODIGAL_STATE: AggregateState = {
  aggregateId: PRODIGAL_AGGREGATE,
  entityId: PRODIGAL_YOUNGER,
  version: 0,
  phase: "HOUSEHOLD_MEMBER_PRESENT",
  properties: {
    locationRelation: "with-household",
    resources: "available",
    materialCondition: "unknown",
    returnStatus: "not-returned",
    receptionStatus: "not-applicable",
  },
};

export function reduceProdigal(state: AggregateState, e: Event): AggregateState {
  if (e.affectedAggregates.indexOf(PRODIGAL_AGGREGATE) < 0) return state;

  switch (e.operation) {
    case "depart-household":
      return {
        ...state,
        version: state.version + 1,
        phase: "AWAY_FROM_HOUSEHOLD",
        properties: { ...state.properties, locationRelation: "away" },
      };
    case "spend-resources":
      return {
        ...state,
        version: state.version + 1,
        properties: { ...state.properties, resources: "depleted" },
      };
    case "return-to-father":
      return {
        ...state,
        version: state.version + 1,
        phase: "RETURNING",
        properties: {
          ...state.properties,
          returnStatus: "returned",
          locationRelation: "with-father",
        },
      };
    case "receive-son":
      return {
        ...state,
        version: state.version + 1,
        phase: "RECEIVED_INTO_HOUSEHOLD",
        properties: { ...state.properties, receptionStatus: "received" },
      };
    default:
      return state;
  }
}

export function replayProdigal(
  events: readonly Event[] = PRODIGAL_EVENTS
): AggregateState {
  return events.reduce(reduceProdigal, INITIAL_PRODIGAL_STATE);
}

export const PRODIGAL_STATUS_PROJECTION: Projection<
  AggregateState,
  Readonly<Record<string, unknown>>
> = {
  id: "Projection-ProdigalStatus" as ProjectionId,
  name: "ProdigalStatusProjection",
  derive: (state) => ({
    phase: state.phase,
    locationRelation: state.properties.locationRelation,
    resources: state.properties.resources,
    returnStatus: state.properties.returnStatus,
    receptionStatus: state.properties.receptionStatus,
    version: state.version,
  }),
};

export const PRODIGAL_RESTORATION_RULE: Rule = {
  id: rule("ProdigalRestorationPattern"),
  name: "ProdigalRestorationPattern",
  kind: "interpretive",
  premises: ["returnStatus = returned", "receptionStatus = received"],
  conclusion: "RestorationPattern(x)",
  justification:
    "Interpretive category applied to return-plus-reception; not a canonical event.",
};

export const PRODIGAL_RESTORATION_AUTHORIZATION: RuleAuthorization = {
  id: authz("Authz-ProdigalRestorationPattern"),
  ruleId: PRODIGAL_RESTORATION_RULE.id,
  authoritySource: "theological-lens",
  basis: "declared-lens",
  scope: "interpretive-projection",
  status: "authorized-for-lens",
  provenance: [gospel("Luke", 15, 20, 24)],
};

export const PRODIGAL_RESTORATION_LENS: Lens<AggregateState> = {
  id: "Lens-Prodigal-Restoration" as LensId,
  name: "Prodigal Restoration Lens",
  interpret: (state) => {
    if (
      state.properties.returnStatus !== "returned" ||
      state.properties.receptionStatus !== "received"
    ) return [];

    return [{
      name: "RestorationPattern",
      value: true,
      sourceEventIds: [
        event("Event-Prodigal-Returned"),
        event("Event-Prodigal-Received"),
      ],
      sourceAggregateIds: [PRODIGAL_AGGREGATE],
      sourceProjectionIds: [PRODIGAL_STATUS_PROJECTION.id],
      derivationRuleId: PRODIGAL_RESTORATION_RULE.id,
      ruleAuthorizationId: PRODIGAL_RESTORATION_AUTHORIZATION.id,
      lensId: "Lens-Prodigal-Restoration" as LensId,
      epistemicStatus: "interpretive",
    }];
  },
};

export const PRODIGAL_SON_NARRATIVE: Narrative = {
  id: "Narrative-Luke-15-Prodigal" as NarrativeId,
  title: "The Prodigal Son",
  kind: "parable",
  source: { work: "Luke", chapter: 15, verseStart: 11, verseEnd: 32 },
  actors: [
    { id: PRODIGAL_FATHER, label: "Father" },
    { id: PRODIGAL_OLDER, label: "Older son" },
  ],
  entities: [PRODIGAL_ENTITY],
  aggregates: [PRODIGAL_AGGREGATE_DEFINITION],
  extractions: [
    PRODIGAL_EXTRACT_DEPARTURE,
    PRODIGAL_EXTRACT_SPENDING,
    PRODIGAL_EXTRACT_NEED,
    PRODIGAL_EXTRACT_RETURN,
    PRODIGAL_EXTRACT_RECEIVED,
  ],
  admissions: [...PRODIGAL_ADMISSIONS, PRODIGAL_NEED_ADMISSION],
  events: PRODIGAL_EVENTS,
  commands: [],
  stateClaims: PRODIGAL_STATE_CLAIMS,
  relations: [
    {
      id: "Prodigal-Rel-Return-To-Father" as RelationId,
      sourceId: event("Event-Prodigal-Returned"),
      targetId: PRODIGAL_FATHER,
      relation: "targets",
      provenance: [gospel("Luke", 15, 20, 20)],
      epistemicLayer: "admitted",
    },
    {
      id: "Prodigal-Rel-Father-Receives-Son" as RelationId,
      sourceId: PRODIGAL_FATHER,
      targetId: PRODIGAL_YOUNGER,
      relation: "acts-on",
      provenance: [gospel("Luke", 15, 20, 24)],
      epistemicLayer: "admitted",
    },
  ],
};



export const PRODIGAL_GRAPH = narrativeToGraph(PRODIGAL_SON_NARRATIVE);

export const PRODIGAL_RESTORATION_CONCEPTS =
  PRODIGAL_RESTORATION_LENS.interpret(replayProdigal());

export const PRODIGAL_LENSED_GRAPH = withDerivedConcepts(
  PRODIGAL_GRAPH,
  PRODIGAL_RESTORATION_CONCEPTS
);

export const SOWER = actor("Sower");

export const WAYSIDE_SEED = entity("Sower-WaysideSeed");
export const STONY_SEED = entity("Sower-StonySeed");
export const THORNS_SEED = entity("Sower-ThornsSeed");
export const GOOD_GROUND_SEED = entity("Sower-GoodGroundSeed");

export const WAYSIDE_AGGREGATE = aggregate("Sower-WaysideAggregate");
export const STONY_AGGREGATE = aggregate("Sower-StonyAggregate");
export const THORNS_AGGREGATE = aggregate("Sower-ThornsAggregate");
export const GOOD_GROUND_AGGREGATE = aggregate("Sower-GoodGroundAggregate");

function seedEntity(
  id: EntityId,
  label: string,
  verseStart: number,
  verseEnd: number
): Entity {
  return {
    id,
    label,
    mentions: [
      {
        surface: "seed",
        provenance: gospel("Matthew", 13, verseStart, verseEnd),
      },
    ],
  };
}

export const SOWER_ENTITIES: readonly Entity[] = [
  seedEntity(WAYSIDE_SEED, "Seed by the wayside", 4, 4),
  seedEntity(STONY_SEED, "Seed on stony ground", 5, 6),
  seedEntity(THORNS_SEED, "Seed among thorns", 7, 7),
  seedEntity(GOOD_GROUND_SEED, "Seed on good ground", 8, 8),
];

function seedAggregate(
  id: AggregateId,
  entityId: EntityId
): AggregateDefinition {
  return {
    id,
    entityId,
    invariants: [
      "Each receiving context maintains an independent outcome state.",
      "Divergent outcomes do not imply an interpretive cause beyond admitted narrative events.",
      "Fruitfulness is a state/output property; theological meaning remains downstream.",
    ],
    permittedOperations: [
      "sow",
      "be-devoured",
      "spring-up",
      "wither",
      "be-choked",
      "bear-fruit",
    ],
    transitionRuleIds: [],
  };
}

export const SOWER_AGGREGATES: readonly AggregateDefinition[] = [
  seedAggregate(WAYSIDE_AGGREGATE, WAYSIDE_SEED),
  seedAggregate(STONY_AGGREGATE, STONY_SEED),
  seedAggregate(THORNS_AGGREGATE, THORNS_SEED),
  seedAggregate(GOOD_GROUND_AGGREGATE, GOOD_GROUND_SEED),
];

export const SOWER_EXTRACT_SOW_WAYSIDE: Extraction = {
  id: extraction("Sower-Extract-SowWayside"),
  source: gospel("Matthew", 13, 4, 4, "some seeds fell by the way side"),
  sourceSpan: "some seeds fell by the way side",
  kind: "event-proposition",
  subject: SOWER,
  predicate: "sow-wayside",
  arguments: [WAYSIDE_SEED],
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const SOWER_EXTRACT_DEVOUR: Extraction = {
  id: extraction("Sower-Extract-Devour"),
  source: gospel("Matthew", 13, 4, 4, "the fowls came and devoured them up"),
  sourceSpan: "the fowls came and devoured them up",
  kind: "event-proposition",
  subject: WAYSIDE_SEED,
  predicate: "be-devoured",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const SOWER_EXTRACT_SOW_STONY: Extraction = {
  id: extraction("Sower-Extract-SowStony"),
  source: gospel("Matthew", 13, 5, 5, "some fell upon stony places"),
  sourceSpan: "some fell upon stony places",
  kind: "event-proposition",
  subject: SOWER,
  predicate: "sow-stony-ground",
  arguments: [STONY_SEED],
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const SOWER_EXTRACT_SPRING: Extraction = {
  id: extraction("Sower-Extract-Spring"),
  source: gospel("Matthew", 13, 5, 5, "forthwith they sprung up"),
  sourceSpan: "forthwith they sprung up",
  kind: "event-proposition",
  subject: STONY_SEED,
  predicate: "spring-up",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const SOWER_EXTRACT_WITHER: Extraction = {
  id: extraction("Sower-Extract-Wither"),
  source: gospel("Matthew", 13, 6, 6, "they were scorched ... they withered away"),
  sourceSpan: "they were scorched ... they withered away",
  kind: "event-proposition",
  subject: STONY_SEED,
  predicate: "wither",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const SOWER_EXTRACT_SOW_THORNS: Extraction = {
  id: extraction("Sower-Extract-SowThorns"),
  source: gospel("Matthew", 13, 7, 7, "some fell among thorns"),
  sourceSpan: "some fell among thorns",
  kind: "event-proposition",
  subject: SOWER,
  predicate: "sow-thorns",
  arguments: [THORNS_SEED],
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const SOWER_EXTRACT_CHOKED: Extraction = {
  id: extraction("Sower-Extract-Choked"),
  source: gospel("Matthew", 13, 7, 7, "the thorns sprung up, and choked them"),
  sourceSpan: "the thorns sprung up, and choked them",
  kind: "event-proposition",
  subject: THORNS_SEED,
  predicate: "be-choked",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const SOWER_EXTRACT_SOW_GOOD: Extraction = {
  id: extraction("Sower-Extract-SowGood"),
  source: gospel("Matthew", 13, 8, 8, "other fell into good ground"),
  sourceSpan: "other fell into good ground",
  kind: "event-proposition",
  subject: SOWER,
  predicate: "sow-good-ground",
  arguments: [GOOD_GROUND_SEED],
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const SOWER_EXTRACT_FRUIT: Extraction = {
  id: extraction("Sower-Extract-Fruit"),
  source: gospel("Matthew", 13, 8, 8, "brought forth fruit"),
  sourceSpan: "brought forth fruit",
  kind: "event-proposition",
  subject: GOOD_GROUND_SEED,
  predicate: "bear-fruit",
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const SOWER_EXTRACTIONS: readonly Extraction[] = [
  SOWER_EXTRACT_SOW_WAYSIDE,
  SOWER_EXTRACT_DEVOUR,
  SOWER_EXTRACT_SOW_STONY,
  SOWER_EXTRACT_SPRING,
  SOWER_EXTRACT_WITHER,
  SOWER_EXTRACT_SOW_THORNS,
  SOWER_EXTRACT_CHOKED,
  SOWER_EXTRACT_SOW_GOOD,
  SOWER_EXTRACT_FRUIT,
];

export const SOWER_ADMISSIONS: readonly Admission[] = SOWER_EXTRACTIONS.map((x) => ({
  id: admission(`Admission-${x.id}`),
  extractionId: x.id,
  ruleAuthorizationId: authz("Authz-CanonicalNarrativeAssertion"),
  authentication: {
    sourceAuthority: "canonical-narrator" as const,
    basis: "Direct canonical narrative assertion within the parable.",
    provenance: [x.source],
  },
  outcome: "admitted-event" as const,
  epistemicStatus: "asserted" as const,
  resultingIds: [`Event-${x.id}`],
  provenance: [x.source],
}));

export const SOWER_EVENTS: readonly Event[] = [
  {
    id: event("Event-Sower-SowWayside"),
    kind: "action",
    actor: SOWER,
    target: WAYSIDE_SEED,
    operation: "sow",
    affectedAggregates: [WAYSIDE_AGGREGATE],
    admittedFrom: [SOWER_ADMISSIONS[0].id],
    provenance: [gospel("Matthew", 13, 4, 4)],
  },
  {
    id: event("Event-Sower-WaysideDevoured"),
    kind: "state-transition",
    actor: WAYSIDE_SEED,
    operation: "be-devoured",
    affectedAggregates: [WAYSIDE_AGGREGATE],
    admittedFrom: [SOWER_ADMISSIONS[1].id],
    provenance: [gospel("Matthew", 13, 4, 4)],
  },
  {
    id: event("Event-Sower-SowStony"),
    kind: "action",
    actor: SOWER,
    target: STONY_SEED,
    operation: "sow",
    affectedAggregates: [STONY_AGGREGATE],
    admittedFrom: [SOWER_ADMISSIONS[2].id],
    provenance: [gospel("Matthew", 13, 5, 5)],
  },
  {
    id: event("Event-Sower-StonySprang"),
    kind: "state-transition",
    actor: STONY_SEED,
    operation: "spring-up",
    affectedAggregates: [STONY_AGGREGATE],
    admittedFrom: [SOWER_ADMISSIONS[3].id],
    provenance: [gospel("Matthew", 13, 5, 5)],
  },
  {
    id: event("Event-Sower-StonyWithered"),
    kind: "state-transition",
    actor: STONY_SEED,
    operation: "wither",
    affectedAggregates: [STONY_AGGREGATE],
    admittedFrom: [SOWER_ADMISSIONS[4].id],
    provenance: [gospel("Matthew", 13, 6, 6)],
  },
  {
    id: event("Event-Sower-SowThorns"),
    kind: "action",
    actor: SOWER,
    target: THORNS_SEED,
    operation: "sow",
    affectedAggregates: [THORNS_AGGREGATE],
    admittedFrom: [SOWER_ADMISSIONS[5].id],
    provenance: [gospel("Matthew", 13, 7, 7)],
  },
  {
    id: event("Event-Sower-ThornsChoked"),
    kind: "state-transition",
    actor: THORNS_SEED,
    operation: "be-choked",
    affectedAggregates: [THORNS_AGGREGATE],
    admittedFrom: [SOWER_ADMISSIONS[6].id],
    provenance: [gospel("Matthew", 13, 7, 7)],
  },
  {
    id: event("Event-Sower-SowGood"),
    kind: "action",
    actor: SOWER,
    target: GOOD_GROUND_SEED,
    operation: "sow",
    affectedAggregates: [GOOD_GROUND_AGGREGATE],
    admittedFrom: [SOWER_ADMISSIONS[7].id],
    provenance: [gospel("Matthew", 13, 8, 8)],
  },
  {
    id: event("Event-Sower-GoodFruit"),
    kind: "state-transition",
    actor: GOOD_GROUND_SEED,
    operation: "bear-fruit",
    affectedAggregates: [GOOD_GROUND_AGGREGATE],
    admittedFrom: [SOWER_ADMISSIONS[8].id],
    provenance: [gospel("Matthew", 13, 8, 8)],
  },
];

export interface SowerOutcomeState {
  readonly aggregateId: AggregateId;
  readonly entityId: EntityId;
  readonly version: number;
  readonly phase: "UNSOWN" | "RECEIVED" | "GERMINATED" | "TERMINATED" | "FRUITFUL";
  readonly outcome: "unknown" | "devoured" | "withered" | "choked" | "fruitful";
}

function initialSowerState(
  aggregateId: AggregateId,
  entityId: EntityId
): SowerOutcomeState {
  return {
    aggregateId,
    entityId,
    version: 0,
    phase: "UNSOWN",
    outcome: "unknown",
  };
}

export function reduceSowerOutcome(
  state: SowerOutcomeState,
  e: Event
): SowerOutcomeState {
  if (e.affectedAggregates.indexOf(state.aggregateId) < 0) return state;

  switch (e.operation) {
    case "sow":
      return { ...state, version: state.version + 1, phase: "RECEIVED" };
    case "spring-up":
      return { ...state, version: state.version + 1, phase: "GERMINATED" };
    case "be-devoured":
      return {
        ...state,
        version: state.version + 1,
        phase: "TERMINATED",
        outcome: "devoured",
      };
    case "wither":
      return {
        ...state,
        version: state.version + 1,
        phase: "TERMINATED",
        outcome: "withered",
      };
    case "be-choked":
      return {
        ...state,
        version: state.version + 1,
        phase: "TERMINATED",
        outcome: "choked",
      };
    case "bear-fruit":
      return {
        ...state,
        version: state.version + 1,
        phase: "FRUITFUL",
        outcome: "fruitful",
      };
    default:
      return state;
  }
}

export interface SowerBranchProjectionValue {
  readonly wayside: SowerOutcomeState;
  readonly stony: SowerOutcomeState;
  readonly thorns: SowerOutcomeState;
  readonly goodGround: SowerOutcomeState;
}

export function replaySower(
  events: readonly Event[] = SOWER_EVENTS
): SowerBranchProjectionValue {
  const initial: SowerBranchProjectionValue = {
    wayside: initialSowerState(WAYSIDE_AGGREGATE, WAYSIDE_SEED),
    stony: initialSowerState(STONY_AGGREGATE, STONY_SEED),
    thorns: initialSowerState(THORNS_AGGREGATE, THORNS_SEED),
    goodGround: initialSowerState(GOOD_GROUND_AGGREGATE, GOOD_GROUND_SEED),
  };

  return events.reduce<SowerBranchProjectionValue>(
    (state, e) => ({
      wayside: reduceSowerOutcome(state.wayside, e),
      stony: reduceSowerOutcome(state.stony, e),
      thorns: reduceSowerOutcome(state.thorns, e),
      goodGround: reduceSowerOutcome(state.goodGround, e),
    }),
    initial
  );
}

export const SOWER_BRANCH_PROJECTION: Projection<
  readonly Event[],
  SowerBranchProjectionValue
> = {
  id: "Projection-SowerBranches" as ProjectionId,
  name: "SowerBranchProjection",
  derive: replaySower,
};

export const SOWER_DIVERGENCE_RULE: Rule = {
  id: rule("SowerDivergentOutcomePattern"),
  name: "SowerDivergentOutcomePattern",
  kind: "interpretive",
  premises: [
    "same sowing action class",
    "different receiving contexts",
    "different terminal outcomes",
  ],
  conclusion: "DivergentOutcomePattern",
  justification:
    "Interpretive pattern over mechanically distinct branch outcomes; does not identify theological meaning.",
};

export const SOWER_DIVERGENCE_AUTHORIZATION: RuleAuthorization = {
  id: authz("Authz-SowerDivergentOutcomePattern"),
  ruleId: SOWER_DIVERGENCE_RULE.id,
  authoritySource: "theological-lens",
  basis: "declared-lens",
  scope: "interpretive-projection",
  status: "authorized-for-lens",
  provenance: [gospel("Matthew", 13, 4, 8)],
};

export const SOWER_DIVERGENCE_LENS: Lens<SowerBranchProjectionValue> = {
  id: "Lens-Sower-Divergence" as LensId,
  name: "Sower Divergence Lens",
  interpret: (branches) => {
    const outcomes = [
      branches.wayside.outcome,
      branches.stony.outcome,
      branches.thorns.outcome,
      branches.goodGround.outcome,
    ];
    const distinct = new Set(outcomes.filter((x) => x !== "unknown"));
    if (distinct.size < 2) return [];

    return [{
      name: "DivergentOutcomePattern",
      value: outcomes,
      sourceEventIds: SOWER_EVENTS.map((e) => e.id),
      sourceAggregateIds: [
        WAYSIDE_AGGREGATE,
        STONY_AGGREGATE,
        THORNS_AGGREGATE,
        GOOD_GROUND_AGGREGATE,
      ],
      sourceProjectionIds: [SOWER_BRANCH_PROJECTION.id],
      derivationRuleId: SOWER_DIVERGENCE_RULE.id,
      ruleAuthorizationId: SOWER_DIVERGENCE_AUTHORIZATION.id,
      lensId: "Lens-Sower-Divergence" as LensId,
      epistemicStatus: "interpretive",
    }];
  },
};

export const SOWER_NARRATIVE: Narrative = {
  id: "Narrative-Matthew-13-Sower" as NarrativeId,
  title: "The Sower",
  kind: "parable",
  source: { work: "Matthew", chapter: 13, verseStart: 3, verseEnd: 9 },
  actors: [{ id: SOWER, label: "Sower" }],
  entities: SOWER_ENTITIES,
  aggregates: SOWER_AGGREGATES,
  extractions: SOWER_EXTRACTIONS,
  admissions: SOWER_ADMISSIONS,
  events: SOWER_EVENTS,
  commands: [],
  stateClaims: [],
  relations: [],
};

export const SOWER_GRAPH = narrativeToGraph(SOWER_NARRATIVE);
export const SOWER_DIVERGENCE_CONCEPTS =
  SOWER_DIVERGENCE_LENS.interpret(replaySower());
export const SOWER_LENSED_GRAPH = withDerivedConcepts(
  SOWER_GRAPH,
  SOWER_DIVERGENCE_CONCEPTS
);

export const TALENTS_MASTER = actor("Talents-Master");
export const TALENTS_SERVANT_5 = actor("Talents-ServantFive");
export const TALENTS_SERVANT_2 = actor("Talents-ServantTwo");
export const TALENTS_SERVANT_1 = actor("Talents-ServantOne");

export const TALENTS_ASSET_5 = entity("Talents-AssetFive");
export const TALENTS_ASSET_2 = entity("Talents-AssetTwo");
export const TALENTS_ASSET_1 = entity("Talents-AssetOne");

export const TALENTS_AGGREGATE_5 = aggregate("Talents-AggregateFive");
export const TALENTS_AGGREGATE_2 = aggregate("Talents-AggregateTwo");
export const TALENTS_AGGREGATE_1 = aggregate("Talents-AggregateOne");

export const TALENTS_AUTHORITY_GRANT_5: AuthorityGrant = {
  kind: "authority-grant",
  id: "AuthorityGrant-Talents-Five" as AuthorityGrantId,
  sourceActor: TALENTS_MASTER,
  bearer: TALENTS_SERVANT_5,
  scope: {
    domain: "entrusted-assets",
    operations: ["manage-five"],
    targets: [TALENTS_ASSET_5],
  },
  permissions: ["act"],
  conditions: ["accountability to master"],
  provenance: [gospel("Matthew", 25, 15, 15)],
};

export const TALENTS_AUTHORITY_GRANT_2: AuthorityGrant = {
  kind: "authority-grant",
  id: "AuthorityGrant-Talents-Two" as AuthorityGrantId,
  sourceActor: TALENTS_MASTER,
  bearer: TALENTS_SERVANT_2,
  scope: {
    domain: "entrusted-assets",
    operations: ["manage-two"],
    targets: [TALENTS_ASSET_2],
  },
  permissions: ["act"],
  conditions: ["accountability to master"],
  provenance: [gospel("Matthew", 25, 15, 15)],
};

export const TALENTS_AUTHORITY_GRANT_1: AuthorityGrant = {
  kind: "authority-grant",
  id: "AuthorityGrant-Talents-One" as AuthorityGrantId,
  sourceActor: TALENTS_MASTER,
  bearer: TALENTS_SERVANT_1,
  scope: {
    domain: "entrusted-assets",
    operations: ["manage-one"],
    targets: [TALENTS_ASSET_1],
  },
  permissions: ["act"],
  conditions: ["accountability to master"],
  provenance: [gospel("Matthew", 25, 15, 15)],
};

function talentsAsset(id: EntityId, label: string): Entity {
  return {
    id,
    label,
    mentions: [{
      surface: "talents",
      provenance: gospel("Matthew", 25, 15, 15),
    }],
  };
}

export const TALENTS_ENTITIES: readonly Entity[] = [
  talentsAsset(TALENTS_ASSET_5, "Five entrusted talents"),
  talentsAsset(TALENTS_ASSET_2, "Two entrusted talents"),
  talentsAsset(TALENTS_ASSET_1, "One entrusted talent"),
];

function talentsAggregate(
  id: AggregateId,
  entityId: EntityId,
  operation: string
): AggregateDefinition {
  return {
    id,
    entityId,
    invariants: [
      "Entrusted resources remain distinct by servant.",
      "Possession of entrusted resources does not imply autonomous source authority.",
      "Outcome does not retroactively establish authority.",
      "Accountability is distinct from resource outcome.",
    ],
    permittedOperations: [operation, "account"],
    transitionRuleIds: [],
  };
}

export const TALENTS_AGGREGATES: readonly AggregateDefinition[] = [
  talentsAggregate(TALENTS_AGGREGATE_5, TALENTS_ASSET_5, "manage-five"),
  talentsAggregate(TALENTS_AGGREGATE_2, TALENTS_ASSET_2, "manage-two"),
  talentsAggregate(TALENTS_AGGREGATE_1, TALENTS_ASSET_1, "manage-one"),
];

export const TALENTS_EXTRACTIONS: readonly Extraction[] = [
  {
    id: extraction("Talents-Extract-EntrustFive"),
    source: gospel("Matthew", 25, 15, 15, "unto one he gave five talents"),
    sourceSpan: "unto one he gave five talents",
    kind: "event-proposition",
    subject: TALENTS_MASTER,
    predicate: "entrust-five",
    arguments: [TALENTS_SERVANT_5, TALENTS_ASSET_5],
    modality: "asserted",
    polarity: "positive",
    normalizationRuleIds: [],
  },
  {
    id: extraction("Talents-Extract-EntrustTwo"),
    source: gospel("Matthew", 25, 15, 15, "to another two"),
    sourceSpan: "to another two",
    kind: "event-proposition",
    subject: TALENTS_MASTER,
    predicate: "entrust-two",
    arguments: [TALENTS_SERVANT_2, TALENTS_ASSET_2],
    modality: "asserted",
    polarity: "positive",
    normalizationRuleIds: [],
  },
  {
    id: extraction("Talents-Extract-EntrustOne"),
    source: gospel("Matthew", 25, 15, 15, "to another one"),
    sourceSpan: "to another one",
    kind: "event-proposition",
    subject: TALENTS_MASTER,
    predicate: "entrust-one",
    arguments: [TALENTS_SERVANT_1, TALENTS_ASSET_1],
    modality: "asserted",
    polarity: "positive",
    normalizationRuleIds: [],
  },
  {
    id: extraction("Talents-Extract-GainFive"),
    source: gospel("Matthew", 25, 16, 16, "made them other five talents"),
    sourceSpan: "made them other five talents",
    kind: "event-proposition",
    subject: TALENTS_SERVANT_5,
    predicate: "gain-five",
    arguments: [TALENTS_ASSET_5],
    modality: "asserted",
    polarity: "positive",
    normalizationRuleIds: [],
  },
  {
    id: extraction("Talents-Extract-GainTwo"),
    source: gospel("Matthew", 25, 17, 17, "he also gained other two"),
    sourceSpan: "he also gained other two",
    kind: "event-proposition",
    subject: TALENTS_SERVANT_2,
    predicate: "gain-two",
    arguments: [TALENTS_ASSET_2],
    modality: "asserted",
    polarity: "positive",
    normalizationRuleIds: [],
  },
  {
    id: extraction("Talents-Extract-HideOne"),
    source: gospel("Matthew", 25, 18, 18, "hid his lord's money"),
    sourceSpan: "hid his lord's money",
    kind: "event-proposition",
    subject: TALENTS_SERVANT_1,
    predicate: "hide-one",
    arguments: [TALENTS_ASSET_1],
    modality: "asserted",
    polarity: "positive",
    normalizationRuleIds: [],
  },
  {
    id: extraction("Talents-Extract-Account"),
    source: gospel("Matthew", 25, 19, 19, "reckoneth with them"),
    sourceSpan: "reckoneth with them",
    kind: "event-proposition",
    subject: TALENTS_MASTER,
    predicate: "settle-accounts",
    modality: "asserted",
    polarity: "positive",
    normalizationRuleIds: [],
  },
];

export const TALENTS_ADMISSIONS: readonly Admission[] = TALENTS_EXTRACTIONS.map((x) => ({
  id: admission(`Admission-${x.id}`),
  extractionId: x.id,
  ruleAuthorizationId: authz("Authz-CanonicalNarrativeAssertion"),
  authentication: {
    sourceAuthority: "canonical-narrator" as const,
    basis: "Direct canonical narrative assertion within the parable.",
    provenance: [x.source],
  },
  outcome: "admitted-event" as const,
  epistemicStatus: "asserted" as const,
  resultingIds: [`Event-${x.id}`],
  provenance: [x.source],
}));

export const TALENTS_EVENTS: readonly Event[] = [
  {
    id: event("Event-Talents-EntrustFive"),
    kind: "action",
    actor: TALENTS_MASTER,
    target: TALENTS_SERVANT_5,
    operation: "entrust-five",
    affectedAggregates: [TALENTS_AGGREGATE_5],
    admittedFrom: [TALENTS_ADMISSIONS[0].id],
    provenance: [gospel("Matthew", 25, 15, 15)],
  },
  {
    id: event("Event-Talents-EntrustTwo"),
    kind: "action",
    actor: TALENTS_MASTER,
    target: TALENTS_SERVANT_2,
    operation: "entrust-two",
    affectedAggregates: [TALENTS_AGGREGATE_2],
    admittedFrom: [TALENTS_ADMISSIONS[1].id],
    provenance: [gospel("Matthew", 25, 15, 15)],
  },
  {
    id: event("Event-Talents-EntrustOne"),
    kind: "action",
    actor: TALENTS_MASTER,
    target: TALENTS_SERVANT_1,
    operation: "entrust-one",
    affectedAggregates: [TALENTS_AGGREGATE_1],
    admittedFrom: [TALENTS_ADMISSIONS[2].id],
    provenance: [gospel("Matthew", 25, 15, 15)],
  },
  {
    id: event("Event-Talents-GainFive"),
    kind: "action",
    actor: TALENTS_SERVANT_5,
    operation: "gain-five",
    affectedAggregates: [TALENTS_AGGREGATE_5],
    admittedFrom: [TALENTS_ADMISSIONS[3].id],
    provenance: [gospel("Matthew", 25, 16, 16)],
  },
  {
    id: event("Event-Talents-GainTwo"),
    kind: "action",
    actor: TALENTS_SERVANT_2,
    operation: "gain-two",
    affectedAggregates: [TALENTS_AGGREGATE_2],
    admittedFrom: [TALENTS_ADMISSIONS[4].id],
    provenance: [gospel("Matthew", 25, 17, 17)],
  },
  {
    id: event("Event-Talents-HideOne"),
    kind: "action",
    actor: TALENTS_SERVANT_1,
    operation: "hide-one",
    affectedAggregates: [TALENTS_AGGREGATE_1],
    admittedFrom: [TALENTS_ADMISSIONS[5].id],
    provenance: [gospel("Matthew", 25, 18, 18)],
  },
  {
    id: event("Event-Talents-Account"),
    kind: "action",
    actor: TALENTS_MASTER,
    operation: "settle-accounts",
    affectedAggregates: [
      TALENTS_AGGREGATE_5,
      TALENTS_AGGREGATE_2,
      TALENTS_AGGREGATE_1,
    ],
    admittedFrom: [TALENTS_ADMISSIONS[6].id],
    provenance: [gospel("Matthew", 25, 19, 19)],
  },
];

export interface TalentState {
  readonly aggregateId: AggregateId;
  readonly entityId: EntityId;
  readonly version: number;
  readonly entrusted: boolean;
  readonly outcome: "unknown" | "increased" | "preserved-hidden";
  readonly accountabilityReached: boolean;
}

function initialTalentState(
  aggregateId: AggregateId,
  entityId: EntityId
): TalentState {
  return {
    aggregateId,
    entityId,
    version: 0,
    entrusted: false,
    outcome: "unknown",
    accountabilityReached: false,
  };
}

export function reduceTalentState(
  state: TalentState,
  e: Event
): TalentState {
  if (e.affectedAggregates.indexOf(state.aggregateId) < 0) return state;

  switch (e.operation) {
    case "entrust-five":
    case "entrust-two":
    case "entrust-one":
      return {
        ...state,
        version: state.version + 1,
        entrusted: true,
      };

    case "gain-five":
    case "gain-two":
      return {
        ...state,
        version: state.version + 1,
        outcome: "increased",
      };

    case "hide-one":
      return {
        ...state,
        version: state.version + 1,
        outcome: "preserved-hidden",
      };

    case "settle-accounts":
      return {
        ...state,
        version: state.version + 1,
        accountabilityReached: true,
      };

    default:
      return state;
  }
}

export interface TalentsProjectionValue {
  readonly five: TalentState;
  readonly two: TalentState;
  readonly one: TalentState;
}

export function replayTalents(
  events: readonly Event[] = TALENTS_EVENTS
): TalentsProjectionValue {
  const initial: TalentsProjectionValue = {
    five: initialTalentState(TALENTS_AGGREGATE_5, TALENTS_ASSET_5),
    two: initialTalentState(TALENTS_AGGREGATE_2, TALENTS_ASSET_2),
    one: initialTalentState(TALENTS_AGGREGATE_1, TALENTS_ASSET_1),
  };

  return events.reduce<TalentsProjectionValue>(
    (state, e) => ({
      five: reduceTalentState(state.five, e),
      two: reduceTalentState(state.two, e),
      one: reduceTalentState(state.one, e),
    }),
    initial
  );
}

export const TALENTS_PROJECTION: Projection<
  readonly Event[],
  TalentsProjectionValue
> = {
  id: "Projection-Talents" as ProjectionId,
  name: "TalentsProjection",
  derive: replayTalents,
};

export const TALENTS_ACCOUNTABILITY_RULE: Rule = {
  id: rule("TalentsAccountabilityPattern"),
  name: "TalentsAccountabilityPattern",
  kind: "interpretive",
  premises: [
    "entrusted resource",
    "servant outcome",
    "master settles accounts",
  ],
  conclusion: "AccountabilityPattern",
  justification:
    "Interpretive pattern over entrustment and later accounting; does not infer authority from success.",
};

export const TALENTS_ACCOUNTABILITY_AUTHORIZATION: RuleAuthorization = {
  id: authz("Authz-TalentsAccountabilityPattern"),
  ruleId: TALENTS_ACCOUNTABILITY_RULE.id,
  authoritySource: "theological-lens",
  basis: "declared-lens",
  scope: "interpretive-projection",
  status: "authorized-for-lens",
  provenance: [gospel("Matthew", 25, 14, 30)],
};

export const TALENTS_ACCOUNTABILITY_LENS: Lens<TalentsProjectionValue> = {
  id: "Lens-Talents-Accountability" as LensId,
  name: "Talents Accountability Lens",
  interpret: (state) => {
    if (
      !state.five.accountabilityReached ||
      !state.two.accountabilityReached ||
      !state.one.accountabilityReached
    ) return [];

    return [{
      name: "AccountabilityPattern",
      value: {
        five: state.five.outcome,
        two: state.two.outcome,
        one: state.one.outcome,
      },
      sourceEventIds: TALENTS_EVENTS.map((e) => e.id),
      sourceAggregateIds: [
        TALENTS_AGGREGATE_5,
        TALENTS_AGGREGATE_2,
        TALENTS_AGGREGATE_1,
      ],
      sourceProjectionIds: [TALENTS_PROJECTION.id],
      derivationRuleId: TALENTS_ACCOUNTABILITY_RULE.id,
      ruleAuthorizationId: TALENTS_ACCOUNTABILITY_AUTHORIZATION.id,
      lensId: "Lens-Talents-Accountability" as LensId,
      epistemicStatus: "interpretive",
    }];
  },
};

export const TALENTS_NARRATIVE: Narrative = {
  id: "Narrative-Matthew-25-Talents" as NarrativeId,
  title: "The Talents",
  kind: "parable",
  source: { work: "Matthew", chapter: 25, verseStart: 14, verseEnd: 30 },
  actors: [
    { id: TALENTS_MASTER, label: "Master" },
    { id: TALENTS_SERVANT_5, label: "Servant with five talents" },
    { id: TALENTS_SERVANT_2, label: "Servant with two talents" },
    { id: TALENTS_SERVANT_1, label: "Servant with one talent" },
  ],
  entities: TALENTS_ENTITIES,
  aggregates: TALENTS_AGGREGATES,
  extractions: TALENTS_EXTRACTIONS,
  admissions: TALENTS_ADMISSIONS,
  events: TALENTS_EVENTS,
  commands: [],
  stateClaims: [],
  relations: [],
};

export const TALENTS_GRAPH = narrativeToGraph(TALENTS_NARRATIVE);
export const TALENTS_ACCOUNTABILITY_CONCEPTS =
  TALENTS_ACCOUNTABILITY_LENS.interpret(replayTalents());
export const TALENTS_LENSED_GRAPH = withDerivedConcepts(
  TALENTS_GRAPH,
  TALENTS_ACCOUNTABILITY_CONCEPTS
);

export const SHEPHERD = actor("LostSheep-Shepherd");
export const SHEEP_ENTITY = entity("LostSheep-One");
export const SHEEP_AGGREGATE = aggregate("LostSheep-OneAggregate");

export const LOST_SHEEP_ENTITY: Entity = {
  id: SHEEP_ENTITY,
  label: "One sheep",
  mentions: [
    {
      surface: "one of them",
      provenance: gospel("Luke", 15, 4, 4),
    },
    {
      surface: "that which is lost",
      provenance: gospel("Luke", 15, 4, 4),
    },
  ],
};

export const LOST_SHEEP_AGGREGATE_DEFINITION: AggregateDefinition = {
  id: SHEEP_AGGREGATE,
  entityId: SHEEP_ENTITY,
  invariants: [
    "Collection membership and current located-state are independent dimensions.",
    "Lost does not imply no-longer-member.",
    "Found does not imply a theological interpretation unless a lens supplies one.",
    "Search activity does not itself imply successful finding.",
  ],
  permittedOperations: [
    "become-lost",
    "seek",
    "find",
    "return-to-flock",
  ],
  transitionRuleIds: [],
};

export const LOST_SHEEP_EXTRACT_LOST: Extraction = {
  id: extraction("LostSheep-Extract-Lost"),
  source: gospel("Luke", 15, 4, 4, "if he lose one of them"),
  sourceSpan: "if he lose one of them",
  kind: "state-proposition",
  subject: SHEEP_ENTITY,
  predicate: "lost",
  modality: "conditional",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const LOST_SHEEP_EXTRACT_SEEK: Extraction = {
  id: extraction("LostSheep-Extract-Seek"),
  source: gospel("Luke", 15, 4, 4, "go after that which is lost"),
  sourceSpan: "go after that which is lost",
  kind: "event-proposition",
  subject: SHEPHERD,
  predicate: "seek",
  arguments: [SHEEP_ENTITY],
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const LOST_SHEEP_EXTRACT_FOUND: Extraction = {
  id: extraction("LostSheep-Extract-Found"),
  source: gospel("Luke", 15, 5, 5, "when he hath found it"),
  sourceSpan: "when he hath found it",
  kind: "event-proposition",
  subject: SHEPHERD,
  predicate: "find",
  arguments: [SHEEP_ENTITY],
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const LOST_SHEEP_EXTRACT_RETURN: Extraction = {
  id: extraction("LostSheep-Extract-Return"),
  source: gospel("Luke", 15, 5, 6, "he layeth it on his shoulders ... cometh home"),
  sourceSpan: "he layeth it on his shoulders ... cometh home",
  kind: "event-proposition",
  subject: SHEPHERD,
  predicate: "return-to-flock",
  arguments: [SHEEP_ENTITY],
  modality: "asserted",
  polarity: "positive",
  normalizationRuleIds: [],
};

export const LOST_SHEEP_ADMISSIONS: readonly Admission[] = [
  {
    id: admission("Admission-LostSheep-LostClaim"),
    extractionId: LOST_SHEEP_EXTRACT_LOST.id,
    ruleAuthorizationId: authz("Authz-CanonicalNarrativeAssertion"),
    authentication: {
      sourceAuthority: "canonical-narrator",
      basis: "Parable premise establishes the lost condition within the narrated scenario.",
      provenance: [LOST_SHEEP_EXTRACT_LOST.source],
    },
    outcome: "admitted-claim",
    epistemicStatus: "conditional",
    resultingIds: ["Claim-LostSheep-Lost"],
    provenance: [LOST_SHEEP_EXTRACT_LOST.source],
  },
  {
    id: admission("Admission-LostSheep-Seek"),
    extractionId: LOST_SHEEP_EXTRACT_SEEK.id,
    ruleAuthorizationId: authz("Authz-CanonicalNarrativeAssertion"),
    authentication: {
      sourceAuthority: "canonical-narrator",
      basis: "Canonical parable narration establishes the seeking action.",
      provenance: [LOST_SHEEP_EXTRACT_SEEK.source],
    },
    outcome: "admitted-event",
    epistemicStatus: "asserted",
    resultingIds: ["Event-LostSheep-Seek"],
    provenance: [LOST_SHEEP_EXTRACT_SEEK.source],
  },
  {
    id: admission("Admission-LostSheep-Found"),
    extractionId: LOST_SHEEP_EXTRACT_FOUND.id,
    ruleAuthorizationId: authz("Authz-CanonicalNarrativeAssertion"),
    authentication: {
      sourceAuthority: "canonical-narrator",
      basis: "Canonical parable narration establishes the finding action.",
      provenance: [LOST_SHEEP_EXTRACT_FOUND.source],
    },
    outcome: "admitted-event",
    epistemicStatus: "asserted",
    resultingIds: ["Event-LostSheep-Found"],
    provenance: [LOST_SHEEP_EXTRACT_FOUND.source],
  },
  {
    id: admission("Admission-LostSheep-Return"),
    extractionId: LOST_SHEEP_EXTRACT_RETURN.id,
    ruleAuthorizationId: authz("Authz-CanonicalNarrativeAssertion"),
    authentication: {
      sourceAuthority: "canonical-narrator",
      basis: "Canonical parable narration establishes the return-home action.",
      provenance: [LOST_SHEEP_EXTRACT_RETURN.source],
    },
    outcome: "admitted-event",
    epistemicStatus: "asserted",
    resultingIds: ["Event-LostSheep-Return"],
    provenance: [LOST_SHEEP_EXTRACT_RETURN.source],
  },
];

export const LOST_SHEEP_EVENTS: readonly Event[] = [
  {
    id: event("Event-LostSheep-Seek"),
    kind: "action",
    actor: SHEPHERD,
    target: SHEEP_ENTITY,
    operation: "seek",
    affectedAggregates: [SHEEP_AGGREGATE],
    admittedFrom: [LOST_SHEEP_ADMISSIONS[1].id],
    provenance: [gospel("Luke", 15, 4, 4)],
  },
  {
    id: event("Event-LostSheep-Found"),
    kind: "state-transition",
    actor: SHEPHERD,
    target: SHEEP_ENTITY,
    operation: "find",
    affectedAggregates: [SHEEP_AGGREGATE],
    admittedFrom: [LOST_SHEEP_ADMISSIONS[2].id],
    provenance: [gospel("Luke", 15, 5, 5)],
  },
  {
    id: event("Event-LostSheep-Return"),
    kind: "action",
    actor: SHEPHERD,
    target: SHEEP_ENTITY,
    operation: "return-to-flock",
    affectedAggregates: [SHEEP_AGGREGATE],
    admittedFrom: [LOST_SHEEP_ADMISSIONS[3].id],
    provenance: [gospel("Luke", 15, 5, 6)],
  },
];

export const LOST_SHEEP_STATE_CLAIMS: readonly StateClaim[] = [
  {
    id: "Claim-LostSheep-Lost" as ClaimId,
    subject: SHEEP_ENTITY,
    property: "located-state",
    value: "lost",
    source: LOST_SHEEP_EXTRACT_LOST.source,
    epistemicStatus: "conditional",
  },
];

export interface LostSheepState {
  readonly aggregateId: AggregateId;
  readonly entityId: EntityId;
  readonly version: number;
  readonly membership: "member";
  readonly locatedState: "lost" | "found" | "returned";
  readonly searchStatus: "not-started" | "seeking" | "completed";
}

export const INITIAL_LOST_SHEEP_STATE: LostSheepState = {
  aggregateId: SHEEP_AGGREGATE,
  entityId: SHEEP_ENTITY,
  version: 0,
  membership: "member",
  locatedState: "lost",
  searchStatus: "not-started",
};

export function reduceLostSheep(
  state: LostSheepState,
  e: Event
): LostSheepState {
  if (e.affectedAggregates.indexOf(SHEEP_AGGREGATE) < 0) return state;

  switch (e.operation) {
    case "seek":
      return {
        ...state,
        version: state.version + 1,
        searchStatus: "seeking",
      };

    case "find":
      return {
        ...state,
        version: state.version + 1,
        locatedState: "found",
        searchStatus: "completed",
      };

    case "return-to-flock":
      return {
        ...state,
        version: state.version + 1,
        locatedState: "returned",
      };

    default:
      return state;
  }
}

export function replayLostSheep(
  events: readonly Event[] = LOST_SHEEP_EVENTS
): LostSheepState {
  return events.reduce(reduceLostSheep, INITIAL_LOST_SHEEP_STATE);
}

export const LOST_SHEEP_PROJECTION: Projection<
  readonly Event[],
  LostSheepState
> = {
  id: "Projection-LostSheep" as ProjectionId,
  name: "LostSheepProjection",
  derive: replayLostSheep,
};

export const LOST_SHEEP_RECOVERY_RULE: Rule = {
  id: rule("LostSheepRecoveryPattern"),
  name: "LostSheepRecoveryPattern",
  kind: "interpretive",
  premises: [
    "membership = member",
    "locatedState transitions lost → found/returned",
  ],
  conclusion: "RecoveryPattern",
  justification:
    "Interpretive pattern over collection membership and location-state restoration; not a canonical event.",
};

export const LOST_SHEEP_RECOVERY_AUTHORIZATION: RuleAuthorization = {
  id: authz("Authz-LostSheepRecoveryPattern"),
  ruleId: LOST_SHEEP_RECOVERY_RULE.id,
  authoritySource: "theological-lens",
  basis: "declared-lens",
  scope: "interpretive-projection",
  status: "authorized-for-lens",
  provenance: [gospel("Luke", 15, 4, 6)],
};

export const LOST_SHEEP_RECOVERY_LENS: Lens<LostSheepState> = {
  id: "Lens-LostSheep-Recovery" as LensId,
  name: "Lost Sheep Recovery Lens",
  interpret: (state) => {
    if (
      state.membership !== "member" ||
      (state.locatedState !== "found" && state.locatedState !== "returned")
    ) return [];

    return [{
      name: "RecoveryPattern",
      value: {
        membership: state.membership,
        locatedState: state.locatedState,
      },
      sourceEventIds: LOST_SHEEP_EVENTS.map((e) => e.id),
      sourceAggregateIds: [SHEEP_AGGREGATE],
      sourceProjectionIds: [LOST_SHEEP_PROJECTION.id],
      derivationRuleId: LOST_SHEEP_RECOVERY_RULE.id,
      ruleAuthorizationId: LOST_SHEEP_RECOVERY_AUTHORIZATION.id,
      lensId: "Lens-LostSheep-Recovery" as LensId,
      epistemicStatus: "interpretive",
    }];
  },
};

export const LOST_SHEEP_NARRATIVE: Narrative = {
  id: "Narrative-Luke-15-Lost-Sheep" as NarrativeId,
  title: "The Lost Sheep",
  kind: "parable",
  source: { work: "Luke", chapter: 15, verseStart: 3, verseEnd: 7 },
  actors: [{ id: SHEPHERD, label: "Shepherd" }],
  entities: [LOST_SHEEP_ENTITY],
  aggregates: [LOST_SHEEP_AGGREGATE_DEFINITION],
  extractions: [
    LOST_SHEEP_EXTRACT_LOST,
    LOST_SHEEP_EXTRACT_SEEK,
    LOST_SHEEP_EXTRACT_FOUND,
    LOST_SHEEP_EXTRACT_RETURN,
  ],
  admissions: LOST_SHEEP_ADMISSIONS,
  events: LOST_SHEEP_EVENTS,
  commands: [],
  stateClaims: LOST_SHEEP_STATE_CLAIMS,
  relations: [],
};

export const LOST_SHEEP_GRAPH = narrativeToGraph(LOST_SHEEP_NARRATIVE);
export const LOST_SHEEP_RECOVERY_CONCEPTS =
  LOST_SHEEP_RECOVERY_LENS.interpret(replayLostSheep());
export const LOST_SHEEP_LENSED_GRAPH = withDerivedConcepts(
  LOST_SHEEP_GRAPH,
  LOST_SHEEP_RECOVERY_CONCEPTS
);

export const GOSPEL_PARABLE_CORPUS: readonly Narrative[] = [
  GOOD_SAMARITAN_NARRATIVE,
  PRODIGAL_SON_NARRATIVE,
  SOWER_NARRATIVE,
  TALENTS_NARRATIVE,
  LOST_SHEEP_NARRATIVE,
];

export interface NarrativeFeatureSummary {
  readonly narrativeId: NarrativeId;
  readonly title: string;
  readonly eventCount: number;
  readonly actorCount: number;
  readonly aggregateCount: number;
  readonly hasResourceTransfer: boolean;
  readonly hasDelegationPattern: boolean;
  readonly hasReturnPattern: boolean;
  readonly hasCarePattern: boolean;
  readonly hasSearchPattern: boolean;
  readonly hasDivergentOutcomePattern: boolean;
}

export function summarizeNarrativeFeatures(narrative: Narrative): NarrativeFeatureSummary {
  const ops = new Set(narrative.events.map((e) => e.operation));
  return {
    narrativeId: narrative.id,
    title: narrative.title,
    eventCount: narrative.events.length,
    actorCount: narrative.actors.length,
    aggregateCount: narrative.aggregates.length,
    hasResourceTransfer: [...ops].some((x) =>
      x === "transfer-resources" || x === "spend-resources" || x.startsWith("entrust-")
    ),
    hasDelegationPattern: [...ops].some((x) => x.startsWith("entrust-")),
    hasReturnPattern: ops.has("return") || ops.has("find"),
    hasCarePattern: ops.has("provide-immediate-care") || ops.has("receive"),
    hasSearchPattern: ops.has("seek"),
    hasDivergentOutcomePattern: [...ops].filter((x) => x.startsWith("sow-")).length >= 3,
  };
}

export const PARABLE_COMPARISON = GOSPEL_PARABLE_CORPUS.map(summarizeNarrativeFeatures);

export const FULL_CORPUS: readonly Narrative[] = [
  MARK_5_JAIRUS_NARRATIVE,
  ...GOSPEL_PARABLE_CORPUS,
];


/* -------------------------------------------------------------------------- */
/* APPLICATION RUNTIME                                                         */
/* -------------------------------------------------------------------------- */

export interface ApplicationInvariantFailure {
  readonly code:
    | "R007-NoUnauthorizedNormativity"
    | "R008-ApplicationCannotCreateAuthority"
    | "R017-ContextIntegrity"
    | "R018-NoUnauthorizedGeneralization";
  readonly message: string;
}

export interface ApplicationRuntimeInput {
  readonly interpretation: DerivedConcept;
  readonly bridge: NormativeBridge;
  readonly context: ApplicationContext;
  readonly target: string;
  readonly action: string;
  readonly modality: ApplicationModality;
  readonly authority: RuleAuthorization;
  readonly scope: string;
  readonly assumptions: readonly string[];
  readonly exceptions: readonly string[];
}

export interface ApplicationDecision {
  readonly valid: boolean;
  readonly application?: Application;
  readonly failures: readonly ApplicationInvariantFailure[];
}

function interpretationIdFor(
  interpretation: DerivedConcept
): InterpretationId {
  return `Interpretation:${interpretation.lensId}:${interpretation.name}` as InterpretationId;
}

function bridgeMatchesInterpretation(
  interpretation: DerivedConcept,
  bridge: NormativeBridge
): boolean {
  return bridge.sourceInterpretationIds.includes(
    interpretationIdFor(interpretation)
  );
}

export function evaluateApplication(
  input: ApplicationRuntimeInput
): ApplicationDecision {
  const failures: ApplicationInvariantFailure[] = [];

  if (!bridgeMatchesInterpretation(input.interpretation, input.bridge)) {
    failures.push({
      code: "R007-NoUnauthorizedNormativity",
      message:
        "The normative bridge is not grounded in the supplied interpretation.",
    });
  }

  if (!input.bridge.permittedModalities.includes(input.modality)) {
    failures.push({
      code: "R007-NoUnauthorizedNormativity",
      message: `Bridge does not authorize modality "${input.modality}".`,
    });
  }

  if (
    input.authority.status !== "authorized" &&
    input.authority.status !== "authorized-for-lens"
  ) {
    failures.push({
      code: "R008-ApplicationCannotCreateAuthority",
      message:
        "Application cannot become normative without an authorized authority boundary.",
    });
  }

  if (
    input.context.circumstances.length === 0 ||
    !input.context.time ||
    !input.context.actor
  ) {
    failures.push({
      code: "R017-ContextIntegrity",
      message:
        "Application context must identify actor, time, and concrete circumstances.",
    });
  }

  if (
    input.scope === "universal" &&
    input.authority.scope !== "universal"
  ) {
    failures.push({
      code: "R018-NoUnauthorizedGeneralization",
      message:
        "A scoped authority cannot authorize a universal application.",
    });
  }

  if (failures.length > 0) {
    return { valid: false, failures };
  }

  const application: Application = {
    id: `Application-${input.bridge.ruleId}-${input.target}` as ApplicationId,
    sourceInterpretationIds: [interpretationIdFor(input.interpretation)],
    bridge: input.bridge,
    target: input.target,
    context: input.context,
    action: input.action,
    modality: input.modality,
    authority: input.authority.id,
    scope: input.scope,
    assumptions: input.assumptions,
    exceptions: input.exceptions,
  };

  return {
    valid: true,
    application,
    failures: [],
  };
}

/* -------------------------------------------------------------------------- */
/* GOOD SAMARITAN APPLICATION BRIDGE                                           */
/* -------------------------------------------------------------------------- */

export const GOOD_SAMARITAN_CARE_APPLICATION_RULE: Rule = {
  id: rule("GoodSamaritanCareApplication"),
  name: "GoodSamaritanCareApplication",
  kind: "interpretive",
  premises: [
    "care-pattern",
    "specified contemporary context",
    "identified target actor",
  ],
  conclusion: "ContextualCareRecommendation",
  justification:
    "A declared application rule may propose a contextual recommendation from the CareLens; it does not create a universal command.",
};

export const GOOD_SAMARITAN_CARE_BRIDGE_AUTHORIZATION: RuleAuthorization = {
  id: authz("Authz-GoodSamaritan-CareApplication"),
  ruleId: GOOD_SAMARITAN_CARE_APPLICATION_RULE.id,
  authoritySource: "theological-lens",
  basis: "declared-lens",
  scope: "contextual-care-application",
  status: "authorized-for-lens",
  provenance: [gospel("Luke", 10, 33, 35)],
};

export const GOOD_SAMARITAN_CARE_INTERPRETATION_ID =
  `Interpretation:${CARE_LENS_ID}:care-pattern` as InterpretationId;

export const GOOD_SAMARITAN_CARE_BRIDGE: NormativeBridge = {
  ruleId: GOOD_SAMARITAN_CARE_APPLICATION_RULE.id,
  ruleAuthorizationId: GOOD_SAMARITAN_CARE_BRIDGE_AUTHORIZATION.id,
  sourceInterpretationIds: [
    GOOD_SAMARITAN_CARE_INTERPRETATION_ID,
  ],
  targetContext: "contextual-immediate-material-need",
  permittedModalities: ["recommendation"],
};

export const GOOD_SAMARITAN_APPLICATION_CONTEXT: ApplicationContext = {
  actor: COMMUNITY,
  institution: "local-community",
  jurisdiction: "context-dependent",
  time: "present",
  circumstances: [
    "An authorized actor encounters an immediate material need.",
    "The actor has lawful and practically available means to respond.",
  ],
  affectedPopulation: ["person in immediate need"],
  availableResources: ["available lawful resources"],
};

export function evaluateGoodSamaritanCareApplication(
  target: string = COMMUNITY
): ApplicationDecision {
  const concepts = CareLens.interpret({
    narrative: GOOD_SAMARITAN_NARRATIVE,
    state: replayTraveler(GOOD_SAMARITAN_NARRATIVE.events),
  });

  const interpretation = concepts[0];
  if (!interpretation) {
    return {
      valid: false,
      failures: [{
        code: "R007-NoUnauthorizedNormativity",
        message: "CareLens did not derive care-pattern.",
      }],
    };
  }

  return evaluateApplication({
    interpretation,
    bridge: GOOD_SAMARITAN_CARE_BRIDGE,
    context: GOOD_SAMARITAN_APPLICATION_CONTEXT,
    target,
    action: "assess-and-address-immediate-material-need",
    modality: "recommendation",
    authority: GOOD_SAMARITAN_CARE_BRIDGE_AUTHORIZATION,
    scope: "contextual-care-application",
    assumptions: [
      "The target actor is authorized to act.",
      "The described need is immediate and material.",
      "The proposed response is lawful and within available resources.",
    ],
    exceptions: [
      "No application may require action outside the actor's lawful authority.",
      "Safety, competence, jurisdiction, and resource constraints remain operative.",
    ],
  });
}

export const GOOD_SAMARITAN_APPLICATION_DECISION =
  evaluateGoodSamaritanCareApplication();

export function withApplications(
  graph: NarrativeGraph,
  decisions: readonly ApplicationDecision[]
): NarrativeGraph {
  const nodes = [...graph.nodes];
  const edges = [...graph.edges];

  for (const decision of decisions) {
    if (!decision.valid || !decision.application) continue;

    const app = decision.application;
    const appNodeId = `application:${app.id}` as GraphNodeId;

    nodes.push({
      id: appNodeId,
      kind: "application",
      label: app.action,
      epistemicLayer: "application",
      payloadId: app.id,
    });

    for (const sourceInterpretationId of app.sourceInterpretationIds) {
      const sourceNode = nodes.find(
        (n) =>
          n.epistemicLayer === "interpretive" &&
          (
            sourceInterpretationId.includes(n.label) ||
            sourceInterpretationId.includes(String(n.payloadId))
          )
      );

      if (!sourceNode) continue;

      edges.push({
        id: `edge:application:${sourceNode.id}:${appNodeId}` as GraphEdgeId,
        source: sourceNode.id,
        target: appNodeId,
        relation: "normative-bridge",
        epistemicLayer: "application",
      });
    }
  }

  return {
    ...graph,
    nodes,
    edges,
  };
}

export const GOOD_SAMARITAN_APPLIED_GRAPH = withApplications(
  GOOD_SAMARITAN_LENSED_GRAPH,
  [GOOD_SAMARITAN_APPLICATION_DECISION]
);


/* -------------------------------------------------------------------------- */
/* RULE / AUTHORIZATION GRAPH SUPPORT                                          */
/* -------------------------------------------------------------------------- */

export interface RuntimeRuleState {
  readonly ruleId: RuleId;
  readonly authorizationId: RuleAuthorizationId;
  readonly enabled: boolean;
  readonly status: RuleAuthorization["status"];
}

export interface RuleEvaluationContext {
  readonly disabledRuleIds: ReadonlySet<RuleId>;
  readonly disputedAuthorizationIds: ReadonlySet<RuleAuthorizationId>;
}

export function ruleIsUsable(
  rule: Rule,
  authorization: RuleAuthorization,
  context: RuleEvaluationContext
): boolean {
  if (context.disabledRuleIds.has(rule.id)) return false;
  if (context.disputedAuthorizationIds.has(authorization.id)) return false;
  return (
    authorization.status === "authorized" ||
    authorization.status === "authorized-for-lens"
  );
}

export interface RuleGraphBinding {
  readonly rule: Rule;
  readonly authorization: RuleAuthorization;
  readonly sourceConceptName?: string;
  readonly targetApplicationAction?: string;
}

export const GOOD_SAMARITAN_RULE_BINDINGS: readonly RuleGraphBinding[] = [
  {
    rule: CARE_RULE,
    authorization: CARE_RULE_AUTHORIZATION,
    sourceConceptName: "care-pattern",
  },
  {
    rule: RESOURCE_RULE,
    authorization: RESOURCE_RULE_AUTHORIZATION,
    sourceConceptName: "resource-provision-pattern",
  },
  {
    rule: RESTORATION_RULE,
    authorization: RESTORATION_RULE_AUTHORIZATION,
    sourceConceptName: "restoration-pattern",
  },
  {
    rule: GOOD_SAMARITAN_CARE_APPLICATION_RULE,
    authorization: GOOD_SAMARITAN_CARE_BRIDGE_AUTHORIZATION,
    sourceConceptName: "care-pattern",
    targetApplicationAction: "assess-and-address-immediate-material-need",
  },
];

export function withRuleAuthorizationNodes(
  graph: NarrativeGraph,
  bindings: readonly RuleGraphBinding[],
  context: RuleEvaluationContext
): NarrativeGraph {
  const nodes = [...graph.nodes];
  const edges = [...graph.edges];

  for (const binding of bindings) {
    const usable = ruleIsUsable(binding.rule, binding.authorization, context);
    const ruleNodeId = `rule:${binding.rule.id}` as GraphNodeId;
    const authNodeId =
      `authorization:${binding.authorization.id}` as GraphNodeId;

    nodes.push(
      {
        id: ruleNodeId,
        kind: "derived",
        label: `${binding.rule.name}${usable ? "" : " [disabled]"}`,
        epistemicLayer: "derived",
        payloadId: binding.rule.id,
      },
      {
        id: authNodeId,
        kind: "derived",
        label: `${binding.authorization.status}${usable ? "" : " [inactive]"}`,
        epistemicLayer: "derived",
        payloadId: binding.authorization.id,
      }
    );

    edges.push({
      id: `edge:rule-auth:${binding.rule.id}` as GraphEdgeId,
      source: ruleNodeId,
      target: authNodeId,
      relation: "authorized-by",
      epistemicLayer: "derived",
    });

    if (!usable) continue;

    if (binding.sourceConceptName) {
      const conceptNode = nodes.find(
        (n) =>
          n.epistemicLayer === "interpretive" &&
          n.label === binding.sourceConceptName
      );

      if (conceptNode) {
        edges.push({
          id: `edge:auth-concept:${binding.authorization.id}:${conceptNode.id}` as GraphEdgeId,
          source: authNodeId,
          target: conceptNode.id,
          relation: "permits-rule-use",
          epistemicLayer: "interpretive",
        });
      }
    }

    if (binding.targetApplicationAction) {
      const applicationNode = nodes.find(
        (n) =>
          n.epistemicLayer === "application" &&
          n.label === binding.targetApplicationAction
      );

      if (applicationNode) {
        edges.push({
          id: `edge:auth-application:${binding.authorization.id}:${applicationNode.id}` as GraphEdgeId,
          source: authNodeId,
          target: applicationNode.id,
          relation: "authorizes-application",
          epistemicLayer: "application",
        });
      }
    }
  }

  return { ...graph, nodes, edges };
}

export function filterGraphByRuleContext(
  graph: NarrativeGraph,
  bindings: readonly RuleGraphBinding[],
  context: RuleEvaluationContext
): NarrativeGraph {
  const blockedConceptLabels = new Set<string>();
  const blockedApplicationLabels = new Set<string>();

  for (const binding of bindings) {
    if (!ruleIsUsable(binding.rule, binding.authorization, context)) {
      if (binding.sourceConceptName) {
        blockedConceptLabels.add(binding.sourceConceptName);
      }
      if (binding.targetApplicationAction) {
        blockedApplicationLabels.add(binding.targetApplicationAction);
      }
    }
  }

  const nodes = graph.nodes.filter(
    (n) =>
      !(
        n.epistemicLayer === "interpretive" &&
        blockedConceptLabels.has(n.label)
      ) &&
      !(
        n.epistemicLayer === "application" &&
        blockedApplicationLabels.has(n.label)
      )
  );

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = graph.edges.filter(
    (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
  );

  return { ...graph, nodes, edges };
}


/* -------------------------------------------------------------------------- */
/* PARABLE ALGEBRA + COMMAND FULFILLMENT                                       */
/* -------------------------------------------------------------------------- */

export interface ParableAlgebra {
  readonly narrativeId: NarrativeId;
  readonly input: string;
  readonly initialState: string;
  readonly context: string;
  readonly authority: string;
  readonly response: string;
  readonly transition: string;
  readonly outcome: string;
}

export const PARABLE_ALGEBRA: readonly ParableAlgebra[] = [
  {
    narrativeId: GOOD_SAMARITAN_NARRATIVE.id,
    input: "encounter-with-injured-traveler",
    initialState: "traveler-injured-and-uncared-for",
    context: "roadside-encounter",
    authority: "narrative / application authority downstream",
    response: "pass-by-or-intervene",
    transition: "care-and-resource-transfer",
    outcome: "traveler-under-care",
  },
  {
    narrativeId: PRODIGAL_SON_NARRATIVE.id,
    input: "return-to-father",
    initialState: "away-from-household",
    context: "return-encounter",
    authority: "relational / narrative authority downstream",
    response: "father-receives-son",
    transition: "return-plus-reception",
    outcome: "received-into-household",
  },
  {
    narrativeId: SOWER_NARRATIVE.id,
    input: "sowing",
    initialState: "seed-received",
    context: "receiving-environment",
    authority: "narrative transition rules",
    response: "context-specific reception",
    transition: "branch-specific state change",
    outcome: "devoured / withered / choked / fruitful",
  },
  {
    narrativeId: TALENTS_NARRATIVE.id,
    input: "entrusted-resource",
    initialState: "servant-receives-bounded-resource",
    context: "delegated stewardship",
    authority: "master-to-servant authority grant",
    response: "manage-or-hide",
    transition: "resource-state-change",
    outcome: "increase-or-preserved-hidden plus accounting",
  },
  {
    narrativeId: LOST_SHEEP_NARRATIVE.id,
    input: "member-is-lost",
    initialState: "member-but-not-located",
    context: "search-and-recovery",
    authority: "narrative / shepherd action",
    response: "seek",
    transition: "lost-to-found-to-returned",
    outcome: "member-returned",
  },
];

export interface CommandFulfillment {
  readonly commandId: CommandId;
  readonly authorityValid: boolean;
  readonly commandValid: boolean;
  readonly executionObserved: boolean;
  readonly executionConforms: boolean;
  readonly scopeValid: boolean;
  readonly status:
    | "fulfilled"
    | "action-occurred-without-authority"
    | "unauthorized-execution"
    | "scope-exceeded"
    | "not-executed";
}

export interface CommandFulfillmentInput {
  readonly command: Command;
  readonly executionEvent?: Event;
  readonly authorityEnabled: boolean;
}

export function evaluateCommandFulfillment(
  input: CommandFulfillmentInput
): CommandFulfillment {
  const authorityValid = input.authorityEnabled;
  const commandValid = authorityValid;

  const executionObserved = Boolean(input.executionEvent);
  const executionConforms =
    Boolean(input.executionEvent) &&
    input.executionEvent!.operation === input.command.operation;

  const scopeValid =
    (
      !input.command.scope.operations ||
      input.command.scope.operations.includes(input.command.operation)
    ) &&
    (
      !input.command.target ||
      !input.command.scope.targets ||
      input.command.scope.targets.includes(input.command.target)
    );

  let status: CommandFulfillment["status"] = "not-executed";

  if (!authorityValid && executionObserved) {
    status = "action-occurred-without-authority";
  } else if (!scopeValid && executionObserved) {
    status = "scope-exceeded";
  } else if (executionObserved && !executionConforms) {
    status = "unauthorized-execution";
  } else if (
    authorityValid &&
    commandValid &&
    executionObserved &&
    executionConforms &&
    scopeValid
  ) {
    status = "fulfilled";
  }

  return {
    commandId: input.command.id,
    authorityValid,
    commandValid,
    executionObserved,
    executionConforms,
    scopeValid,
    status,
  };
}

export const TALITHA_FULFILLMENT_WITH_AUTHORITY =
  evaluateCommandFulfillment({
    command: COMMAND_TALITHA_KOUM,
    executionEvent: EVENTS.find((e) => e.operation === "rise"),
    authorityEnabled: true,
  });

export const TALITHA_FULFILLMENT_WITHOUT_AUTHORITY =
  evaluateCommandFulfillment({
    command: COMMAND_TALITHA_KOUM,
    executionEvent: EVENTS.find((e) => e.operation === "rise"),
    authorityEnabled: false,
  });
