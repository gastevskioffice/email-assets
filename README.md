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
- App headers keep **Gastevski Office Systems** on one line on the right at every width,
  aligned with the title's last text baseline. The wording determines the signature's height
  and baseline; the coin is anchored to its vertical centre inside the same signature, with
  its width and gap reserved there. Always position or move the complete `gos-sig`, never
  the coin or wording separately. Phone headers scale the complete signature
  together to fit beside the title. Use `gos-app-heading` around the title and signature,
  and `gos-app-title` on the title; do not add local wrapping or bottom-alignment overrides.
- `gos-wordmark.js` is the behaviour (a faster sweep while a save is in flight, one quick sweep when it
  lands, then back to the loop, and the one clock that keeps the coin's turn in step with the beam). Each app serves its own identical copy of this file, because a script
  loaded from another site could run in every app. Change it here first, then copy it into the apps.

## The email sign-off

`gastevski-office-systems-v11.gif` is current (owner, 2026-11-07): the app signature itself, the
spinning G coin beside the searchlight wordmark, in the dark capsule at 254 x 36 (drawn at 2x,
508 x 72). It is rendered from `gos-wordmark.css`, never drawn by hand:

    python tools/render_email_signature.py gastevski-office-systems-v<N>.gif

The script opens `tools/email-signature.html` (the `gos-sig` markup on the capsule, linking this
repository's stylesheet) in headless Chromium, pauses every animation and seeks frame by frame. One
loop is one 6.4 s coin turn, which is two 3.2 s beam crossings, at 25 fps (160 frames, 64 colours,
about 240 KB). Frame 0 is the still mark (coin square to the viewer, beam at rest), which is what a
client that does not animate GIFs shows. When the coin or the wordmark changes in the stylesheet,
re-render into the next version number and repoint the senders.

The emails reserve 254 x 36, so moving between versions is a file-name swap in each sender. Earlier
versions stay because sent emails still load them; v10 (the flat G, 2026-10-17) is the previous one.
