import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <Layout>
      <SEO 
        title="Page Not Found" 
        description="The page you're looking for doesn't exist. Let's get you back on track."
        path={location.pathname}
      />
      <div className="content-container min-h-[calc(100vh-200px)] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-3 h-3 rounded-full bg-coral" />
          </div>
          <h1 className="font-serif text-7xl md:text-8xl font-medium text-coral mb-4">404</h1>
          <p className="font-serif text-2xl md:text-3xl mb-2">Off the beaten path</p>
          <p className="body-text mb-8 max-w-md mx-auto">
            Looks like this page went off-road. Let's get you back to familiar territory.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-primary-foreground rounded-full font-medium hover:bg-coral-hover transition-colors"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    </Layout>
  );
};

export default NotFound;
