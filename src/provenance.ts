import type {
  Admission,
  Event,
  Extraction,
  GraphEdge,
  GraphEdgeId,
  GraphNode,
  GraphNodeId,
  Narrative,
  NarrativeGraph,
  Provenance,
} from "./turing-complete-gospel-of-jesus-christ";

/* -------------------------------------------------------------------------- */
/* SOURCE LABELS                                                               */
/* -------------------------------------------------------------------------- */

export function verseLabel(p: Provenance | undefined): string {
  const s = p?.source;
  if (!s) return "Source unavailable";
  const range =
    s.verseEnd && s.verseEnd !== s.verseStart
      ? `${s.verseStart}–${s.verseEnd}`
      : String(s.verseStart);
  return `${s.work} ${s.chapter}:${range}`;
}

/* -------------------------------------------------------------------------- */
/* EVENT ⇄ EXTRACTION LINKAGE                                                  */
/* -------------------------------------------------------------------------- */

/**
 * Admissions that produced an event, resolved through `event.admittedFrom`.
 */
export function admissionsForEvent(
  narrative: Narrative,
  event: Event
): Admission[] {
  return event.admittedFrom
    .map((id) => narrative.admissions.find((a) => a.id === id))
    .filter((a): a is Admission => Boolean(a));
}

/**
 * Extraction ids an event was admitted from (event → admission → extraction).
 */
export function extractionIdsForEvent(
  narrative: Narrative,
  event: Event
): Set<string> {
  return new Set(
    admissionsForEvent(narrative, event).map((a) => a.extractionId as string)
  );
}

export function admissionForExtraction(
  narrative: Narrative,
  extraction: Extraction
): Admission | undefined {
  return narrative.admissions.find((a) => a.extractionId === extraction.id);
}

/**
 * Index of the first event admitted from the extraction, or -1 when the
 * extraction was admitted as something other than an event (e.g. a claim).
 */
export function eventIndexForExtraction(
  narrative: Narrative,
  extraction: Extraction
): number {
  return narrative.events.findIndex((event) =>
    extractionIdsForEvent(narrative, event).has(extraction.id)
  );
}

/* -------------------------------------------------------------------------- */
/* STATE DIFF                                                                  */
/* -------------------------------------------------------------------------- */

export function flattenState(
  value: unknown,
  prefix = ""
): Array<[string, string]> {
  if (value === null || value === undefined) return [];
  if (typeof value !== "object") return [[prefix || "value", String(value)]];
  const out: Array<[string, string]> = [];
  for (const [key, next] of Object.entries(value as Record<string, unknown>)) {
    const name = prefix ? `${prefix}.${key}` : key;
    if (next && typeof next === "object" && !Array.isArray(next)) {
      out.push(...flattenState(next, name));
    } else if (!Array.isArray(next)) {
      out.push([name, String(next)]);
    }
  }
  return out;
}

export interface StateChange {
  readonly key: string;
  readonly before: string | undefined;
  readonly after: string | undefined;
}

/** Bookkeeping fields that change on every event and carry no narrative meaning. */
const DIFF_IGNORED_KEYS = new Set(["version"]);

export function diffStates(before: unknown, after: unknown): StateChange[] {
  const a = new Map(flattenState(before));
  const b = new Map(flattenState(after));
  const keys = [...new Set([...a.keys(), ...b.keys()])];
  return keys
    .filter(
      (key) =>
        !DIFF_IGNORED_KEYS.has(key.split(".").pop() ?? key) &&
        a.get(key) !== b.get(key)
    )
    .map((key) => ({ key, before: a.get(key), after: b.get(key) }));
}

/* -------------------------------------------------------------------------- */
/* AUDIT GRAPH                                                                 */
/* -------------------------------------------------------------------------- */

function isProvenanceNode(node: GraphNode): boolean {
  return node.id.startsWith("text:") || node.id.startsWith("extraction:");
}

/**
 * Adds the TEXT and EXTRACTION layers to a narrative graph so the audit view
 * can trace an admitted node back to the verse it came from:
 *
 *   text —quoted-as→ extraction —admitted-as→ event | claim | command
 *
 * The admitted layer is not modified; only upstream nodes and edges are added.
 */
export function withProvenanceLayers(
  graph: NarrativeGraph,
  narrative: Narrative
): NarrativeGraph {
  const nodes: GraphNode[] = [...graph.nodes];
  const edges: GraphEdge[] = [...graph.edges];
  const nodeIds = new Set(nodes.map((n) => n.id as string));
  const edgeIds = new Set(edges.map((e) => e.id as string));

  const addNode = (node: GraphNode) => {
    if (nodeIds.has(node.id)) return;
    nodeIds.add(node.id);
    nodes.push(node);
  };
  const addEdge = (edge: GraphEdge) => {
    if (edgeIds.has(edge.id)) return;
    edgeIds.add(edge.id);
    edges.push(edge);
  };

  for (const x of narrative.extractions) {
    const verse = verseLabel(x.source);
    const textId = `text:${verse}` as GraphNodeId;
    const extractionId = `extraction:${x.id}` as GraphNodeId;

    addNode({
      id: textId,
      kind: "derived",
      label: verse,
      epistemicLayer: "text",
      sourceRef: verse,
      payloadId: verse,
    });
    addNode({
      id: extractionId,
      kind: "derived",
      label: `${x.predicate} (${x.modality})`,
      epistemicLayer: "extraction",
      sourceRef: verse,
      payloadId: x.id,
    });
    addEdge({
      id: `edge:quoted:${x.id}` as GraphEdgeId,
      source: textId,
      target: extractionId,
      relation: "quoted-as",
      epistemicLayer: "extraction",
    });

    const admission = admissionForExtraction(narrative, x);
    if (!admission) continue;

    const admittedPayloads = new Set<string>(admission.resultingIds);
    for (const event of narrative.events) {
      if (event.admittedFrom.includes(admission.id)) {
        admittedPayloads.add(event.id);
      }
    }

    for (const target of nodes) {
      if (
        isProvenanceNode(target) ||
        !admittedPayloads.has(String(target.payloadId))
      ) {
        continue;
      }
      addEdge({
        id: `edge:admitted:${x.id}:${target.id}` as GraphEdgeId,
        source: extractionId,
        target: target.id,
        relation: admission.outcome,
        epistemicLayer: "admitted",
      });
    }
  }

  return { ...graph, nodes, edges };
}

export interface Lineage {
  readonly nodeIds: ReadonlySet<string>;
  readonly edges: readonly GraphEdge[];
}

/**
 * Actors, entities and aggregates are shared participants, not derivations:
 * a claim about the girl does not flow on into every event the girl performs.
 * Lineage may end at one of these nodes but never passes through it (unless
 * it is the node being traced).
 */
const PARTICIPANT_KINDS = new Set(["actor", "entity", "aggregate"]);

/**
 * Everything the selected node depends on (walking edges backwards) and
 * everything that depends on it (walking edges forwards). Any node reached
 * along the way also pulls in the rules and authorizations it relies on, so
 * a derived conclusion is shown together with what licenses it.
 */
export function traceLineage(
  graph: NarrativeGraph,
  selected: GraphNodeId | string
): Lineage {
  const kinds = new Map(graph.nodes.map((n) => [n.id as string, n.kind]));
  const layers = new Map(
    graph.nodes.map((n) => [n.id as string, n.epistemicLayer])
  );
  const nodeIds = new Set<string>([selected]);
  const edges = new Map<string, GraphEdge>();

  const walk = (from: string, direction: "up" | "down") => {
    const queue = [from];
    const seen = new Set<string>([from]);
    while (queue.length) {
      const current = queue.shift()!;
      if (current !== selected && PARTICIPANT_KINDS.has(kinds.get(current) ?? "")) {
        continue;
      }
      for (const edge of graph.edges) {
        const here = direction === "up" ? edge.target : edge.source;
        const next = direction === "up" ? edge.source : edge.target;
        if (here !== current) continue;
        edges.set(edge.id, edge);
        nodeIds.add(next);
        if (!seen.has(next)) {
          seen.add(next);
          queue.push(next);
        }
      }
    }
  };

  walk(selected, "up");
  walk(selected, "down");

  for (const edge of graph.edges) {
    if (
      nodeIds.has(edge.target) &&
      !nodeIds.has(edge.source) &&
      layers.get(edge.source) === "derived"
    ) {
      edges.set(edge.id, edge);
      nodeIds.add(edge.source);
      walk(edge.source, "up");
    }
  }

  return { nodeIds, edges: [...edges.values()] };
}
