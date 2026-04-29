// frontend/src/components/Navbar.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useT } from "@/lib/i18n";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [hoveredHref, setHoveredHref] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const t = useT();

  const navItems = [
    {
      label:    t("nav", "browse_homes",                "Homes"),
      subtitle: t("nav", "browse_homes_sub",            "View available places"),
      href:     "/properties",
    },
    {
      label:    t("nav", "discover_services",           "Services"),
      subtitle: t("nav", "discover_services_sub",       "What we take care of"),
      href:     "/#services",
    },
    {
      label:    t("nav", "collect_with_lume",           "Investment"),
      subtitle: t("nav", "collect_with_lume_sub",       "Thinking beyond the present"),
      href:     "/#art-advisory",
    },
    {
      label:    t("nav", "about",                       "About us"),
      subtitle: t("nav", "about_sub",                   "The idea behind Lume"),
      href:     "/about",
    },
    {
      label:    t("nav", "request_private_access",      "Contact"),
      subtitle: t("nav", "request_private_access_sub",  "Get in touch"),
      href:     "/#private-access",
    },
  ];

  const scrollToHash = (hash: string) => {
    if (location.pathname === "/") {
      document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate(`/${hash}`);
    }
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("/#")) return;
    e.preventDefault();
    scrollToHash(href.slice(1));
  };

  const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("/#")) return;
    e.preventDefault();
    const hash = href.slice(1);
    setOpen(false);
    setTimeout(() => scrollToHash(hash), 300);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between h-16 md:h-28">

        {/* Logo */}
        <a href="/" className="flex items-center leading-none">
          <img
            src="/logo.png"
            alt="LUME by Mark"
            className="h-16 md:h-20 w-auto"
          />
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-10">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              onMouseEnter={() => setHoveredHref(item.href)}
              onMouseLeave={() => setHoveredHref(null)}
              className="relative block overflow-hidden h-9 group"
              style={{ minWidth: "max-content" }}
            >
              <motion.div
                animate={{ y: hoveredHref === item.href ? "-100%" : "0%" }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col"
              >
                <span className="flex items-center h-9 text-[11px] tracking-[0.22em] uppercase text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {item.label}
                </span>
                <span className="flex items-center h-9 text-[11px] italic font-serif tracking-wide text-foreground whitespace-nowrap">
                  {item.subtitle}
                </span>
              </motion.div>
            </a>
          ))}

          <LanguageSwitcher />
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-foreground"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-6 py-6 flex flex-col gap-6">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleMobileNavClick(e, item.href)}
                  className="flex flex-col gap-0.5"
                >
                  <span className="text-sm tracking-[0.2em] uppercase text-foreground">
                    {item.label}
                  </span>
                  <span className="text-xs italic font-serif text-muted-foreground">
                    {item.subtitle}
                  </span>
                </a>
              ))}
              <div className="pt-4 border-t border-border/50">
                <LanguageSwitcher variant="mobile" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;