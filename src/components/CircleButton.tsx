import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface CircleButtonProps {
  to: string;
  label: string;
  delay?: number;
}

const CircleButton = ({ to, label, delay = 0 }: CircleButtonProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link
        to={to}
        className="w-32 h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center font-serif text-lg transition-all duration-300 ease-out text-charcoal bg-transparent border-2 border-coral hover:bg-coral-light hover:scale-[1.02] hover:-translate-y-0.5"
        aria-label={`Go to ${label} page`}
      >
        {label}
      </Link>
    </motion.div>
  );
};

export default CircleButton;
