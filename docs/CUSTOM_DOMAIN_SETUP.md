# ArnovaGroup custom .com domain

**Selected name:** `arnovagroupagency.com`

**Status:** Available in the domain-availability check on 19 November 2026, but **not registered or connected**. Availability may change. Keep the current site at https://arnold-rg.github.io/arnova-group-agency/ until the domain is owned and verified.

## Before switching

1. Register `arnovagroupagency.com` in an account controlled by the agency. Enable account two-factor authentication, auto-renew, and record the renewal date.
2. Verify ownership of `arnovagroupagency.com` in GitHub account **Settings → Pages → Add a domain**. Add the exact TXT record GitHub issues to the registrar's DNS, and keep it permanently.
3. Only after ownership is confirmed, add `arnovagroupagency.com` to the **Custom domain** field in the Pages settings for the repository: https://github.com/Arnold-RG/arnova-group-agency/settings/pages .
4. Set these DNS records with the domain registrar:

| Type | Name / host | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | Arnold-RG.github.io |

Use the GitHub Pages **hostname**, not a URL with `/arnova-group-agency/`, as the CNAME target. Remove conflicting DNS parking records, but **preserve email-related TXT and MX records** and any other needed records.

5. Once DNS has propagated, enable **Enforce HTTPS** in Pages settings. Verify both `https://arnovagroupagency.com/` and `https://www.arnovagroupagency.com/` behave as intended.
6. Update canonical URLs, Open Graph, structured data, sitemap, robots.txt, any branding or portfolio links, and email signature links to the confirmed live domain. Test home page, blog pages, logo, CSS, JavaScript, images, and WhatsApp contact flow.
7. If using this domain for email, set up an authorized mail provider and configure its MX, SPF, DKIM and DMARC records. Do not invent or publicly advertise company mailboxes until they work.

**Important:** No `CNAME` file has been added yet. Pointing an unowned domain at this repository may break the live site or create a domain-takeover risk.

## Sources

- GitHub Pages: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- GitHub Pages verification: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/verifying-your-custom-domain-for-github-pages
- GitHub Pages HTTPS: https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https
