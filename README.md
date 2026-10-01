# gorippl

Standalone Angular storytelling site for the **Rippl** design system launch at Stolt-Nielsen.

## Run

```bash
npm start          # http://localhost:4200
npm run build      # dist/gorippl/browser
npm test           # unit tests (choreography + app smoke)
```

## Edit copy

All narrative text, tiles, and links live in [`src/app/content.ts`](src/app/content.ts). The story, voice rules and act-by-act plan the copy follows are in [`NARRATIVE.md`](NARRATIVE.md).

## Tokens

[`src/styles/rippl-tokens.css`](src/styles/rippl-tokens.css) is a verbatim copy of `@stolt/rippl` tokens. Re-copy from `Rippl/packages/rippl/styles/tokens.css` when the library updates.

## Brand mark

Official wordmark files live in [`public/brand/`](public/brand/):

- `ripplLogo.svg` — filled, white tip square
- `ripplLogoOutlined.svg` — outlined
- `ripplLogoRedDot.svg` — filled, Stolt-red tip square

The hero centre mark and `<app-wordmark>` use this geometry (not a display-font wordmark).

## Font

Body and UI type use the Rippl / system stack in `src/styles.scss`. Display headings still use the Atlas Grotesk Bold slot (stand-in: Inter). Drop licensed files into `public/fonts/` and update the `@font-face` in `src/styles.scss` if needed.
