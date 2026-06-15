// frontend/src/components/ScrollToTop.tsx
//
// Resets the scroll position on route changes. React Router preserves the
// previous scroll offset across client-side navigations, so without this a
// link click would leave the user wherever they happened to be on the old
// page (and the browser's own "auto" scroll restoration could drop them at
// a seemingly random place when revisiting a page that was opened before).
//
// Behaviour:
//   • Plain route change (no hash) → jump to the top of the new page.
//   • Hash route change (e.g. /#services) → do nothing here; the destination
//     page scrolls its anchored section into view itself (see Index.tsx).
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  // Take scroll restoration into our own hands so the browser never restores a
  // stale offset from a previously-opened entry. Set once on mount.
  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  useEffect(() => {
    // Anchored sections are handled by the target page; don't fight them.
    if (hash) return;
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
};

export default ScrollToTop;
