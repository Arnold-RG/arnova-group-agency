# Arnova Group Agency — Policy & Licensing Governance

**Owner:** Elvora — Policy, Research & Licensing Lead (defined workflow role)
**Coordinator:** Jarvis | **Implementation:** Forge | **Independent verification:** Harold
**Status:** Proposed for owner approval. Roles do not mean autonomous agents are running continuously.

## Purpose
Maintain accurate, relevant, evidence-backed policies and license decisions for each Arnova Group Agency project. Avoid boilerplate, inaccurate legal claims, or incompatible licenses.

## Per-project review
1. Inventory the repository: ownership, contributors, dependencies, bundled media/fonts, data collected, deployment regions, users, commercial/client obligations and current license.
2. Identify the project's intended distribution: private internal, client-owned, public open-source, commercial SaaS, mobile app or demo.
3. Research primary sources and record URL, publisher, jurisdiction, effective date and review date. Check Rwanda law and applicable EU/Poland rules only where they actually apply; seek qualified counsel for legal interpretation.
4. Compare licenses and obligations: copyright holders and contributor permissions; MIT, Apache-2.0, BSD, GPL, AGPL and other licenses as appropriate; dependency compatibility, attribution, source disclosure, patent terms, redistribution, trademarks and third-party asset rights.
5. Propose the minimum necessary project policies: LICENSE/NOTICE, privacy notice, terms, security disclosure, contributor guidelines, acceptable use, data retention, cookies, AI transparency, incident response, backup/restore and client contracts as applicable.
6. Verify claims, implementation and consent flows against the actual product. Never claim compliance, certification or consent unless evidenced.
7. Submit a reviewable pull request with a compatibility matrix, rationale, source links, risks, migration effects and rollback plan. Require owner approval before license changes, publication or production rollout.
8. Recheck after material architecture changes, new third-party components, new jurisdictions or changes to relevant laws; schedule periodic reviews where monitoring is configured.

## Guardrails
- Do not replace an existing license merely because another is popular. A missing LICENSE file is not permission to reuse the code.
- Check permissions from all relevant copyright holders before relicensing; avoid copying third-party code/assets without appropriate rights.
- For client deliverables, confirm ownership and licensing terms in the contract.
- For sensitive data, define data minimization, access control, retention, deletion, breach procedures and lawful processing where applicable.
- Do not publish privacy promises that contradict real analytics, cookies, logs or processors.
- Do not represent policy research as legal advice or a guarantee of compliance.
- Automation may flag issues and prepare drafts; it must not silently relicense repositories, change legal notices, or accept agreements.

## Required decision record
| Field | Required entry |
|---|---|
| Project | Repo and version / branch |
| Distribution and owner | Intended users and rights holder(s) |
| Current licenses | Repository, dependencies and media |
| Proposed license | SPDX identifier, or proprietary terms with rationale |
| Compatibility | Evidence of obligations and conflicts |
| Policies needed | Only relevant policies with scope |
| Jurisdictions | Where product is offered / data processed |
| Sources | Primary URLs and checked dates |
| Risks and mitigation | Concrete actions and owners |
| Review | Harold check and owner approval |

## First rollout
Start with Arnova Group Agency website and RAGI; inventory licenses and policies before suggesting changes. Then prioritize other repositories by risk and exposure. Report progress based on verified work, not assumed autonomous activity.
