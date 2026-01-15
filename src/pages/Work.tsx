import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { ArrowUpRight } from "lucide-react";

interface WorkItemProps {
  title: string;
  description: string;
  metrics?: string[];
  delay?: number;
}

const WorkItem = ({ title, description, metrics, delay = 0 }: WorkItemProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
    className="group p-8 bg-card rounded-2xl border border-border hover:border-coral/30 hover:shadow-lg transition-all duration-300"
  >
    <div className="flex items-start justify-between mb-4">
      <h3 className="font-serif text-2xl font-medium group-hover:text-coral transition-colors">
        {title}
      </h3>
      <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-coral transition-colors" />
    </div>
    <p className="body-text mb-6">{description}</p>
    {metrics && (
      <div className="flex flex-wrap gap-3">
        {metrics.map((metric) => (
          <span
            key={metric}
            className="px-3 py-1.5 bg-coral-light text-foreground rounded-full text-sm font-medium"
          >
            {metric}
          </span>
        ))}
      </div>
    )}
  </motion.div>
);

const Work = () => {
  const projects = [
    {
      title: "Platform Unification at Digimarc",
      description:
        "Led the strategic integration of EVRYTHNG and Digimarc technologies into a next-generation SaaS platform. Delivered the first unified product in just 8 months, completing full platform unification in 18 months.",
      metrics: ["8-month launch", "18-month unification", "18% YoY ARR growth"],
    },
    {
      title: "Unilever Digital Product Implementation",
      description:
        "Secured and delivered a landmark deal with Unilever for the world's largest implementation of digitized products using GS1 Digital Link QR codes, enabling end-to-end product traceability.",
      metrics: ["World's largest implementation", "GS1 Digital Link", "Enterprise scale"],
    },
    {
      title: "Anti-Counterfeiting Product Launch",
      description:
        "Designed and launched a data-driven anti-counterfeiting solution, scaling to over 3 million authentication events. Secured additional investment to extend scope into unauthorized trade detection.",
      metrics: ["3M+ authentications", "Secured investment", "Brand protection"],
    },
    {
      title: "Self-Service Strategy",
      description:
        "Implemented a comprehensive self-service product strategy that dramatically reduced customer onboarding time and shortened sales cycles, enabling scalable growth.",
      metrics: ["67% faster onboarding", "25% shorter sales cycles", "Reduced CAC"],
    },
    {
      title: "World Economic Forum PoC",
      description:
        "Led a proof-of-concept project with the World Economic Forum to authenticate apparel in the secondary market, promoting circularity and sustainable commerce practices.",
      metrics: ["WEF partnership", "Circular economy", "Sustainable commerce"],
    },
    {
      title: "AI & Data Strategy at Loftware",
      description:
        "Architected the company's AI and Data strategy, establishing a unified data platform to power high-value, user-centric intelligence across core product workflows.",
      metrics: ["AI strategy", "Data platform", "User intelligence"],
    },
  ];

  return (
    <Layout>
      <div className="content-container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-16"
        >
          <h1 className="section-title mb-4">Work</h1>
          <p className="body-text max-w-2xl">
            A selection of impactful projects and initiatives that showcase my approach to 
            building products that scale and deliver measurable business outcomes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <WorkItem
              key={project.title}
              {...project}
              delay={0.2 + index * 0.1}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Work;
