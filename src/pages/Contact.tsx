import { motion } from "framer-motion";
import { Mail, Phone, Linkedin, MapPin } from "lucide-react";
import Layout from "@/components/Layout";

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

const Contact = () => {
  return (
    <Layout>
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
              or how to build great SaaS products. Feel free to reach out.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <ContactCard
              icon={<Mail className="w-5 h-5" />}
              title="Email"
              value="dale.pjj@gmail.com"
              href="mailto:dale.pjj@gmail.com"
              delay={0.2}
            />
            <ContactCard
              icon={<Phone className="w-5 h-5" />}
              title="Phone"
              value="+44 7720 271 071"
              href="tel:+447720271071"
              delay={0.3}
            />
            <ContactCard
              icon={<Linkedin className="w-5 h-5" />}
              title="LinkedIn"
              value="/in/dalepjj"
              href="https://linkedin.com/in/dalepjj"
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

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-center p-8 bg-coral-light rounded-2xl"
          >
            <h2 className="font-serif text-2xl font-medium mb-3">Open to Opportunities</h2>
            <p className="body-text mb-6">
              Currently exploring Director and VP-level product leadership roles 
              in B2B SaaS, with a focus on AI, data, and platform strategy.
            </p>
            <a
              href="mailto:dale.pjj@gmail.com?subject=Let's%20Connect"
              className="inline-flex items-center gap-2 px-6 py-3 bg-coral text-primary-foreground rounded-full font-medium hover:bg-coral-hover transition-colors"
            >
              <Mail className="w-4 h-4" />
              Get in Touch
            </a>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
