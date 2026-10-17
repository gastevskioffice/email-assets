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
  Apps set only `--gos-glint` (their accent on the beam) and use `gos-wordmark--loop` on sign-in screens.
- `gos-wordmark.js` is the behaviour (rest after the opening sweeps, replay on hover or focus, sweep
  while a save is in flight). Each app serves its own identical copy of this file, because a script
  loaded from another site could run in every app. Change it here first, then copy it into the apps.

## The email sign-off

`gastevski-office-systems-v10.gif` is current: the G and the wordmark in the dark capsule, the beam
crossing at 25 fps (40 ms frames) in 2.2 s, then 1 s still (3.2 s loop). The first frame is the
still mark, which is what Outlook shows. Earlier versions stay because sent emails still load them.
