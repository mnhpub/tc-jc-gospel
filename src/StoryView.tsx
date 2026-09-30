import React, { useEffect, useMemo, useRef, useState } from "react";

import type { Event, Narrative } from "./turing-complete-gospel-of-jesus-christ";
import {
  admissionForExtraction,
  diffStates,
  eventIndexForExtraction,
  extractionIdsForEvent,
  verseLabel,
} from "./provenance";
import {
  characterName,
  eventSentence,
  plainChanges,
  plainModality,
  plainNotAStep,
  type StoryKey,
} from "./plainLanguage";
import { STUDY_GUIDES } from "./studyGuide";

export interface StoryViewProps {
  storyKey: StoryKey;
  title: string;
  reference: string;
  narrative: Narrative;
  replay: (events: readonly Event[]) => unknown;
  step: number;
  setStep: (step: number) => void;
}

export default function StoryView({
  storyKey,
  title,
  reference,
  narrative,
  replay,
  step,
  setStep,
}: StoryViewProps) {
  const events = narrative.events;
  const total = events.length;
  const current = step > 0 ? events[step - 1] : undefined;
  const guide = STUDY_GUIDES[storyKey];

  // Questions start open where there is room, and open by themselves when
  // the group reaches the end of the story.
  const [guideOpen, setGuideOpen] = useState(
    () =>
      typeof window !== "undefined" &&
      window.matchMedia?.("(min-width: 900px)").matches === true
  );
  useEffect(() => {
    if (step === total) setGuideOpen(true);
  }, [step, total]);

  const { changes, currentQuotes, readQuotes } = useMemo(() => {
    const read = new Set<string>();
    for (const e of events.slice(0, step)) {
      for (const id of extractionIdsForEvent(narrative, e)) read.add(id);
    }
    const before = replay(events.slice(0, Math.max(0, step - 1)));
    const after = replay(events.slice(0, step));
    return {
      changes: step > 0 ? plainChanges(storyKey, diffStates(before, after)) : [],
      currentQuotes: current
        ? extractionIdsForEvent(narrative, current)
        : new Set<string>(),
      readQuotes: read,
    };
  }, [events, narrative, replay, step, storyKey, current]);

  const currentQuote = narrative.extractions.find((x) =>
    currentQuotes.has(x.id)
  );

  const people = useMemo(
    () =>
      [...narrative.actors.map((a) => a.id), ...narrative.entities.map((e) => e.id)]
        .map((id) => characterName(id))
        .filter((name, i, all) => name && all.indexOf(name) === i),
    [narrative]
  );

  // ← / → step through the story, unless the user is typing or on a control
  // that uses arrow keys itself.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && /^(INPUT|SELECT|TEXTAREA)$/.test(t.tagName)) return;
      if (e.key === "ArrowRight") setStep(Math.min(total, step + 1));
      if (e.key === "ArrowLeft") setStep(Math.max(0, step - 1));
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, total, setStep]);

  // Swipe the current card left/right to step.
  const touchX = useRef<number | null>(null);
  const swipe = {
    onTouchStart: (e: React.TouchEvent) => {
      touchX.current = e.touches[0]?.clientX ?? null;
    },
    onTouchEnd: (e: React.TouchEvent) => {
      const start = touchX.current;
      touchX.current = null;
      const end = e.changedTouches[0]?.clientX;
      if (start == null || end == null || Math.abs(end - start) < 50) return;
      setStep(end < start ? Math.min(total, step + 1) : Math.max(0, step - 1));
    },
  };

  return (
    <div className="story">
      <div className="story-main">
        {current ? (
          <section
            className="card card-now"
            aria-live="polite"
            aria-label={`Step ${step} of ${total}`}
            {...swipe}
          >
            <div className="eyebrow">
              Step {step} of {total} · {verseLabel(current.provenance?.[0])}
            </div>
            {currentQuote && (
              <blockquote className="story-quote">
                “{currentQuote.sourceSpan}”
              </blockquote>
            )}
            <p className="story-sentence">{eventSentence(current)}</p>

            {changes.length > 0 ? (
              <ul className="changes" aria-label="What changed">
                {changes.map((c) => (
                  <li key={`${c.subject}:${c.label}`} className="change">
                    <span className="change-who">
                      {c.subject} · {c.label}
                    </span>
                    <span className="change-values">
                      <s>{c.before}</s>
                      <span aria-hidden="true"> → </span>
                      <span className="visually-hidden"> now </span>
                      <strong>{c.after}</strong>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted small">
                Nothing changes yet. This sets up what comes next.
              </p>
            )}
          </section>
        ) : (
          <section className="card card-now" {...swipe}>
            <div className="eyebrow">{reference}</div>
            <h2 className="story-title">{title}</h2>
            <p className="story-intro">{guide.intro}</p>
            <p className="muted small">
              Read {reference} together, then walk through what happens one
              step at a time.
            </p>
            <div className="people" aria-label="Who is in the story">
              {people.map((p) => (
                <span key={p} className="person">
                  {p}
                </span>
              ))}
            </div>
            <button
              type="button"
              className="btn btn-primary btn-wide"
              onClick={() => setStep(1)}
            >
              Start the story
            </button>
          </section>
        )}

        <details
          className="card guide"
          open={guideOpen}
          onToggle={(e) => setGuideOpen(e.currentTarget.open)}
        >
          <summary>
            <span className="eyebrow">Discussion questions</span>
          </summary>
          <GuideSection title="Look closely" hint="What does the text say?" items={guide.observe} />
          <GuideSection title="Think it through" hint="What does it mean?" items={guide.interpret} />
          <GuideSection title="Live it out" hint="What does it mean for us?" items={guide.apply} />
        </details>
      </div>

      <section className="card story-timeline" aria-label="The story, step by step">
        <div className="eyebrow">The story</div>
        <ol className="timeline">
          {narrative.extractions.map((x) => {
            const index = eventIndexForExtraction(narrative, x);
            const isStep = index >= 0;
            const state = currentQuotes.has(x.id)
              ? "now"
              : readQuotes.has(x.id)
                ? "done"
                : isStep
                  ? "next"
                  : "aside";
            const note = isStep
              ? state === "now"
                ? "now"
                : `step ${index + 1}`
              : plainNotAStep(admissionForExtraction(narrative, x)?.outcome);
            return (
              <li key={x.id} className={`tl tl-${state}`}>
                <button
                  type="button"
                  disabled={!isStep}
                  aria-current={state === "now" ? "step" : undefined}
                  onClick={() => setStep(index + 1)}
                >
                  <span className="tl-dot" aria-hidden="true" />
                  <span className="tl-quote">“{x.sourceSpan}”</span>
                  <span className="tl-meta">
                    {verseLabel(x.source)} · {note}
                    {x.modality !== "asserted" ? ` · ${plainModality(x.modality)}` : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="dock" role="group" aria-label="Step through the story">
        <button
          type="button"
          className="btn btn-icon"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          aria-label="Previous step"
        >
          ‹
        </button>
        <div className="dock-steps">
          {events.map((e, i) => (
            <button
              type="button"
              key={e.id}
              className={`dock-step${i < step ? " on" : ""}`}
              onClick={() => setStep(i + 1)}
              aria-label={`Go to step ${i + 1}`}
              aria-current={i + 1 === step ? "step" : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          className="btn btn-icon btn-primary"
          onClick={() => setStep(Math.min(total, step + 1))}
          disabled={step === total}
          aria-label="Next step"
        >
          ›
        </button>
        <div className="dock-label">
          {step === 0 ? "Ready to begin" : `Step ${step} of ${total}`}
          <span className="dock-actions">
            <ShareButton step={step} />
            {step > 0 && (
              <button type="button" className="link" onClick={() => setStep(0)}>
                Start over
              </button>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function GuideSection({
  title,
  hint,
  items,
}: {
  title: string;
  hint: string;
  items: readonly string[];
}) {
  return (
    <div className="guide-section">
      <h3>
        {title} <span className="muted small">{hint}</span>
      </h3>
      <ul>
        {items.map((q) => (
          <li key={q}>{q}</li>
        ))}
      </ul>
    </div>
  );
}

/** Shares a link to this exact step (the address bar already holds it). */
function ShareButton({ step }: { step: number }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    const title = document.title;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Share sheet dismissed or clipboard blocked; nothing to do.
    }
  }

  return (
    <button type="button" className="link" onClick={share}>
      {copied ? "Link copied" : step > 0 ? "Share this step" : "Share"}
    </button>
  );
}
