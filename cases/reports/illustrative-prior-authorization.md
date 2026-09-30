# Comparison: Illustrative: two prior-authorization denials

_Illustrative case: the parties and documents are invented._

> Structural comparison only. Matching patterns show that two acts have the same authority structure, not that they are alike in meaning or in merit. Nothing here is a finding of fact, of law or of fault.

## Acts

### Clinical Reviewer A denies request 1 after a clinical review.

- **Outcome:** Authorized, under a grant derived from another grant
- **Attribution:** established · consequential
- **Authority chain:** Clinical Reviewer A ← Example Review Co. ← Example Health Plan
- **Responsible:** Clinical Reviewer A (actor), Example Review Co. (delegator), Example Health Plan (delegator)
- **Same outcome, different delegation:** Jesus commands the girl to rise (Mark 5:41, on the actor's own authority); The first servant trades with five talents (Matthew 25:16, under a grant from the source); The second servant trades with two talents (Matthew 25:17, under a grant from the source); The third servant hides his talent (Matthew 25:18, under a grant from the source)

Questions:

- The chain runs Example Health Plan → Example Review Co. → Clinical Reviewer A. Was each link in force, and within its conditions, when the act was done?
- In the Talents, acting within a grant did not end the matter: the master still settled accounts (Matthew 25:19). What accounting applies to this act, and who carries it out?

### Example Review Co. denies request 2 automatically, with no clinical review.

- **Outcome:** Exceeds scope, under a grant from the source
- **Attribution:** established · consequential
- **Authority chain:** Example Review Co. ← Example Health Plan
- **Responsible:** Example Review Co. (actor)
- **In scripture:** no internal model shows this outcome.

Questions:

- Example Review Co. acted beyond the grant grant-review-vendor as granted. Who was responsible for keeping the act within scope?
- Does another source of authority cover the act? If so, it needs to be added to the case with its sources.

### A news report says the plan set targets for denials.

- **Outcome:** Attribution undetermined, no authority claimed
- **Attribution:** alleged · consequential
- **Responsible:** undetermined
- **In scripture:** no internal model shows this outcome.

Questions:

- What source could establish who performed this act: a court judgment, an official record, or the organization's own document?
- Until then, the report names no responsible party. Is anyone treating this act as established without such a source?

## The internal models

| Story | Authority modelled | Acts with the same pattern |
| --- | --- | --- |
| Jairus's Daughter (Mark 5:21–43) | yes | — |
| The Good Samaritan (Luke 10:30–37) | no | — |
| The Prodigal Son (Luke 15:11–32) | no | — |
| The Sower (Matthew 13:3–9) | no | — |
| The Talents (Matthew 25:14–30) | yes | — |
| The Lost Sheep (Luke 15:3–7) | no | — |

No internal model shows: exceeds scope, attribution undetermined. The comparison has nothing to line these acts up with.

## Shapes side by side

Shown for people to compare. The report does not score how alike they are.

| Step | This case | Jairus's Daughter | Good Samaritan | Prodigal Son | Sower | Talents | Lost Sheep |
| --- | --- | --- | --- | --- | --- | --- | --- |
| At the start | A member needs a procedure that requires prior authorization. | Jairus's daughter lies at the point of death. | A traveler is robbed and left half dead. | A younger son leaves home with his inheritance. | A sower scatters seed. | A master entrusts money to three servants. | A shepherd has a hundred sheep and loses one. |
| What happens | The plan's review vendor evaluates two requests. | Messengers report that she has died. | Three people come down the road. | He wastes it all and comes to himself. | It falls on four kinds of ground. | He goes away for a long time. | He leaves the ninety and nine. |
| The response | One request gets clinical review; the other is denied automatically. | Jesus says, “Be not afraid, only believe.” | Two pass by; a Samaritan stops. | He goes home, and his father runs to meet him. | Each ground receives it differently. | Two trade with it; one buries it. | He searches until he finds it. |
| What changes | Both requests are denied. | He takes her hand: “Talitha koum.” | He bandages him, carries him and pays for his care. | The lost son is welcomed back. | Birds, sun and thorns take three; one grows. | The two double what they were given. | He carries it home on his shoulders. |
| How it ends | One denial traces to a full chain of authority; the other falls outside what was granted. | She rises and walks, and is given something to eat. | The traveler is cared for at the inn. | A feast: “this my son was dead, and is alive again.” | Good ground bears fruit, up to a hundredfold. | The master returns and settles accounts. | He calls his friends to rejoice with him. |

## Loader warnings

- `$.acts[1]` R004: Operation "deny-without-clinical-review" is outside grant grant-review-vendor (allows: review, approve, deny-after-clinical-review).
- `$.acts[2].attribution`: Marked established, but no cited source can establish who acted (court judgment, official record or the organization's own document). Loaded as alleged.
- `$.acts[2]`: The actor is alleged, not established. Responsibility stays undetermined until the evidence establishes who acted.
- `$.acts[2]` R023: Consequential act with no determined responsible party.
