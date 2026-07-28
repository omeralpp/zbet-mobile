export const fioriShellFocusScript = `
(function () {
  var installedKey = "__btbMobileNextShellFocusInstalled";
  var hideKey = "__btbMobileNextHideShell";
  var timersKey = "__btbMobileNextShellTimers";

  function applyHidden(renderer) {
    if (renderer && typeof renderer.setHeaderVisibility === "function") {
      renderer.setHeaderVisibility(false, true);
      return true;
    }
    return false;
  }

  function hideShell() {
    try {
      var container =
        window.sap &&
        window.sap.ushell &&
        window.sap.ushell.Container;
      if (!container || typeof container.getRenderer !== "function") {
        return false;
      }

      var renderer = container.getRenderer("fiori2");
      if (renderer && typeof renderer.then === "function") {
        renderer.then(applyHidden, function () {});
        return true;
      }
      return applyHidden(renderer);
    } catch (error) {
      return false;
    }
  }

  function scheduleHide() {
    var previous = window[timersKey] || [];
    previous.forEach(function (timer) {
      window.clearTimeout(timer);
    });
    window[timersKey] = [0, 250, 800, 1800].map(function (delay) {
      return window.setTimeout(hideShell, delay);
    });
  }

  window[hideKey] = hideShell;
  if (window[installedKey]) {
    scheduleHide();
    return;
  }

  window[installedKey] = true;
  window.addEventListener("hashchange", scheduleHide);
  window.addEventListener("pageshow", scheduleHide);
  window.addEventListener("popstate", scheduleHide);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) {
      scheduleHide();
    }
  });
  window.setInterval(function () {
    if (!document.hidden) {
      hideShell();
    }
  }, 2000);
  scheduleHide();
})();
true;
`;
