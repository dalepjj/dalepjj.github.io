import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Header = () => {
  const location = useLocation();
  const isHome = location.pathname === "/";
  
  const navItems = [
    { name: "Resume", path: "/resume" },
    { name: "Work", path: "/work" },
    { name: "Play", path: "/play" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <motion.header 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm"
    >
      <div className="content-container py-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center gap-3 group"
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
          <span className="font-serif text-lg tracking-tight">Dale Jacobs</span>
        </Link>
        
        <nav className="flex items-center gap-3 sm:gap-6" aria-label="Main navigation">
          {navItems.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.name} className="flex items-center gap-3 sm:gap-6">
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
      </div>
    </motion.header>
  );
};

export default Header;
