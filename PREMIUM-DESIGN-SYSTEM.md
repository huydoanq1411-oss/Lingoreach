# Premium Dark Educational

The shared presentation layer is `assets/premium-dark.css`. Every populated standalone learning page loads it after `assets/lingoreach.css`. The React hero uses `designpro/styles.css` and Tailwind theme tokens.

| Role | Value |
| --- | --- |
| Canvas | `#0A0A0A` |
| Surface | `#121415` |
| Hero | `#0A1128` → `#064E3B` |
| Primary button | `#0F766E` with white text |
| Active accent | `#14B8A6` |
| Academic accent | `#D4AF37` |
| Heading | White, Fraunces / Georgia |
| Body | Inter / system sans, light gray |
| Border | White at 10% opacity |

Existing theme controls and storage keys remain intact. Their two states now select charcoal and navy-charcoal palettes. Existing answer feedback retains distinct success and error colors. IPA and code keep their monospace fonts.

Cards use 16px corners, subtle borders, and a 4px hover lift on fine pointers. Interactive elements transition over 300ms. Existing scroll reveals use a 600ms fade and 16px upward movement. Hero highlights keep their shine sweep. Reduced motion and the existing effects switch disable decorative movement. Print styles use a readable light canvas.

## Preservation and verification

`scripts/premium-content-baseline.json` records hashes captured before the restyle. `node scripts/verify-premium-preservation.cjs` checks all 48 source files while excluding only explicitly allowed presentation edits: theme stylesheet links, the heading-font URL, JSX classes, and the shine color. Lesson scripts, text, data, routes, and React handlers are otherwise unchanged.

- `npm run build`: TypeScript and production build.
- `node scripts/verify-ui.cjs`: existing lesson interactions, persisted state, quiz scoring, responsive layout, and reduced motion.
- `node scripts/verify-premium-ui.cjs`: theme loading on all 41 populated legacy pages, dark-text screening, and representative desktop/mobile screenshots.
- `node scripts/verify-designpro.cjs`: React hero navigation, dialog, video attributes, reduced motion, and responsive layout against a running preview.

Generated screenshots and contrast screening results are stored under ignored `.preview/`. The dark-text screen is a targeted regression check, not a complete accessibility certification.
