# Pull Requests Log

## Template

```md
### Title
<short, imperative PR title>

### Summary
- What changed
- Why it changed
- Any notable constraints

### Affected pages / blocks
- /content/chevronlubricants/...

### Testing
- [ ] Local `hlx up` / `aem up`
- [ ] Checked Lighthouse scores
- [ ] Visual comparison to source URL

### Related tickets
- JIRA: XYZ-123
- Slack: link-to-thread
```

---

## Open PRs

### Migrate Chevron Lubricants design system to EDS

**Branch:** `main`
**Status:** Ready for review

### Summary
- Extracted design tokens from chevronlubricants.com (colors, typography, spacing, sections)
- Updated `styles/styles.css` with Chevron brand palette (blues, greys) and typography (Montserrat as Gotham Narrow substitute)
- Created `styles/fonts.css` for font loading configuration
- Styled all 5 block variants: columns-promo, cards-industry, columns-brands, columns-products, cards-insights
- Added section background variants (blue-bg, grey-bg, light-blue-bg)
- Implemented button system with primary, outline, accent, and light variants including hover/focus/active states

### Affected pages / blocks
- /styles/styles.css (complete design system rewrite)
- /styles/fonts.css (new: font loading)
- /blocks/columns-promo/columns-promo.css
- /blocks/cards-industry/cards-industry.css
- /blocks/columns-brands/columns-brands.css
- /blocks/columns-products/columns-products.css
- /blocks/cards-insights/cards-insights.css
- /content/index (homepage preview)

### Testing
- [x] Local `aem up` — page renders at localhost:3000/content/index
- [ ] Checked Lighthouse scores
- [x] Visual comparison to source URL

---

## Merged PRs

(none yet)