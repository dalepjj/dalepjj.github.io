import { motion } from "framer-motion";
import Layout from "@/components/Layout";

interface ExperienceItemProps {
  title: string;
  company: string;
  period: string;
  highlights: string[];
  delay?: number;
}

const ExperienceItem = ({ title, company, period, highlights, delay = 0 }: ExperienceItemProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="relative border-l-2 border-coral-light pl-6 pb-10 last:pb-0"
  >
    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-coral" />
    <div>
      <h3 className="font-serif text-xl font-medium leading-none">{title}</h3>
      <p className="text-coral font-medium mt-1">{company}</p>
      <p className="text-sm text-muted-foreground mt-1 mb-4">{period}</p>
      <ul className="space-y-2">
        {highlights.map((highlight, index) => (
          <li key={index} className="body-text text-sm flex gap-2">
            <span className="text-coral mt-1">•</span>
            <span>{highlight}</span>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);

const Resume = () => {
  const experiences = [
    {
      title: "Senior Product Manager - AI and Data",
      company: "Loftware",
      period: "September 2025 – Present",
      highlights: [
        "Architected Loftware's AI and Data strategy, establishing a unified data platform to power high-value, user-centric intelligence across core product workflows.",
        "Led the implementation of Pendo to establish a continuous user feedback loop, leveraging behavioral analytics to inform design improvements.",
      ],
    },
    {
      title: "Director of Product Management",
      company: "Digimarc",
      period: "March 2022 – August 2025",
      highlights: [
        "Led a global team of Product Managers overseeing a portfolio of enterprise SaaS products built on a unified platform.",
        "Unified EVRYTHNG and Digimarc technologies into a next-gen SaaS platform, launching the first product in 8 months.",
        "Secured a landmark deal with Unilever for the world's biggest implementation of digitized products with GS1 Digital Link QR codes.",
        "Drove portfolio prioritization achieving 18% YoY ARR growth in 2024.",
        "Implemented a self-service strategy reducing onboarding time by 67% and shortening sales cycles by 25%.",
      ],
    },
    {
      title: "Senior Product Manager",
      company: "EVRYTHNG (Acquired by Digimarc)",
      period: "January 2019 – March 2022",
      highlights: [
        "Led strategy and launch of a data-driven anti-counterfeiting product, scaling to 3M authentication events in 2022.",
        "Secured investment to extend the product's scope into unauthorized trade detection.",
        "Led a World Economic Forum proof-of-concept project to authenticate apparel in the secondary market.",
      ],
    },
    {
      title: "Senior Product Manager",
      company: "Sensormatic",
      period: "January 2017 – December 2018",
      highlights: [
        "Led transition of RFID mobile and web solutions from on-prem to SaaS, accelerating time-to-value.",
      ],
    },
    {
      title: "Business Solutions Manager",
      company: "Sensormatic",
      period: "December 2014 – January 2017",
      highlights: [
        "Built and led a professional services business analysis team for Europe.",
        "Acted as lead business analyst on global RFID implementations and pre-sales solution design.",
      ],
    },
    {
      title: "Operational Transformation Consultant",
      company: "KPMG",
      period: "May 2014 – December 2014",
      highlights: [
        "Project managed cross-functional work packages for the relaunch of the Egg financial services brand.",
        "Led Consultant in the successful delivery of a target operating model for Shawbrook Bank.",
      ],
    },
    {
      title: "Business Analysis Manager",
      company: "Asda",
      period: "February 2012 – May 2014",
      highlights: [
        "Defined and launched the RFID inventory management product roadmap and strategy for Asda.",
        "Coached and mentored 40 Business Analysts across business case development and benefits management.",
      ],
    },
  ];

  const skills = [
    "Product Strategy & Vision",
    "AI & Data Strategy",
    "Multi-product Platform Strategy",
    "Agile Delivery",
    "Team Leadership & Mentoring",
    "Go-to-market Execution",
    "User Research",
    "Continuous Discovery",
    "Rapid Prototyping",
    "Pricing & Packaging",
    "Cross-functional Collaboration",
  ];

  const certifications = [
    "First Class BA (Hons) Business – Manchester Metropolitan University",
    "Certified Pendo Administrator",
    "GS1 Standards Professional",
    "Certified Scrum Product Owner (CSPO)",
    "Business Analyst of the Year (IIBA)",
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
          <h1 className="section-title mb-4">Resume</h1>
          <p className="body-text max-w-2xl">
            SaaS Product Leader with 18+ years of experience building and scaling B2B platforms. 
            Skilled in driving growth, defining product strategy, and leading high-performing teams.
          </p>
        </motion.div>

        {/* Experience */}
        <section className="mb-16">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-serif font-medium mb-8"
          >
            Experience
          </motion.h2>
          <div>
            {experiences.map((exp, index) => (
              <ExperienceItem
                key={index}
                {...exp}
                delay={0.3 + index * 0.1}
              />
            ))}
          </div>
        </section>

        {/* Skills */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-serif font-medium mb-6">Core Skills</h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 bg-coral-light text-foreground rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </motion.section>

        {/* Education & Certifications */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <h2 className="text-2xl font-serif font-medium mb-6">Education & Certifications</h2>
          <ul className="space-y-3">
            {certifications.map((cert) => (
              <li key={cert} className="body-text flex gap-3">
                <span className="text-coral">•</span>
                <span>{cert}</span>
              </li>
            ))}
          </ul>
        </motion.section>
      </div>
    </Layout>
  );
};

export default Resume;
