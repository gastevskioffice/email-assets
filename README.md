# email-assets
Public branding assets for Gastevski Office Systems: the n8n email sign-off GIFs and the shared
app wordmark. Served two ways:

- `https://raw.githubusercontent.com/gastevskioffice/email-assets/main/<file>`: the email sign-off GIFs
  (the URL every sent email already uses).
- `https://gastevskioffice.github.io/email-assets/<file>`: GitHub Pages, for the stylesheet (raw
  GitHub serves it as plain text, which browsers refuse as CSS). About a 10-minute cache.

## The wordmark (apps)

- `gos-wordmark.css` is the one copy of the "Gastevski Office Systems" searchlight wordmark. Every app
  links it from GitHub Pages and never copies the block; edit it here and every app follows.
  The searchlight and coin shimmer are white in every app. Product accents do not tint the beam.
  Apps use `gos-wordmark--loop` on sign-in screens.
  The beam crosses every 3.2 s on every screen and never stops (`--gos-plays: infinite`, owner 2026-10-17).
- The same file carries the spinning G coin beside the wordmark (the `gos-sig` signature markup,
  documented at the end of the stylesheet) and its face image `gos-coin-g.png`. It is the Accounts app
  coin, now the one copy for every app. It is sized in em of the signature, so the coin is always 2.1x
  the wordmark's letter height; apps size the signature by font-size only and never restyle the coin.
  The complete signature renders at 90% of its previous size (owner, 2026-10-28).
- `gos-wordmark.js` is the behaviour (a faster sweep while a save is in flight, one quick sweep when it
  lands, then back to the loop, and the one clock that keeps the coin's turn in step with the beam). Each app serves its own identical copy of this file, because a script
  loaded from another site could run in every app. Change it here first, then copy it into the apps.

## The email sign-off

`gastevski-office-systems-v10.gif` is current: the G and the wordmark in the dark capsule, the beam
crossing at 25 fps (40 ms frames) in 2.2 s, then 1 s still (3.2 s loop). The first frame is the
still mark, which is what Outlook shows. Earlier versions stay because sent emails still load them.
