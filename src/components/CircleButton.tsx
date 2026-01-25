import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Briefcase, Quote, Mail } from "lucide-react";

interface CircleButtonProps {
  to: string;
  label: string;
  variant?: "resume" | "work" | "contact" | "testimonials";
  delay?: number;
}

const CircleButton = ({ to, label, variant = "resume", delay = 0 }: CircleButtonProps) => {
  const baseClasses = "w-32 h-32 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center font-serif text-lg transition-all duration-300 ease-out text-charcoal backdrop-blur-md bg-white/40 border border-white/60 shadow-lg shadow-black/5";
  
  const variantClasses = {
    resume: "hover:bg-[#F5D0CE]/50 hover:border-[#E8A5A0]/40 hover:shadow-xl hover:shadow-[#E8A5A0]/20 hover:scale-105 hover:-translate-y-1",
    work: "hover:bg-[#D4E5D8]/50 hover:border-[#A8CEB4]/40 hover:shadow-xl hover:shadow-[#A8CEB4]/20 hover:scale-105 hover:-translate-y-1",
    testimonials: "hover:bg-[#E5D8EB]/50 hover:border-[#C9B3D6]/40 hover:shadow-xl hover:shadow-[#C9B3D6]/20 hover:scale-105 hover:-translate-y-1",
    contact: "hover:bg-[#D4E0EB]/50 hover:border-[#A8C4D9]/40 hover:shadow-xl hover:shadow-[#A8C4D9]/20 hover:scale-105 hover:-translate-y-1",
  };

  const icons = {
    resume: FileText,
    work: Briefcase,
    testimonials: Quote,
    contact: Mail,
  };

  const Icon = icons[variant];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <Link
        to={to}
        className={`${baseClasses} ${variantClasses[variant]} group`}
        aria-label={`Go to ${label} page`}
      >
        <Icon className="w-5 h-5 mb-1.5 opacity-70 group-hover:opacity-100 transition-opacity" />
        {label}
      </Link>
    </motion.div>
  );
};

export default CircleButton;
