import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import { ArrowUpRight } from "lucide-react";

interface WorkItemProps {
  title: string;
  description: string;
  metrics?: string[];
  delay?: number;
  link?: string;
}

const WorkItem = ({ title, description, metrics, delay = 0, link }: WorkItemProps) => {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      className="group p-8 bg-card rounded-2xl border border-border hover:border-coral/30 hover:shadow-lg transition-all duration-300 h-full"
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

  if (link) {
    return (
      <a href={link} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }

  return content;
};

const Work = () => {
  const projects = [
    {
      title: "Product Digitisation at Unprecedented Scale",
      description:
        "Secured and delivered a landmark deal with Unilever for the world's largest implementation of digitised products using GS1 Digital Link. Delivered on our newly unified platform, this project enabled an always-on, always-relevant direct-to-consumer channel for global brands.",
      metrics: ["GS1 Digital Link", "Product Digitization", "CPG"],
      link: "https://www.digimarc.com/press-releases/2025/04/29/digimarc-enables-one-cpg-industrys-largest-global-rollouts-2d-barcodes",
    },
    {
      title: "Restoring Trust in Digital Content",
      description:
        "To combat deepfakes, this initiative focused on a tool allowing consumers to validate digital media authenticity. It delivered a 'stronger content credential' system anchoring provenance data to the asset, ensuring anyone can verify the source and history with absolute confidence.",
      metrics: ["AI", "C2PA", "Digital Watermarks"],
      link: "https://www.youtube.com/watch?v=U0UfWq9RxUM",
    },
    {
      title: "Data-Driven Product Authentication",
      description:
        "Launched a pioneering anti-counterfeiting solution assigning unique digital identities at the manufacturing source. Scaling to millions of events, the platform generated critical data insights to identify counterfeiting, parallel trade, and unauthorised production exposure, protecting brand integrity.",
      metrics: ["Mobile", "Apparel", "Brand Integrity"],
      link: "https://www.youtube.com/watch?v=y6ox1t4tLbM",
    },
    {
      title: "Circular Economy Innovation",
      description:
        "Led a proof-of-concept project with the World Economic Forum to authenticate apparel in the secondary market. By creating digital product passports that persist through resale, we promoted circularity and sustainable commerce practices for the future of fashion.",
      metrics: ["WEF", "Circular Economy", "Apparel"],
      link: "https://www.weforum.org/impact/strengthening-trust-in-second-hand-markets/",
    },
    {
      title: "Increasing Transparency in the Supply Chain",
      description:
        "Built an innovative traceability solution rooted in the GS1 EPCIS 2.0 industry standard. By shifting focus to interoperable event data rather than proprietary silos, we unlocked true end-to-end visibility, enabling real-time tracking across complex global supply chains.",
      metrics: ["Supply Chain", "Traceability", "EPCIS 2.0"],
      link: "https://medium.com/@dale.pjj/the-pathway-to-supply-chain-transparency-is-not-as-treacherous-as-you-might-think-22dec2cd5099",
    },
    {
      title: "Award-Winning Benefits Management",
      description:
        "At Asda, I introduced a benefits management framework to ensure projects captured their intended value, not just their delivery targets. This strategic shift toward measurable business impact was the key factor in being named the IIBA UK Business Analyst of the Year 2013.",
      metrics: ["Benefits", "Business Analysis", "IIBA"],
      link: "https://www.linkedin.com/pulse/from-business-change-product-management-analysis-journey-assistkd-gbyle/",
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
