// frontend/src/components/CookieConsent.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useT } from "@/lib/i18n";
import { getCookie, setCookie, COOKIE_CONSENT_KEY } from "@/lib/cookies";
import { setAnalyticsConsent } from "@/lib/analytics";

const CookieConsent = () => {
  const t = useT();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Returning visitors who already accepted: re-grant analytics consent,
    // since the page defaults to "denied" on every load.
    if (getCookie(COOKIE_CONSENT_KEY) === "accepted") {
      setAnalyticsConsent(true);
    }

    // Small delay so it doesn't flash on page load
    const timer = setTimeout(() => {
      if (!getCookie(COOKIE_CONSENT_KEY)) {
        setVisible(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    setCookie(COOKIE_CONSENT_KEY, "accepted", 365);
    setAnalyticsConsent(true);
    setVisible(false);
  };

  const handleDecline = () => {
    setCookie(COOKIE_CONSENT_KEY, "declined", 30);
    setAnalyticsConsent(false);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none"
        >
          <div className="max-w-2xl mx-auto p-4">
            <div className="pointer-events-auto bg-foreground/95 backdrop-blur-md border border-white/10 px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 shadow-2xl">
              <p className="text-xs text-background/70 leading-relaxed tracking-wide flex-1">
                {t("cookies", "message", "We use cookies to remember your preferences and improve your experience.")}{" "}
                <a href="/privacy" className="underline underline-offset-2 text-background/90 hover:text-background transition-colors">
                  {t("cookies", "privacy_link", "Privacy Policy")}
                </a>
              </p>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={handleDecline}
                  className="text-xs tracking-[0.15em] uppercase text-background/50 hover:text-background/80 transition-colors py-1.5 px-3"
                >
                  {t("cookies", "decline", "Decline")}
                </button>
                <button
                  onClick={handleAccept}
                  className="text-xs tracking-[0.15em] uppercase bg-primary text-primary-foreground py-1.5 px-5 hover:bg-primary/90 transition-colors"
                >
                  {t("cookies", "accept", "Accept")}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
