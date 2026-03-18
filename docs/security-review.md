# Mathom House Security Review

**Date:** 2026-03-17
**Scope:** Full static site at `mathomhouse.github.io` (HTML, CSS, JS)
**Methodology:** Manual code review targeting OWASP Top 10, secret exposure, XSS vectors, and static-site-specific concerns.

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 2     |
| HIGH     | 3     |
| MEDIUM   | 4     |
| LOW      | 3     |
| INFO     | 3     |

---

## CRITICAL

### C1. Discord Webhook URL Exposed in Client-Side JavaScript

**Files:** `index.js` (line 112), `test/calculators.js` (line 112)

**Description:** A full Discord webhook URL with its secret token is hardcoded in client-side JavaScript. This token is visible to anyone who opens browser DevTools or reads the page source.

**Impact:** An attacker can use this webhook to:
- Send arbitrary messages to your Discord channel (spam, phishing, impersonation)
- Post malicious links or @everyone pings to your community
- Abuse the webhook at high volume, potentially getting your channel flagged by Discord

**Remediation:**
1. **Immediately** regenerate the webhook token in Discord (Server Settings > Integrations > Webhooks). The current token is already compromised since the site is public.
2. Move the webhook call to a server-side proxy. Options for a static site:
   - A Cloudflare Worker or Vercel/Netlify serverless function that accepts feedback and forwards it to Discord
   - Use only the Google Forms submission (which already works) and set up a Google Apps Script trigger to post to Discord from the server side
3. Remove the webhook URL from all client-side code, including `test/calculators.js`.

---

### C2. Firebase API Key and Full Configuration Exposed

**Files:** `domainmaplabeler.html` (line 216-224), `test/playerdata.js` (line 7 area)

**Description:** A complete Firebase configuration including API key, project ID, app ID, and messaging sender ID is embedded in client-side code.

**Impact:** While Firebase API keys are technically designed to be public (they identify the project, not authorize access), this is only safe if Firebase Security Rules are properly locked down. Without verification that Firestore rules restrict reads/writes, an attacker could:
- Read all documents in Firestore
- Write arbitrary data to collections
- Exhaust your Firebase free tier or incur unexpected billing
- Tamper with shared map data

**Remediation:**
1. Verify Firebase Security Rules are restrictive (deny all reads/writes except to specific collections with authentication).
2. Enable App Check on the Firebase project to prevent abuse from unauthorized origins.
3. Set up API key restrictions in Google Cloud Console to limit the key to `mathomhouse.github.io` domain only.
4. Monitor Firebase usage dashboard for anomalous activity.

---

## HIGH

### H1. Pervasive Use of DOM Injection via String Interpolation

**Files:** 70+ instances across the codebase including `header.js` (line 32), `ssc-store.html`, `elstore.html`, `mastersstore.html`, `rankedmatchstore.html`, all store JS files, calculator scripts, and guide pages.

**Description:** The site uses direct DOM string injection extensively to render dynamic content. While most current uses insert hardcoded data (item names, prices) that are not user-controlled, several patterns are concerning:

1. **`header.js` line 32** fetches `/header.html` via `fetch()` and injects it directly into the page. If an attacker could somehow modify `header.html` (e.g., through a compromised CDN or repo), this becomes a full XSS vector.
2. **Store pages** use string template injection with item names from arrays. If these arrays were ever sourced from user input or an external API, XSS would be immediate.
3. **`header.js` line 8** dynamically creates a script element and sets its content to inject Google Analytics code.

**Impact:** Any future change that introduces user-controlled data into these DOM injection calls will create XSS vulnerabilities. The current architecture has no defense-in-depth against this.

**Remediation:**
1. Replace string-based DOM injection with safe DOM APIs (`createElement`, `textContent`, `appendChild`) wherever possible.
2. For the header injection, consider using `DOMParser` and selectively importing nodes, or use a `<template>` element.
3. For store tiles and cart items, build elements programmatically instead of string interpolation.
4. Where direct HTML insertion is truly necessary, use a lightweight sanitizer like DOMPurify.

---

### H2. No Content Security Policy (CSP)

**Files:** All HTML pages, no `_headers` file exists.

**Description:** The site has no Content Security Policy defined via HTTP headers or `<meta>` tags. GitHub Pages does not set CSP headers by default, and no custom configuration exists.

**Impact:** Without CSP:
- If any XSS vulnerability is found, there is no restriction on what scripts can execute.
- Inline event handlers (`onclick`, `onerror`) and inline `<script>` blocks run without restriction.
- Third-party scripts can be injected without any origin restrictions.
- Data exfiltration via `fetch`/`XMLHttpRequest` to arbitrary domains is unrestricted.

**Remediation:**
1. Add a `<meta http-equiv="Content-Security-Policy">` tag to every page. Start with a report-only policy:
   ```html
   <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' https://www.googletagmanager.com https://cdn.jsdelivr.net https://www.gstatic.com 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://docs.google.com https://discord.com https://firestore.googleapis.com;">
   ```
2. Gradually tighten the policy by moving inline scripts to external files and using nonces or hashes instead of `'unsafe-inline'`.

---

### H3. Third-Party Scripts Loaded Without Subresource Integrity (SRI)

**Files:**
- `elpoints.html` line 7: `https://cdn.jsdelivr.net/npm/chart.js`
- `archive/EnigmaDominators.html` line 39: `https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js`
- `old files/EnigmaDominatorsOld.html` line 28: same xlsx library
- `domainmaplabeler.html` lines 227-228: Firebase SDK from `gstatic.com`
- `test/playerdata.js` lines 778-780: Firebase SDK from `gstatic.com`
- `header.js` line 4: Google Tag Manager (dynamically created)

**Description:** All third-party scripts are loaded without `integrity` attributes (Subresource Integrity). None of the `<script>` tags or dynamic `import()` calls include SRI hashes.

**Impact:** If any CDN (jsdelivr, cdnjs, gstatic) is compromised or serves tampered content, malicious code would execute in users' browsers with full access to the page DOM, localStorage, and any form data.

**Remediation:**
1. Add `integrity` and `crossorigin="anonymous"` attributes to all third-party `<script>` tags.
   Example: `<script src="https://cdn.jsdelivr.net/npm/chart.js" integrity="sha384-..." crossorigin="anonymous"></script>`
2. Generate hashes using https://www.srihash.org/ or `shasum` for each library version.
3. Pin library versions (avoid `@latest` or unversioned URLs).

---

## MEDIUM

### M1. Inline Event Handlers Throughout the Site

**Files:** 38 HTML files with a combined 129 occurrences of `onclick`, `onerror`, `onload`, `onchange`, `onblur`, etc.

**Description:** The site uses inline event handlers extensively:
- `onclick="toggleCart()"` (ssc-store.html)
- `onclick="openFeedbackModal(); return false;"` (index.html)
- `onclick="closeSupportModal()"` (index.html)
- `onchange="syncInputs()"` (store pages, generated via DOM injection)
- `onblur="checkAndUpdateCustom()"` (gems.js)

**Impact:**
- Inline handlers prevent adoption of a strict CSP (requires `'unsafe-inline'` for scripts).
- They create a broader attack surface if any DOM injection is possible.
- They make the codebase harder to audit for security issues.

**Remediation:**
1. Migrate all inline handlers to `addEventListener()` calls in JavaScript files.
2. This is a prerequisite for implementing a meaningful CSP.

---

### M2. Duplicate HTML Element IDs

**Files:** `index.html` (lines 304, 306), `test/calculators.html` (lines 229, 231)

**Description:** The `index.html` file contains two `<div>` elements with `id="modal-backdrop"`.

**Impact:**
- `document.getElementById('modal-backdrop')` will only return the first element, leaving the second backdrop uncontrolled.
- This can cause UI state inconsistencies where a backdrop remains visible, potentially trapping user interaction or allowing click-through to obscured elements.
- While not directly a security vulnerability, it indicates code quality issues that can mask real bugs.

**Remediation:**
1. Remove the duplicate `modal-backdrop` div on line 306 of `index.html`.
2. Same fix for `test/calculators.html` line 231.

---

### M3. Feedback Form Has No Rate Limiting or CSRF Protection

**Files:** `index.js` (lines 81-141)

**Description:** The feedback submission function `submitModalFeedback()` sends data to both Google Forms and the Discord webhook with no protections:
- No CAPTCHA or bot detection
- No rate limiting (client or server)
- No CSRF token
- No input sanitization before sending to Discord (user input is embedded directly into the Discord embed fields)

**Impact:**
- An attacker can script automated submissions to spam your Google Forms responses and Discord channel.
- Malicious content (phishing links, @everyone mentions) can be injected into Discord embed fields via the feedback form.
- The `no-cors` mode on the Google Forms request means errors are silently ignored.

**Remediation:**
1. Add a CAPTCHA (e.g., hCaptcha, Cloudflare Turnstile) to the feedback form.
2. Implement client-side rate limiting (e.g., disable submit button for 60 seconds after submission, store timestamp in localStorage).
3. Sanitize/escape user input before including it in the Discord payload.
4. After moving the webhook server-side (see C1), implement server-side rate limiting.

---

### M4. User Input Passed to Discord Without Sanitization

**Files:** `index.js` (lines 113-127)

**Description:** The feedback form values (`type`, `feedback`, `discord`) are inserted directly into the Discord webhook embed payload without any sanitization.

**Impact:**
- Discord markdown injection: users can format messages, add links, or use `@everyone`/`@here` mentions.
- Could be used for social engineering within the Discord server.

**Remediation:**
1. Strip or escape Discord markdown characters before sending.
2. Validate input length and character set on the client side.
3. Consider stripping URLs from user-submitted feedback.

---

## LOW

### L1. Google Analytics Measurement ID Exposed

**Files:** `header.js` (lines 4, 12)

**Description:** The Google Analytics measurement ID `G-4R1NPM39PL` is visible in client-side code. This is expected and by design for GA, but worth noting.

**Impact:** An attacker could send fake analytics events to pollute your data. This is a low-risk nuisance.

**Remediation:**
1. Use GA4's built-in bot filtering.
2. Set up referral exclusions for known spam domains.
3. Consider server-side analytics if data integrity is critical.

---

### L2. Google Forms Entry IDs Exposed

**Files:** `index.js` (lines 100-104)

**Description:** The Google Forms URL and entry field IDs are visible. Anyone can submit to this form programmatically, bypassing the site's UI.

**Impact:** Combined with no rate limiting, this enables automated spam of form responses.

**Remediation:**
1. Add form response validation in Google Forms.
2. Consider moving form submission server-side.

---

### L3. localStorage Used Without Integrity Checks

**Files:** `header.js`, `index.js`, `guides.js`, `domainmaplabeler.html`, `test/playerdata.js`

**Description:** The site stores theme preferences and map labels in `localStorage` without any validation or integrity checking on retrieval. Values read from `localStorage` are used directly.

**Impact:** If another script on the same origin (or an XSS exploit) modifies localStorage, it could inject unexpected values. For this site, the risk is low since stored values are simple strings ("dark"/"light") or JSON arrays used in non-security-critical features.

**Remediation:**
1. Validate values read from `localStorage` against expected formats before use.
2. For the player data draft feature, consider adding a checksum or schema validation.

---

## INFO

### I1. Missing Security-Related HTTP Headers

**Description:** GitHub Pages does not allow custom HTTP headers. The following security headers are absent:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera, microphone, etc.)

**Impact:** The site could be embedded in iframes on malicious domains (clickjacking). MIME sniffing could cause misinterpretation of uploaded files.

**Remediation:**
1. Where possible, add `<meta>` equivalents (CSP and Referrer-Policy support meta tags; X-Frame-Options does not).
2. If migrating to Cloudflare Pages or Netlify, add a `_headers` file to set all security headers.
3. Add `<meta name="referrer" content="strict-origin-when-cross-origin">` to all pages.

---

### I2. External Links Missing `rel="noreferrer"`

**Files:** `index.html` (line 312), `test/calculators.html` (line 237)

**Description:** External links to `buymeacoffee.com` correctly include `rel="noopener"` but omit `rel="noreferrer"`. Modern browsers handle this automatically, but adding both is a best practice.

**Remediation:**
Change to `rel="noopener noreferrer"` on all `target="_blank"` links.

---

### I3. Test/Archive Files Publicly Accessible

**Files:** `test/` directory, `old files/` directory, `bobgriftest.html`, `crunchy.html`, `lexi.html`

**Description:** Development test pages, old/archived versions, and prototype files are publicly accessible. These include duplicate webhook URLs (`test/calculators.js`), Firebase configurations, and potentially unfinished features.

**Impact:** Test files expand the attack surface. They may contain debugging code, less-reviewed logic, or stale credentials. The duplicate webhook in `test/calculators.js` means even if you fix `index.js`, the secret remains exposed.

**Remediation:**
1. Add a `.gitignore` entry or move test/old files out of the deployed branch.
2. If keeping them, add a `robots.txt` with `Disallow` rules (note: this does not prevent direct access, only search engine indexing).
3. Consider a separate branch or local-only directory for development files.

---

## Prioritized Action Plan

| Priority | Action | Findings |
|----------|--------|----------|
| 1 | Regenerate Discord webhook token immediately | C1 |
| 2 | Remove webhook URL from all client-side code | C1 |
| 3 | Verify Firebase Security Rules | C2 |
| 4 | Restrict Firebase API key to your domain | C2 |
| 5 | Add SRI to third-party scripts | H3 |
| 6 | Add meta CSP tag to all pages | H2 |
| 7 | Add CAPTCHA to feedback form | M3 |
| 8 | Sanitize user input before Discord payload | M4 |
| 9 | Fix duplicate element IDs | M2 |
| 10 | Migrate inline handlers to addEventListener | M1 |
| 11 | Remove/protect test and archive files | I3 |
| 12 | Begin replacing string-based DOM injection with safe DOM APIs | H1 |
