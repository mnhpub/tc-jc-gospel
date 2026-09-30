# External cases

Internal models are built from scripture (`src/turing-complete-gospel-of-jesus-christ.ts`). **External cases** describe real-world or illustrative situations in the same grammar, so the same authority and responsibility rules apply to both. Each case is one JSON file in this folder, loaded with `loadExternalCase` / `loadExternalCases` from `src/externalCase.ts`.

## Format (schemaVersion 1)

| Field | What it holds |
|---|---|
| `id`, `title`, `summary` | Identity and a short description. |
| `illustrative` | `true` for invented cases. Real cases must cite real sources. |
| `sources[]` | Every document the case relies on: `id`, `kind`, `title`, optional `url` and `date` (YYYY-MM-DD). |
| `actors[]`, `entities[]` | Who acts, and what is acted on (`id`, `label`). |
| `authorities.sources[]` | Root authority: a `bearer`, where the authority comes from (`source`), and `sourceRefs`. |
| `authorities.grants[]` | Delegations: `id`, `sourceActor` → `bearer`, `scope` (`domain`, optional `operations`, `targets`), `permissions` (`act`, `delegate`), optional `derivedFrom`, `sourceRefs`. |
| `acts[]` | What happened: `actor`, `operation` (named as in the scope), optional `target` and `authority` (a grant id or a root bearer), `attribution`, `consequential`, `sourceRefs`. |
| `shape` | Optional: the case in the five plain steps used to compare with the scripture stories. |

## Source kinds and attribution

Only some sources can **establish** who performed an act: `court-judgment`, `official-record`, and `company-document` (an organization's own record of its own decision). A `court-filing` or `news-report` can only **allege** it.

An act marked `"attribution": "established"` whose sources can only allege it is loaded as `alleged`, with a warning. Until a case says who acted on the strength of an establishing source, its responsible party stays undetermined.

## What the loader does

- **Errors stop the load:** wrong shape, unknown ids, duplicate ids, a bad `kind` or `attribution`. Every error is reported at once, with its JSON path.
- **Warnings flag a loaded case:** each act is resolved with `resolveResponsibility`. An act with no authority, beyond its scope, on a broken delegation chain (R004, R005, R022), or consequential with no responsible party (R023) loads with a warning, never silently.
- **Loading many cases:** `loadExternalCases` keeps every case that loads and reports the rest; one bad file never blocks the others.

The loader describes and checks cases. It does not produce verdicts about people: a finding such as "exceeds scope" or "responsible party undetermined" is a question for the people using it.

## Writing a case about real people

- Cite a source for every grant and act.
- Mark who acted as `alleged` until an establishing source says otherwise. A charge is not a finding.
- Prefer organizations' documented decisions over reporting about individuals.
