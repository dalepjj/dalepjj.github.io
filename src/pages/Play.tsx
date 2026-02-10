import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Keyboard } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const Play = () => {
  return (
    <Layout>
      <SEO
        title="Play"
        description="Take a break and play some product management themed games."
        path="/play"
      />
      <div className="pt-32 pb-20">
        <div className="content-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-10">
              <h1 className="section-title mb-4">Games</h1>
              <p className="body-text max-w-xl mx-auto">
                Take a break from the grind with some product management themed arcade games.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              {/* Sprint Runner Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link
                  to="/play/sprint-runner"
                  className="border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:border-coral/40 transition-colors block"
                >
                  <div className="w-12 h-12 mb-4 text-coral">
                    <svg viewBox="0 0 40 40" className="w-full h-full">
                      <circle cx="20" cy="8" r="6" fill="currentColor" />
                      <line x1="20" y1="14" x2="20" y2="26" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      <line x1="20" y1="18" x2="14" y2="24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="20" y1="18" x2="26" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="20" y1="26" x2="14" y2="38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                      <line x1="20" y1="26" x2="26" y2="36" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h2 className="font-serif text-xl mb-2">Sprint Runner</h2>
                  <p className="text-sm text-muted-foreground">
                    Navigate the chaos of product development.
                  </p>
                </Link>
              </motion.div>

              {/* The Decipher Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link
                  to="/play/the-decipher"
                  className="border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:border-coral/40 transition-colors block"
                >
                  <div className="w-12 h-12 mb-4 text-coral flex items-center justify-center">
                    <Keyboard size={32} />
                  </div>
                  <h2 className="font-serif text-xl mb-2">The Decipher</h2>
                  <p className="text-sm text-muted-foreground">
                    Master the acronyms and secure your promotion.
                  </p>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Play;
