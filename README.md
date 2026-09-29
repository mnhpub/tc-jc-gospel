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

## Current features

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

## Model boundary

Canonical narrative events, extraction, admission, inference, interpretation, and application are intentionally separate. Interpretive or application outputs must not rewrite the admitted event stream.
