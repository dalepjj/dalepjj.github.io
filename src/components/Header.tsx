import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Header = () => {
  const location = useLocation();
  
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
        >
          <span className="w-3 h-3 rounded-full bg-coral group-hover:scale-110 transition-transform duration-200" />
          <span className="font-serif text-lg tracking-tight">Dale Jacobs</span>
        </Link>
        
        <nav className="flex items-center gap-3 sm:gap-6">
          {navItems.map((item, index) => (
            <div key={item.name} className="flex items-center gap-3 sm:gap-6">
              <Link
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path 
                    ? "text-foreground font-medium" 
                    : ""
                }`}
              >
                {item.name}
              </Link>
              {index < navItems.length - 1 && <span className="nav-divider" />}
            </div>
          ))}
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;
