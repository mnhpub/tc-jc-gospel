# The Turing Complete Gospel of Jesus Christ

Interactive provenance-preserving semantic event workbench for the Gospel narrative model.

## Run

```bash
npm install
npm run dev
```

Open the local Vite address shown in the terminal.

## Build

```bash
npm run build
```

## Deploy

`.github/workflows/pages.yml` type-checks and builds every pull request, and publishes the app to GitHub Pages on every push to `main`. To turn publishing on once: **Settings → Pages → Build and deployment → Source: GitHub Actions**. The site then lives at `https://<owner>.github.io/tc-jc-gospel/`.

The build uses relative paths, so `dist/` can also be dropped onto Netlify or any static host as-is.

## Story mode (default)

The app opens in **Story mode**, written for Bible study groups:

- **Story**: step through the passage one moment at a time. Each step shows the verse, what happens in plain words, and what changed ("The traveler · care: no one helping → wounds bandaged").
- **Pattern**: the story's shape in five plain steps.
- **Compare**: two stories side by side, step by step.
- **Sources**: every step traced back to its verse, with readings and takeaways clearly marked as interpretation.
- **Discussion questions** for each story (look closely → think it through → live it out).
- **Shareable steps**: the address always holds the story, tab and step (for example `?story=prodigal-son&step=3`), and **Share this step** sends it from a phone's share sheet or copies it.
- **Dark mode** follows the device setting.

Plain wording lives in `src/plainLanguage.ts`; story summaries and discussion questions live in `src/studyGuide.ts`, so study leaders can edit them without touching the model. Turn on **Show the model** (or open `?mode=model`) for the technical workbench below.

The layout is mobile-first: on phones the view tabs and step controls sit at the bottom in thumb reach; from 720 px the tabs move to the top, and from 900 px the story timeline sits beside the current step.

## Current features (model mode)

- Gospel narrative switching
- event-stream replay with provenance highlighting (each event lights up the quotation it was admitted from)
- before/after state diff for every replayed event
- interactive audit graph: select any node to trace its lineage from verse → extraction → admitted event → rule/authorization → interpretation → application
- aggregate/state replay snapshots
- epistemic lanes
- provenance expansion
- rule and authorization inspection
- live rule enable/disable controls
- disputed-authorization controls
- interpretive overlays
- normative application gate
- cross-narrative comparison

## Responsibility resolution

`src/responsibility.ts` answers, for any consequential act, two questions a legal system must be able to answer: **under what authority was it performed, and who is responsible?** `resolveResponsibility(act, context)` walks the act's claimed authority back through every delegation (`derivedFrom`) to a recognized source and returns one of five outcomes:

| Outcome | Authority | Responsible |
|---|---|---|
| `authorized` | Full chain to a source | The actor and every delegator in the chain |
| `exceeds-scope` | Valid chain, act outside the granted scope | The actor only |
| `no-authority` | None claimed | The actor alone |
| `invalid-chain` | Does not trace to a valid source (R004, R005, R022) | The actor, plus whoever issued the defective grant |
| `attribution-undetermined` | Whatever the evidence supports | Undetermined: an allegation is not attribution |

`assertTraceable` and `assertAccountable` turn a broken chain or a missing responsible party into a `ModelInvariantError` (R022 *AuthorityChainTraceability*, R023 *ActRequiresResponsibleParty*) where a gap must stop processing. Tests in `src/responsibility.test.ts` use the Talents parable (delegation and accounting) and Mark 5 (the same act with and without authority); run them with `npm test`.

## External cases

Scripture stories are the model's *internal* cases. *External* cases (a claim denial, a court record, a company decision) are written as JSON in `cases/` and loaded with `loadExternalCase` / `loadExternalCases` (`src/externalCase.ts`). The loader validates each case, converts it into model types, and resolves the authority and responsible party of every act, so a broken chain or an unaccountable act loads flagged rather than silently. See [`cases/README.md`](cases/README.md) for the format and an illustrative example.

## Model boundary

Canonical narrative events, extraction, admission, inference, interpretation, and application are intentionally separate. Interpretive or application outputs must not rewrite the admitted event stream.
