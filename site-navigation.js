// Marks in-site link clicks so the home prompt can distinguish band-page navigation from external arrivals.
(() => {
  const internalNavigationKey = "foreignLogicInternalNavigation";

  const isSameSiteLink = (link) => {
    if (!link.href || link.hasAttribute("download")) {
      return false;
    }

    try {
      const targetUrl = new URL(link.href, window.location.href);
      const currentUrl = new URL(window.location.href);

      if (targetUrl.origin === currentUrl.origin && currentUrl.origin !== "null") {
        return true;
      }

      if (targetUrl.protocol === "file:" && currentUrl.protocol === "file:") {
        const currentFolder = currentUrl.pathname.replace(/\/[^/]*$/, "/");
        return targetUrl.pathname.startsWith(currentFolder);
      }
    } catch (error) {
      return false;
    }

    return false;
  };

  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");

    if (!link || !isSameSiteLink(link)) {
      return;
    }

    try {
      sessionStorage.setItem(internalNavigationKey, "true");
    } catch (error) {
      // Some browsers can block storage; referrer checks still handle normal hosted navigation.
    }
  });
})();
