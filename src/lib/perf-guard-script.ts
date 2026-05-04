/**
 * Guard against rare `performance.measure()` DOMExceptions (seen in some Chrome builds / dev overlays)
 * where an internal measure attempts to use a negative timestamp.
 *
 * This patch is intentionally tiny and defensive: we only swallow that specific failure mode.
 */
export const perfGuardScript = `
(function () {
  try {
    if (typeof window === "undefined") return;
    var p = window.performance;
    if (!p || typeof p.measure !== "function") return;
    var orig = p.measure.bind(p);
    p.measure = function () {
      try {
        return orig.apply(null, arguments);
      } catch (e) {
        var msg = (e && e.message) ? String(e.message) : "";
        if (msg.includes("negative time stamp")) return;
        throw e;
      }
    };
  } catch (_) {
    // ignore
  }
})();
`;

