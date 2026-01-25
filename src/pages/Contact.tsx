import { motion } from "framer-motion";
import { Mail, Linkedin, MapPin } from "lucide-react";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

interface ContactCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  href: string;
  delay?: number;
}

const ContactCard = ({ icon, title, value, href, delay = 0 }: ContactCardProps) => (
  <motion.a
    href={href}
    target={href.startsWith("http") ? "_blank" : undefined}
    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="group flex items-center gap-4 p-6 bg-card rounded-xl border border-border hover:border-coral/50 hover:shadow-md transition-all duration-300"
  >
    <div className="w-12 h-12 rounded-full bg-coral-light flex items-center justify-center group-hover:bg-coral group-hover:text-primary-foreground transition-colors">
      {icon}
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="font-medium group-hover:text-coral transition-colors">{value}</p>
    </div>
  </motion.a>
);

const BlueskyIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z" />
  </svg>
);

const Contact = () => {
  return (
    <Layout>
      <SEO 
        title="Contact"
        description="Get in touch with Dale Jacobs. Let's discuss product strategy, leadership opportunities, or how to build great SaaS products."
        path="/contact"
      />
      <div className="content-container py-12">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h1 className="section-title mb-4">Let's Connect</h1>
            <p className="body-text">
              I'm always interested in discussing product strategy, leadership opportunities, 
              or how to build great SaaS products. Feel free to get in touch.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <ContactCard
              icon={<Mail className="w-5 h-5" />}
              title="Email"
              value="dale@dalejacobs.uk"
              href="mailto:dale@dalejacobs.uk"
              delay={0.2}
            />
            <ContactCard
              icon={<Linkedin className="w-5 h-5" />}
              title="LinkedIn"
              value="/in/dalepjj"
              href="https://linkedin.com/in/dalepjj"
              delay={0.3}
            />
            <ContactCard
              icon={<BlueskyIcon className="w-5 h-5" />}
              title="Bluesky"
              value="@dalejacobs.uk"
              href="https://bsky.app/profile/dalejacobs.uk"
              delay={0.4}
            />
            <ContactCard
              icon={<MapPin className="w-5 h-5" />}
              title="Location"
              value="Harrogate, UK"
              href="https://maps.google.com/?q=Harrogate,UK"
              delay={0.5}
            />
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Contact;
