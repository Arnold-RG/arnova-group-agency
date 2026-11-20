# Arnova Group Agency — Engineering, Reliability & Recovery Standard

**Scope:** Every new or maintained Arnova Group Agency project, including client sites, apps, RAGI, APIs, POS and inventory products.
**Status:** Proposed organization-wide policy, awaiting owner review and rollout. A standard is not evidence that every repository currently complies.

## 1. Assess before implementing
For each project record: architecture, users, data sensitivity, target browsers/devices, dependencies, hosting budget, backup needs, recovery time objective (RTO), recovery point objective (RPO), expected traffic, and owner-approved release process.

## 2. Docker and Kubernetes
- Evaluate Docker for every project. For runnable server-side projects, provide a documented Dockerfile and a local Compose setup where practical; pin base versions, use non-root users, minimize image size, exclude secrets, and scan images.
- Evaluate Kubernetes for every project. Use Kubernetes manifests/Helm only for projects with operational justification (scaling, multi-service orchestration, high availability, etc.). A small static website may use static hosting; do not deploy an expensive cluster merely to satisfy a checklist.
- Validate configuration and container startup; document health/readiness probes, resource limits, rolling deployments, rollback and secret management where applicable.

## 3. JavaScript / TypeScript and pagination
- Choose JavaScript or TypeScript based on project needs; prefer TypeScript for complex apps and APIs. Do not rewrite stable projects solely to add a language.
- Apply accessible pagination or virtualized lists for large collections. For server-side pagination enforce maximum page size, deterministic sorting, filtering, authorization, and stable cursor/offset handling. Test empty and last pages.

## 4. Continuous testing and compatibility
- Maintain project-appropriate automated unit, integration, E2E, smoke and regression tests; add tests for each fixed defect.
- CI should run lint, type checks, tests, dependency audits, secret scans and build validation. Add container/image checks and Kubernetes schema checks where used.
- Check responsive design, accessibility, keyboard navigation, reduced motion, common browsers, OS targets, slow networks, API compatibility and data migrations.
- Never report passing tests without logs or a verified run.

## 5. Backups and recovery
- Define RPO/RTO and critical data. Use scheduled encrypted backups with documented retention, least-privilege access, offsite storage where appropriate, and restoration drills.
- Source control is not a database backup. Verify backup success and restoration integrity; document the last successful test.
- Before risky deployments take verified backups or snapshots, prepare a rollback artifact, and document reversibility of schema changes.

## 6. Incident response / rapid repair
1. Detect: monitoring alert, test failure, user report or failed health check.
2. Triage: determine severity, affected users, impact and whether data is at risk.
3. Contain: disable failing feature or roll back to a known-good release when safe.
4. Restore: recover service or data from verified backups if necessary.
5. Verify: run smoke tests, inspect metrics and confirm recovery.
6. Review: document root cause, timeline, corrective action and regression test.

Automatic remediation is permitted only for bounded, low-risk, reversible actions with audit logs, health checks and safeguards. Production data deletion, payment actions, privileged access changes, destructive migrations and unverified restores require human approval.

## 7. Observability and maintenance
- Structured logs without sensitive data, health endpoints where relevant, metrics, error tracking, alert routing and uptime checks.
- Review dependencies and vulnerabilities on a schedule; prioritize security fixes and record compatibility impact.
- Publish accurate release notes, operational runbooks, ownership, rollback steps and known limitations.

## 8. Minimum project review checklist
- [ ] Requirements, compatibility matrix and architecture recorded
- [ ] Docker suitability reviewed; container build provided where appropriate
- [ ] Kubernetes suitability reviewed and decision documented
- [ ] JS/TS choice documented and type/lint checks configured where relevant
- [ ] Pagination / filtering implemented for large data views when needed
- [ ] Automated tests and CI configured and passing (attach evidence)
- [ ] Security, accessibility and performance reviewed
- [ ] Backups configured where data exists; restoration tested
- [ ] Monitoring, alerts, rollback and incident runbook documented
- [ ] Owner approval recorded before production release

## Roles
Elvora: research technology choices and business constraints. Forge: implement and document. Harold: independent QA, security and restore verification. Jarvis: coordinate evidence, blockers and approval. These are workflow roles, not independently deployed agents.
