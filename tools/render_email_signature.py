"""Render the email sign-off GIF from the canonical signature (gos-wordmark.css).

Opens tools/email-signature.html in headless Chromium at 2x, pauses every CSS animation, seeks the
whole page to each frame time and screenshots the 254 x 36 capsule. One loop is one coin turn
(6.4 s), which is exactly two searchlight crossings, so the GIF repeats seamlessly. Frame 0 is the
still mark (coin square to the viewer, beam at rest): what a client that does not animate shows.

    python tools/render_email_signature.py gastevski-office-systems-v11.gif [--fps 25] [--width 230]

--width is the signature's width in CSS px inside the capsule (v10's G-to-S span was 230).
"""
import argparse
import io
import pathlib

from PIL import Image
from playwright.sync_api import sync_playwright

HERE = pathlib.Path(__file__).resolve().parent
LOOP_MS = 6400
COLORS = 64


def fit_font(page, width):
    """Size the signature by font-size only (the house rule) so it spans `width` CSS px."""
    return page.evaluate(
        """(target) => {
            const sig = document.querySelector('#capsule .gos-sig');
            let lo = 4, hi = 30;
            for (let i = 0; i < 40; i++) {
                const mid = (lo + hi) / 2;
                sig.style.fontSize = mid + 'px';
                const w = sig.getBoundingClientRect().width;
                if (w > target) hi = mid; else lo = mid;
            }
            sig.style.fontSize = lo + 'px';
            const r = sig.getBoundingClientRect();
            return {fontSize: lo, width: r.width, height: r.height};
        }""",
        width,
    )


def render(out, fps, width):
    frames = []
    step = 1000 / fps
    n = round(LOOP_MS / step)
    with sync_playwright() as p:
        # Playwright's own Chromium if installed, else the machine's Chrome or Edge.
        browser = None
        for channel in (None, "chrome", "msedge"):
            try:
                browser = p.chromium.launch(channel=channel) if channel else p.chromium.launch()
                break
            except Exception:
                continue
        if browser is None:
            raise SystemExit("no Chromium, Chrome or Edge for Playwright to drive")
        page = browser.new_page(viewport={"width": 254, "height": 36}, device_scale_factor=2)
        page.goto((HERE / "email-signature.html").as_uri())
        page.evaluate("document.fonts.ready")
        page.wait_for_function("document.fonts.check('700 10px Montserrat') && document.fonts.check('500 10px Montserrat')")
        page.wait_for_function("[...document.images].every(i => i.complete) && document.getAnimations().length > 0")
        # The coin face is a CSS background: wait until Chromium has decoded it.
        page.wait_for_timeout(800)
        fit = fit_font(page, width)
        count = page.evaluate("(() => { const a = document.getAnimations(); a.forEach(x => x.pause()); return a.length; })()")
        capsule = page.locator("#capsule")
        for i in range(n):
            t = i * step
            page.evaluate("(t) => document.getAnimations().forEach(a => { a.currentTime = t; })", t)
            png = capsule.screenshot(animations="allow")
            frames.append(Image.open(io.BytesIO(png)).convert("RGB"))
        browser.close()

    # One shared palette across the loop keeps the silver steady from frame to frame.
    strip = Image.new("RGB", (frames[0].width, frames[0].height * len(frames)))
    for k, f in enumerate(frames):
        strip.paste(f, (0, k * f.height))
    pal = strip.quantize(colors=COLORS, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    q = [f.quantize(palette=pal, dither=Image.Dither.NONE) for f in frames]
    q[0].save(out, save_all=True, append_images=q[1:], duration=round(step), loop=0,
              optimize=True, disposal=1)
    size = pathlib.Path(out).stat().st_size
    print(f"{out}: {len(q)} frames @ {round(step)} ms, {q[0].width}x{q[0].height}, "
          f"{size / 1024:.0f} KB, {count} animations, font {fit['fontSize']:.2f}px, "
          f"signature {fit['width']:.1f}x{fit['height']:.1f} CSS px")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--fps", type=float, default=25)
    ap.add_argument("--width", type=float, default=230)
    a = ap.parse_args()
    render(a.out, a.fps, a.width)
