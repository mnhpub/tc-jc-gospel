import { useMemo, useState } from "react";

import type {
  Narrative,
  NarrativeGraph,
} from "./turing-complete-gospel-of-jesus-christ";
import {
  admissionForExtraction,
  admissionsForEvent,
  eventIndexForExtraction,
  traceLineage,
  verseLabel,
} from "./provenance";
import {
  eventSentence,
  plainModality,
  plainNotAStep,
  plainWhyItCounts,
  readingName,
} from "./plainLanguage";

/**
 * Story-mode version of the Audit view. Instead of a wide lane graph it shows
 * one step at a time as a vertical chain: the verse, why it counts as a step,
 * what happens, and any readings or takeaways built on it.
 */
export default function SourcesView({
  narrative,
  graph,
}: {
  narrative: Narrative;
  graph: NarrativeGraph;
}) {
  const [openId, setOpenId] = useState<string | null>(
    narrative.events[0]?.id ?? null
  );

  const asides = narrative.extractions.filter(
    (x) => eventIndexForExtraction(narrative, x) < 0
  );

  return (
    <div className="stack">
      <section className="card">
        <div className="eyebrow">Where does this come from?</div>
        <h2 className="story-title">Every step rests on a verse</h2>
        <p className="muted">
          Tap a step to see the words it comes from and anything readers have
          drawn from it. What the text says is kept apart from how it is read
          and how it might apply to us.
        </p>
      </section>

      <ol className="sources">
        {narrative.events.map((event, i) => {
          const open = openId === event.id;
          return (
            <li key={event.id} className={`card source${open ? " open" : ""}`}>
              <button
                type="button"
                className="source-head"
                aria-expanded={open}
                onClick={() => setOpenId(open ? null : event.id)}
              >
                <span className="source-step">Step {i + 1}</span>
                <span className="source-sentence">{eventSentence(event)}</span>
                <span className="source-verse">
                  {verseLabel(event.provenance?.[0])}
                </span>
              </button>
              {open && (
                <SourceChain
                  narrative={narrative}
                  graph={graph}
                  eventId={event.id}
                />
              )}
            </li>
          );
        })}
      </ol>

      {asides.length > 0 && (
        <section className="card">
          <div className="eyebrow">In the text, but not a step</div>
          <ul className="asides">
            {asides.map((x) => (
              <li key={x.id}>
                <span className="tl-quote">“{x.sourceSpan}”</span>
                <span className="tl-meta">
                  {verseLabel(x.source)} · {plainModality(x.modality)} ·{" "}
                  {plainNotAStep(admissionForExtraction(narrative, x)?.outcome)}
                </span>
              </li>
            ))}
          </ul>
          <p className="muted small">
            These words are kept, but they are not counted as something that
            happened. For example, a report from someone in the story is not
            treated as fact on its own.
          </p>
        </section>
      )}
    </div>
  );
}

function SourceChain({
  narrative,
  graph,
  eventId,
}: {
  narrative: Narrative;
  graph: NarrativeGraph;
  eventId: string;
}) {
  const event = narrative.events.find((e) => e.id === eventId)!;

  const { quotes, readings, takeaways } = useMemo(() => {
    const admissions = admissionsForEvent(narrative, event);
    const quotes = admissions
      .map((a) => ({
        admission: a,
        extraction: narrative.extractions.find((x) => x.id === a.extractionId),
      }))
      .filter((q) => q.extraction);

    const lineage = traceLineage(graph, `event:${event.id}`);
    const inLineage = graph.nodes.filter((n) => lineage.nodeIds.has(n.id));
    const readings = inLineage.filter((n) => n.epistemicLayer === "interpretive");
    const takeaways = inLineage.filter((n) => n.epistemicLayer === "application");

    return { quotes, readings, takeaways };
  }, [narrative, graph, event]);

  return (
    <ol className="chain">
      {quotes.map(({ admission, extraction }) => (
        <li key={admission.id} className="chain-link">
          <span className="chain-layer">The text</span>
          <div className="chain-body">
            <blockquote className="chain-quote">“{extraction!.sourceSpan}”</blockquote>
            <span className="tl-meta">
              {verseLabel(extraction!.source)} · {plainModality(extraction!.modality)}
            </span>
          </div>
        </li>
      ))}

      {quotes[0] && (
        <li className="chain-link">
          <span className="chain-layer">Why it counts</span>
          <div className="chain-body small">
            {plainWhyItCounts(quotes[0].admission.authentication.sourceAuthority)}
          </div>
        </li>
      )}

      <li className="chain-link chain-now">
        <span className="chain-layer">What happens</span>
        <div className="chain-body">
          <strong>{eventSentence(event)}</strong>
        </div>
      </li>

      <li className="chain-link">
        <span className="chain-layer">Readings</span>
        <div className="chain-body">
          {readings.length === 0 ? (
            <span className="muted small">
              No readings have been added for this step.
            </span>
          ) : (
            <ul className="chain-list">
              {readings.map((r) => (
                <li key={r.id}>
                  <strong>{readingName(r.label)}</strong>
                  <span className="tl-meta">
                    an interpretation, not part of the text
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </li>

      <li className="chain-link">
        <span className="chain-layer">For us</span>
        <div className="chain-body">
          {takeaways.length === 0 ? (
            <span className="muted small">
              No takeaway is drawn here. A reading only becomes a takeaway when
              a stated reason links it to our lives.
            </span>
          ) : (
            <ul className="chain-list">
              {takeaways.map((t) => (
                <li key={t.id}>
                  <strong>{readingName(t.label)}</strong>
                  <span className="tl-meta">
                    a takeaway, linked to the reading by an explicit, stated reason
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </li>
    </ol>
  );
}
