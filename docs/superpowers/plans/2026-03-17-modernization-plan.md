# Mathom House Modernization Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Modernize the Mathom House GitHub Pages site with improved visual design, comprehensive dark mode, code cleanup, and security hardening.

**Architecture:** Vanilla HTML/CSS/JS static site. All pages share `styles/index.css`, `styles/header.css`, `header.js`, and `header.html`. Changes to shared files cascade to all ~60 pages. No build system — direct file edits deployed via GitHub Pages.

**Tech Stack:** HTML5, CSS3 (custom properties), vanilla JavaScript, GitHub Pages (Jekyll)

---

### Task 1: Security Review & Findings Document

**Files:**
- Create: `docs/security-review.md`
- Read: `index.js`, `header.js`, `index.html`, all HTML pages

- [ ] **Step 1: Write security review document**

Audit and document:
- CRITICAL: Discord webhook URL exposed in client-side JS (index.js:112)
- innerHTML usage for dynamic content (header.js:32, ssc-store.html store tiles, cart)
- No Content Security Policy headers
- No Subresource Integrity on external scripts (Google Analytics loaded dynamically)
- Inline onclick handlers throughout all pages
- Google Forms endpoint exposed (low risk, but noted)
- Duplicate modal-backdrop IDs in index.html
- No input sanitization on feedback form before Discord webhook post

- [ ] **Step 2: Commit security review**

### Task 2: Comprehensive Dark Mode CSS Variables

**Files:**
- Modify: `styles/index.css`
- Modify: `styles/header.css`

- [ ] **Step 1: Add `[data-theme="dark"]` variable overrides to index.css**

Add dark mode overrides for all CSS custom properties: backgrounds, borders, shadows, inputs, tables, modals, toast, hero section. Currently only header.css has dark vars — index.css has none.

- [ ] **Step 2: Ensure header.css dark mode is complete**

The existing `[data-theme="dark"]` block in header.css covers basics. Add missing dark overrides for submenu backgrounds, nav borders, card-link hover states.

- [ ] **Step 3: Verify dark mode cascades to sub-pages**

Check that calculator pages (exclusives.html, gems.html), store pages (ssc-store.html), and guide pages all inherit dark mode properly. Fix any inline styles that override CSS variables.

- [ ] **Step 4: Commit dark mode enhancements**

### Task 3: Visual Modernization (CSS)

**Files:**
- Modify: `styles/index.css`
- Modify: `styles/header.css`

- [ ] **Step 1: Modernize color palette and typography**

- Refine CSS custom properties for both light and dark themes
- Better contrast ratios (WCAG AA minimum)
- Improved font stack
- Smoother gradients and shadows

- [ ] **Step 2: Modernize card design**

- Subtle gradient backgrounds
- Better hover effects with smooth transitions
- Improved spacing and padding consistency

- [ ] **Step 3: Modernize hero section and footer**

- Gradient hero background
- Styled footer with proper dark mode support

- [ ] **Step 4: Modernize modal and toast styles**

- Better modal overlay with backdrop blur
- Improved button styles
- Toast notification polish

- [ ] **Step 5: Improve mobile responsiveness**

- Better touch targets
- Improved hamburger menu transitions
- Consistent spacing on small screens

- [ ] **Step 6: Commit visual modernization**

### Task 4: Code Cleanup

**Files:**
- Modify: `index.html`
- Modify: `index.js`
- Modify: `header.js`

- [ ] **Step 1: Fix duplicate modal-backdrop in index.html**

Remove the duplicate `<div id="modal-backdrop">` on line 306.

- [ ] **Step 2: Replace inline onclick handlers in index.html**

Move `onclick="openFeedbackModal()"`, `onclick="openSupportModal()"`, `onclick="scrollToTop()"` to event listeners in index.js.

- [ ] **Step 3: Clean up index.js**

Remove commented-out code (line 7). Clean up the transitionend listener pattern for HT icon cycling (potential listener leak).

- [ ] **Step 4: Fix header.js redundancy**

The `addFavicon()` function in header.js is defined but never called — favicon is already in HTML. Remove dead code.

- [ ] **Step 5: Commit code cleanup**

### Task 5: Security Hardening

**Files:**
- Modify: `index.js` (move webhook to server-side recommendation)

- [ ] **Step 1: Remove exposed Discord webhook URL from client-side code**

Replace with a comment/placeholder directing maintainers to use a server-side proxy (e.g., Cloudflare Worker, serverless function). Document the recommendation in security-review.md.

Note: We cannot fully fix this without server-side infrastructure, but we remove the exposed secret and document the path forward.

- [ ] **Step 2: Add security-related meta tags**

Add `Referrer-Policy` and `X-Content-Type-Options` via meta tags where possible (limited in static GitHub Pages context).

- [ ] **Step 3: Commit security hardening**

### Task 6: Deploy to Private Preview Repo

- [ ] **Step 1: Create private repo and push**

Create a new private GitHub repo, push the modernized code, and enable GitHub Pages.

- [ ] **Step 2: Share preview URL**

### Task 7: Save Memory

- [ ] **Step 1: Write mathomhouse memory file**

Save project context, key decisions, and repo structure to memory for future reference.
