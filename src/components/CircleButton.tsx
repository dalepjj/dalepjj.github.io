import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface CircleButtonProps {
  to: string;
  label: string;
  variant?: "coral" | "coral-light" | "coral-muted";
  delay?: number;
}

const CircleButton = ({ to, label, variant = "coral-light", delay = 0 }: CircleButtonProps) => {
  const baseClasses = "w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center font-serif text-lg transition-all duration-300";
  const variantClasses = {
    coral: "bg-coral text-primary-foreground hover:bg-coral-hover hover:scale-105",
    "coral-light": "bg-coral-light text-foreground hover:bg-coral hover:text-primary-foreground hover:scale-105",
    "coral-muted": "bg-coral/40 text-foreground hover:bg-coral hover:text-primary-foreground hover:scale-105",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link
        to={to}
        className={`${baseClasses} ${variantClasses[variant]}`}
      >
        {label}
      </Link>
    </motion.div>
  );
};

export default CircleButton;
