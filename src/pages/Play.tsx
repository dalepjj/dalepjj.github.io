import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SprintRunner from "@/components/SprintRunner";
import ScopeCreepSurvivor from "@/components/ScopeCreepSurvivor";

type View = "select" | "sprint" | "scope";

const Play = () => {
  const [view, setView] = useState<View>("select");

  return (
    <Layout>
      <SEO
        title="Play"
        description="Take a break and play some product management themed games."
        path="/play"
      />
      <div className="pt-32 pb-20">
        <div className="content-container">
          {view === "select" && (
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
                  className="border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:border-coral/40 transition-colors"
                >
                  <div className="w-12 h-12 mb-4 text-muted-foreground">
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
                  <p className="text-sm text-muted-foreground mb-4">
                    Navigate the chaos of product development. Jump over bugs and HiPPOs to acquire 1,000 users.
                  </p>
                  <Button onClick={() => setView("sprint")} className="bg-primary hover:bg-primary/90">
                    Play
                  </Button>
                </motion.div>

                {/* Scope Creep Survivor Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="border border-border rounded-2xl p-6 flex flex-col items-center text-center hover:border-coral/40 transition-colors"
                >
                  <div className="w-12 h-12 mb-4 text-coral">
                    <svg viewBox="0 0 40 40" className="w-full h-full">
                      <polygon
                        points="20,2 24,14 37,14 27,22 31,35 20,27 9,35 13,22 3,14 16,14"
                        fill="currentColor"
                        opacity="0.8"
                      />
                    </svg>
                  </div>
                  <h2 className="font-serif text-xl mb-2">Scope Creep Survivor</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Dodge feature requests and ship your MVP. Say NO to scope creep before it's too late!
                  </p>
                  <Button onClick={() => setView("scope")} className="bg-primary hover:bg-primary/90">
                    Play
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}

          {view === "sprint" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <SprintRunner onBack={() => setView("select")} />
            </motion.div>
          )}

          {view === "scope" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <ScopeCreepSurvivor onBack={() => setView("select")} />
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Play;
