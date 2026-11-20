# Security Policy — ArnovaGroup Agency

## Support and vulnerability reporting
The latest `main` branch is supported. Report vulnerabilities through a GitHub private security advisory when available or contact the maintainer privately using their GitHub profile. Do not post exploit steps, client data, credentials, or WhatsApp conversation contents in public issues.

## Risk-based controls
- **GRC / customer trust:** Treat inquiry details and client briefs as confidential. Use consented images, trademarks, and testimonials; separate concept designs from commissioned client work. Check applicable privacy and advertising requirements before any client launch.
- **IAM:** This GitHub Pages site has no application user accounts or server-side login. Protect repository collaborator access with least privilege and account MFA. Any future client portal or dashboard needs server-enforced access control and session protection, not a JavaScript-only gate.
- **Cloud and supply chain:** Keep deployment tokens out of public HTML, scripts, and commits. Limit Actions permissions, review Dependabot PRs and third-party scripts, and use HTTPS for outbound services. Treat WhatsApp as an external service; the inquiry form opens an external chat and should not silently claim to store or encrypt submitted messages.
- **Web security:** Validate external links and form fields, do not insert untrusted strings as HTML, and limit any future uploads or hosted integrations to approved origins.
- **AI:** If AI-assisted client support or lead scoring is later added, apply prompt-injection defenses, data minimization, access controls, human approval for customer-facing actions, and output review.
- **OT:** Not relevant to the current agency website.

## Release checklist
Run existing CI/website checks, review privacy and client-consent implications, confirm no hard-coded secrets, check outbound integrations and dependency changes, and request owner approval before production publication.
