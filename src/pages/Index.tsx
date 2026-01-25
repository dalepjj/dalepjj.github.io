import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import CircleButton from "@/components/CircleButton";
import SEO from "@/components/SEO";
import profilePhoto from "@/assets/profile-photo.jpg";

const Index = () => {
  return (
    <Layout>
      <SEO 
        title="Dale Jacobs - Product Leader & Design Thinker"
        description="SaaS Product Leader with 18+ years of experience building and scaling B2B platforms. Skilled in driving growth, defining product strategy, and leading high-performing teams."
        path="/"
      />
      <div className="content-container min-h-[calc(100vh-200px)] flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center py-12">
          {/* Profile Image */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="w-72 h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-full bg-gradient-to-br from-coral-light to-coral/30 flex items-center justify-center overflow-hidden">
              <img 
                src={profilePhoto} 
                alt="Dale Jacobs" 
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium tracking-tight mb-6">
                <span className="whitespace-nowrap">Product Leader,</span>
                <div className="mt-2">
                  <span className="italic">Design Thinker.</span>
                </div>
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="body-text max-w-md mx-auto lg:mx-0 mb-4">
                With 18+ years in B2B SaaS, I've learned that the best products come from deeply understanding users and relentlessly focusing on outcomes.
              </p>
              <p className="body-text max-w-md mx-auto lg:mx-0 mb-10">
                I help companies build platforms that scale, teams that thrive, and strategies that deliver real results.
              </p>
            </motion.div>

            {/* Circle Navigation Buttons */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
              <CircleButton to="/resume" label="Resume" delay={0.5} />
              <CircleButton to="/work" label="Work" delay={0.6} />
              <CircleButton to="/testimonials" label="Testimonials" delay={0.7} />
              <CircleButton to="/contact" label="Contact" delay={0.8} />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
