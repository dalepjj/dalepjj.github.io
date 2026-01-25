import { useState, Fragment } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Menu, Gamepad2 } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  
  const navItems = [
    { name: "Resume", path: "/resume" },
    { name: "Work", path: "/work" },
    { name: "Testimonials", path: "/testimonials" },
    { name: "Contact", path: "/contact" },
  ];

  const mobileNavItems = [
    { name: "Dale Jacobs", path: "/" },
    ...navItems,
    { name: "Play", path: "/play" },
  ];

  return (
    <motion.header 
      initial={isMobile ? false : { opacity: 0, y: -10 }}
      animate={isMobile ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm"
    >
      <div className="content-container py-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-2 group"
          aria-label="Dale Jacobs - Home"
          aria-current={isHome ? "page" : undefined}
        >
          <span 
            className={`w-3 h-3 rounded-full transition-all duration-200 group-hover:scale-110 ${
              isHome 
                ? "bg-coral" 
                : "border-2 border-coral bg-transparent group-hover:bg-coral/20"
            }`} 
          />
          <span className="font-serif text-lg tracking-tight whitespace-nowrap">Dale Jacobs</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.name} className="flex items-center gap-6">
                <Link
                  to={item.path}
                  className={`nav-link relative ${isActive ? "text-foreground font-medium" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.name}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-coral rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
                {index < navItems.length - 1 && <span className="nav-divider" />}
              </div>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <button 
              className="p-2 -mr-2 text-foreground/80 hover:text-foreground transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] pt-16">
            <nav className="flex flex-col gap-6" aria-label="Mobile navigation">
              {mobileNavItems.map((item) => {
                const isActive = location.pathname === item.path;
                const isHomeLink = item.path === "/";
                const isPlayLink = item.path === "/play";
                return (
                  <Fragment key={item.name}>
                    {isPlayLink && (
                      <div className="border-t border-border my-2" />
                    )}
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`text-lg flex items-center gap-3 transition-colors ${
                        isHomeLink 
                          ? "font-serif text-foreground" 
                          : isPlayLink
                            ? "italic text-muted-foreground hover:text-foreground"
                            : isActive 
                              ? "text-foreground" 
                              : "text-muted-foreground hover:text-foreground"
                      }`}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {isHomeLink && (
                        <span 
                          className={`w-2 h-2 rounded-full transition-all ${
                            isActive ? "bg-coral" : "border-2 border-coral bg-transparent"
                          }`} 
                        />
                      )}
                      {item.name}
                      {isPlayLink && <Gamepad2 className="w-5 h-5" />}
                    </Link>
                  </Fragment>
                );
              })}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </motion.header>
  );
};

export default Header;
