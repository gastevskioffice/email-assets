/* eslint-disable */
/* Gastevski Office Systems wordmark behaviour, v10 (2026-10-17).

   Canonical source: https://github.com/gastevskioffice/email-assets/blob/main/gos-wordmark.js
   Each app carries an identical copy (a script it serves itself, never loaded from another site),
   and the look lives in the hosted gos-wordmark.css. Change this file here first, then copy it.

   It sets the data-gos attribute that gos-wordmark.css styles:
   - once the opening sweeps finish, the mark rests ("rest");
   - pointer hover or keyboard focus on the mark, or on the link or button around it, replays one
     sweep ("once-a" / "once-b");
   - when a request other than GET/HEAD/OPTIONS has been in flight for 250 ms, every mark on the
     page sweeps until it returns ("busy"), then gives one quick sweep if it succeeded
     ("saved-a" / "saved-b") or simply settles if it failed.
   fetch and XMLHttpRequest are wrapped only to count requests: every call goes through unchanged
   and its result or error is returned untouched. Sign-in marks (--gos-plays: infinite) keep looping
   and are never put to rest.
   - the loop and the spinning G coin beside it run on one shared clock (see "One clock" below). */
(function () {
  'use strict';
  if (typeof window === 'undefined' || typeof document === 'undefined' || window.__gosWordmark) return;
  window.__gosWordmark = true;

  var SEL = '.gos-wordmark';
  var SKIP_URL = /\/auth\/v1\/token|\/_next\/static|google-analytics|googletagmanager|\/monitoring|\/beacon/i;
  var BUSY_AFTER_MS = 250;
  var inflight = 0;
  var busyTimer = 0;
  var busyShown = false;
  var flip = false;

  function each(fn) {
    var list = document.querySelectorAll(SEL);
    for (var i = 0; i < list.length; i++) fn(list[i]);
  }
  function looping(el) {
    try { return getComputedStyle(el).getPropertyValue('--gos-plays').trim() === 'infinite'; } catch (e) { return false; }
  }
  function settle(el) {
    if (looping(el)) el.removeAttribute('data-gos');
    else el.setAttribute('data-gos', 'rest');
  }
  function sweepOnce(el, kind) {
    flip = !flip;
    el.setAttribute('data-gos', kind + (flip ? '-a' : '-b'));
  }

  document.addEventListener('animationend', function (e) {
    var el = e.target;
    if (!el || !el.matches || !el.matches(SEL)) return;
    if (el.getAttribute('data-gos') === 'busy') return;
    settle(el);
  }, true);

  function replay(e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var el = t.closest(SEL);
    if (!el) {
      var host = t.closest('a, button');
      el = host && host.querySelector(SEL);
    }
    if (el && el.getAttribute('data-gos') === 'rest') sweepOnce(el, 'once');
  }
  document.addEventListener('pointerover', replay, true);
  document.addEventListener('focusin', replay, true);

  function counts(method, url) {
    var m = String(method || 'GET').toUpperCase();
    if (m === 'GET' || m === 'HEAD' || m === 'OPTIONS') return false;
    return !SKIP_URL.test(String(url || ''));
  }
  function begin() {
    inflight += 1;
    if (inflight === 1 && !busyShown) {
      clearTimeout(busyTimer);
      busyTimer = setTimeout(function () {
        if (!inflight) return;
        busyShown = true;
        each(function (el) { el.setAttribute('data-gos', 'busy'); });
      }, BUSY_AFTER_MS);
    }
  }
  function end(ok) {
    inflight = Math.max(0, inflight - 1);
    if (inflight) return;
    clearTimeout(busyTimer);
    if (!busyShown) return;
    busyShown = false;
    each(function (el) {
      if (ok) sweepOnce(el, 'saved');
      else settle(el);
    });
  }

  /* One clock (2026-10-26). The searchlight loop (gos-sweep, 3.2 s) and the spinning G coin beside
     it (gos-coin-*, one turn = two loops, 6.4 s) are pinned to whole multiples of 3.2 s on the
     document timeline, so every beam sets off as a coin face turns square to the viewer, on every
     screen, however late the coin or the mark was drawn. A mark that comes back to the loop after a
     save or a hover sweep waits off the text until the next beat rather than restarting out of
     step, so the beam never jumps. Only infinite gos-sweep / gos-coin-* animations are touched. */
  var BEAT = 3200;
  var CLOCKED = /^gos-(sweep$|coin-)/;
  var swept = typeof WeakSet === 'function' ? new WeakSet() : null;
  function clock() {
    if (!document.getAnimations || !document.timeline) return;
    var now = document.timeline.currentTime;
    if (now == null) return;
    var list = document.getAnimations();
    for (var i = 0; i < list.length; i++) {
      var a = list[i];
      if (a.__gosClock || !a.animationName || !CLOCKED.test(a.animationName)) continue;
      a.__gosClock = true;
      try {
        if (a.effect.getTiming().iterations !== Infinity) continue;
        var start = 0;
        var el = a.effect.target;
        if (a.animationName === 'gos-sweep' && swept && el) {
          if (swept.has(el)) start = Math.ceil(now / BEAT) * BEAT;
          swept.add(el);
        }
        a.startTime = start;
      } catch (e) { /* leave this one running as the browser started it */ }
    }
  }
  function concerns(n) {
    return n && n.nodeType === 1 && (n.matches('.gos-wordmark, .gos-coin') || !!n.querySelector('.gos-wordmark, .gos-coin'));
  }
  if (typeof MutationObserver === 'function') {
    new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var r = records[i];
        if (r.type === 'attributes' ? concerns(r.target) : Array.prototype.some.call(r.addedNodes, concerns)) {
          clock();
          return;
        }
      }
    }).observe(document.documentElement, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-gos'] });
  }
  document.addEventListener('animationstart', function (e) { if (CLOCKED.test(e.animationName)) clock(); }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', clock);
  else clock();

  var nativeFetch = window.fetch;
  if (typeof nativeFetch === 'function') {
    window.fetch = function (input, init) {
      var track = false;
      try {
        var method = (init && init.method) || (input && typeof input === 'object' && input.method) || 'GET';
        var url = typeof input === 'string' ? input : (input && (input.url || input.href)) || '';
        track = counts(method, url);
      } catch (e) { track = false; }
      var p = nativeFetch.apply(window, arguments);
      if (track) {
        begin();
        p.then(function (r) { end(!!(r && r.ok)); }, function () { end(false); });
      }
      return p;
    };
  }

  var XHR = window.XMLHttpRequest && window.XMLHttpRequest.prototype;
  if (XHR && XHR.open && XHR.send) {
    var nativeOpen = XHR.open;
    var nativeSend = XHR.send;
    XHR.open = function (method, url) {
      try { this.__gos = counts(method, url); } catch (e) { this.__gos = false; }
      return nativeOpen.apply(this, arguments);
    };
    XHR.send = function () {
      if (!this.__gos) return nativeSend.apply(this, arguments);
      var xhr = this;
      var done = false;
      begin();
      xhr.addEventListener('loadend', function () {
        if (done) return;
        done = true;
        end(xhr.status >= 200 && xhr.status < 300);
      });
      try {
        return nativeSend.apply(this, arguments);
      } catch (err) {
        if (!done) { done = true; end(false); }
        throw err;
      }
    };
  }
})();
