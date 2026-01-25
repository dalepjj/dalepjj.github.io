import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface CircleButtonProps {
  to: string;
  label: string;
  variant?: "resume" | "work" | "contact" | "testimonials";
  delay?: number;
}

const CircleButton = ({ to, label, variant = "resume", delay = 0 }: CircleButtonProps) => {
  const baseClasses = "w-28 h-28 md:w-32 md:h-32 rounded-full flex items-center justify-center font-serif text-base md:text-lg transition-all duration-300 text-charcoal p-4";
  const variantClasses = {
    resume: "bg-[#F2E1DF] hover:brightness-95 hover:scale-105",
    work: "bg-[#F2E1DF] hover:brightness-95 hover:scale-105",
    contact: "bg-[#F2E1DF] hover:brightness-95 hover:scale-105",
    testimonials: "bg-[#F2E1DF] hover:brightness-95 hover:scale-105",
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
        aria-label={`Go to ${label} page`}
      >
        {label}
      </Link>
    </motion.div>
  );
};

export default CircleButton;
