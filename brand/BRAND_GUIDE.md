# FirstIn Brand Identity System

## The First Mark

FirstIn is a proof-of-discovery protocol: it gives creators a place to recognize the people who supported them earliest. The identity makes that recognition feel durable and human. The mark combines an architectural **F** with three horizontal strokes that suggest a record or tally; the gold seal dot identifies the moment of discovery. It stays legible as a small app icon and can be used alone, in a round seal, or beside the FirstIn wordmark.

**Positioning line:** Discovery, made visible.  
**Supporting line:** Proof of discovery, on Monad.  
**Campaign line:** Be first. Be known.

## Design rationale

The identity joins editorial warmth with the precision of an onchain record. The letterform is built from simple, sturdy geometry so it feels dependable rather than tied to a passing crypto aesthetic. The seal gives a creator’s early community a recognizable emblem. Parchment and ink provide warmth and strong contrast; restrained gold marks the first moment; teal signals creator activity and support. The result positions FirstIn as a considered creator protocol, not a speculative token brand.

## Logo use

- Use the color mark on parchment or another quiet, light background. Use the on-dark variant on ink backgrounds.
- Use the monochrome variants when a single-color reproduction is required. Reserve single gold for large, high-contrast applications.
- The round seal is suited to avatars, badges, and stamps. The simplified favicon is designed for browser tabs and tiny contexts.
- Keep clear space around the symbol equal to the height of the gold dot. Do not stretch, rotate, outline, add shadows, or change the spacing between the mark and wordmark.
- For sizes below 24 px, prefer the simplified favicon or symbol without a wordmark.

## Color palette

| Name | Hex | Use |
| --- | --- | --- |
| Archive Ink | `#141210` | Wordmarks, navigation, primary actions |
| Warm Parchment | `#F7F2E7` | Main canvas and light logo ground |
| Raised Paper | `#FBF8F2` | Cards and inset surfaces |
| Discovery Gold | `#C8962F` | Seal dot, emphasis, progress |
| Archive Teal | `#1E5B52` | Support actions and active states |
| Teal Wash | `#DCE9E6` | Soft teal surfaces |
| Field Gray | `#8A8277` | Secondary labels and supporting text |

Use gold as an accent rather than a large field color. Keep text on gold dark for contrast.

## Typography

- **Display:** Fraunces for editorial campaign headlines and large storytelling moments.
- **Product headings and wordmark pairing:** Space Grotesk, semibold.
- **Interface copy:** Inter, regular to semibold.
- **Onchain details and labels:** IBM Plex Mono, used sparingly for addresses, counts, and metadata.

The app uses system fallbacks so the interface remains fast and reliable when optional web fonts are unavailable. The SVG mockups specify the preferred families and fallbacks.

## Voice

Write with confidence, warmth, and specificity. Speak about recognition, participation, creators, and the people who arrived early. Explain revenue mechanics plainly. Do not imply guaranteed returns, investment upside, or financial performance. Where an illustrative mockup shows a badge serial, name, address, or balance, label it sample or illustrative data: the current app does not assign badge serial numbers.

## Product application

The identity is applied to the shared navigation, factory dashboard, creator profile, badge claim affordance, tip interface, favicon, app icons, manifest, and social preview metadata. It preserves the existing contract actions and transaction flow. It does not change smart-contract behavior.

## Files

- `assets/svg/symbol/`: full-color, monochrome, single-color, and seal marks.
- `assets/svg/lockups/`: horizontal and stacked logo lockups.
- `assets/svg/favicon/`: simplified favicon source.
- `assets/mockups/`: editable SVG concept scenes for product, badge, social, print, and environmental applications.
- `exports/mockups/`: PNG renders of each SVG mockup.
- `exports/png/`: raster symbol exports at common sizes.
- `exports/favicon.ico`: multi-resolution browser favicon.
- `scripts/export-assets.mjs`: rebuilds all generated brand assets and public icons.
- `../public/brand/`, `../public/icons/`, `../public/og/`: assets consumed by the live web app.

Mockup scenes are clean vector concept boards, not photographs of manufactured objects or existing retail locations. They are designed to communicate how the visual system could extend into those contexts.

## Rebuild

Run `npm run brand:build` from the repository root. The script regenerates SVG masters, PNG exports, ICO, PWA icons, manifest, and social preview.
