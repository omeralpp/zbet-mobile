/**
 * Game Pulse viewport sizing.
 *
 * The provider frame is a self-sizing third-party widget behind an obfuscating
 * script loader, so its rendered height is only knowable at runtime from inside
 * the WebView. BTB previously gave it a fixed 232pt box, which left a large
 * empty region below the content in both live and pre-match states — the blank
 * area was owned by this constant, not by the provider.
 *
 * The frame now reports its own content height and the box follows it, clamped
 * so a broken or hostile measurement can never collapse the card to nothing or
 * let it grow without bound. Until a measurement arrives the previous fixed
 * height is used unchanged, so a frame that never reports still renders exactly
 * as before.
 */

/** Used until the frame reports, and whenever a measurement is unusable. */
export const defaultPulseHeight = 232;

/** Below this the tempo visualisation starts to clip. */
export const minPulseHeight = 96;

/** Never taller than the original fixed box; this fix only removes space. */
export const maxPulseHeight = 232;

/**
 * Small slack added to the reported height.
 *
 * Web content height rounds down and the frame carries a hairline border, so a
 * couple of points prevent a one-pixel scrollbar appearing inside the frame.
 */
export const pulseHeightSlack = 2;

/**
 * Resolves the viewport height from a frame-reported content height.
 *
 * Anything non-finite, non-positive or absurd falls back to the fixed height
 * rather than being clamped into range — a nonsense measurement is not evidence
 * about the content, so it must not influence layout at all.
 */
export function resolvePulseHeight(reportedHeight: unknown): number {
  const height =
    typeof reportedHeight === "number" ? reportedHeight : Number(reportedHeight);

  if (!Number.isFinite(height) || height <= 0) {
    return defaultPulseHeight;
  }

  const padded = Math.ceil(height) + pulseHeightSlack;
  if (padded >= maxPulseHeight) {
    return maxPulseHeight;
  }
  return Math.max(minPulseHeight, padded);
}

/**
 * Parses one `postMessage` payload from the frame.
 *
 * The frame is third-party, so its messages are treated as untrusted input:
 * only a bare numeric height or `{"pulseHeight": <number>}` is accepted, and
 * anything else yields null so the caller leaves the current height alone.
 */
export function parsePulseHeightMessage(data: unknown): number | null {
  if (typeof data !== "string" || data.length > 200) {
    return null;
  }

  const trimmed = data.trim();
  if (/^\d+(\.\d+)?$/.test(trimmed)) {
    const value = Number(trimmed);
    return Number.isFinite(value) && value > 0 ? value : null;
  }

  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const value = (parsed as { pulseHeight?: unknown }).pulseHeight;
      const height = typeof value === "number" ? value : Number(value);
      return Number.isFinite(height) && height > 0 ? height : null;
    }
  } catch {
    return null;
  }
  return null;
}

/**
 * Script injected into the frame to report its content height.
 *
 * Measurement only — it reads layout and posts a number back. It does not read
 * frame content, cookies or storage, and sends nothing outward.
 *
 * `ResizeObserver` covers the widget swapping between its pre-match panel and
 * the live tempo view; the interval is a cheap backstop for browsers where the
 * observer never fires, and it stops once the height settles.
 *
 * It measures the widget root rather than the document, because the frame's
 * content fills its container: measuring the document would just report back
 * the height BTB already set, and the card could never shrink.
 */
export const pulseHeightProbe = `(function () {
  var last = 0;
  var stable = 0;
  var timer = null;

  function contentHeight() {
    // Measure the widget's own root, never the document.
    //
    // The frame's content is styled to fill its container, so
    // document.scrollHeight simply echoes back whatever height BTB currently
    // gives the box. Measuring that would form a feedback loop where the card
    // can never shrink below its present size. The widget root sizes to its
    // own content, so it is the only honest signal here.
    var node = document.getElementById('sr-widget');
    if (!node) { return 0; }
    var rect = node.getBoundingClientRect();
    return Math.max(node.scrollHeight || 0, Math.ceil(rect.height || 0));
  }

  function report() {
    var height = contentHeight();
    // Nothing rendered yet: stay silent so the card keeps its current height
    // instead of collapsing and springing back.
    if (!height) { return; }
    if (height === last) {
      stable += 1;
      if (stable > 20 && timer) { clearInterval(timer); timer = null; }
      return;
    }
    stable = 0;
    last = height;
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(String(height));
    }
  }

  timer = setInterval(report, 400);
  if (window.ResizeObserver) {
    try {
      var target = document.getElementById('sr-widget') || document.body;
      if (target) { new ResizeObserver(report).observe(target); }
    } catch (e) {}
  }
  window.addEventListener('load', report);
  report();
})();
true;`;
