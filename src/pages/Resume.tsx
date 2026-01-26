import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";

interface ExperienceItemProps {
  period: string;
  title: string;
  company: string;
  description: string;
  delay?: number;
}

const ExperienceItem = ({ period, title, company, description, delay = 0 }: ExperienceItemProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    className="border-l-2 border-coral pl-6 py-4 -ml-px rounded-r-lg transition-all duration-200 hover:bg-coral-light/30 hover:border-coral-hover cursor-default"
  >
    <p className="text-sm text-muted-foreground mb-2">{period}</p>
    <h3 className="font-serif text-xl font-medium leading-tight">
      {title}, <span className="text-coral">{company}</span>
    </h3>
    <p className="body-text mt-3">{description}</p>
  </motion.div>
);

const Resume = () => {
  const experiences = [
    {
      period: "September 2025 – Present",
      title: "Senior Product Manager - AI and Data",
      company: "Loftware",
      description: "I'm currently architecting the AI and Data product strategy, establishing a unified data platform to power intelligence across our core product workflows. I also led the implementation of Pendo to create a continuous user feedback loop - using behavioural analytics to inform design improvements and help prioritise features on the roadmap.",
    },
    {
      period: "March 2022 – August 2025",
      title: "Director of Product Management",
      company: "Digimarc",
      description: "Following the acquisition of EVRYTHNG, I stepped up to lead the global product team and oversee our new unified platform. It was a massive integration effort - I'm especially proud that we launched our first combined product in just eight months and secured a landmark deal with Unilever for the world's largest deployment of GS1 Digital Link QR codes. Contributed to 18% ARR growth by leading strategic product initiatives, including the simplification of SaaS pricing to shorten deal cycles. Additionally, introduced self-service strategies that reduced onboarding time by 67%.",
    },
    {
      period: "January 2019 – March 2022",
      title: "Senior Product Manager",
      company: "EVRYTHNG (Acquired by Digimarc)",
      description: "Before the acquisition, I led the strategy for our anti-counterfeiting product, scaling it to 3 million authentication events. I also led a proof-of-concept project with the World Economic Forum to authenticate apparel in the secondary market, which was a great opportunity to promote circularity. My work building partnerships to integrate our data intelligence with marking tech was a key factor in Digimarc's decision to acquire the company.",
    },
    {
      period: "January 2017 – December 2018",
      title: "Senior Product Manager",
      company: "Sensormatic",
      description: "I led the critical transition of our RFID mobile and web solutions from on-premise to SaaS, a move that drastically accelerated time-to-value for our customers. I was also a vocal advocate for UX investment - securing dedicated design resources to drive usability improvements. Day-to-day, I served as Product Owner for two distributed scrum teams, ensuring engineering output stayed strictly aligned with business priorities.",
    },
    {
      period: "December 2014 – January 2017",
      title: "Business Solutions Manager",
      company: "Sensormatic",
      description: "I built and led the professional services business analysis team for Europe. I kept my hand in the details too - acting as lead analyst on global RFID implementations and crafting solution designs during the pre-sales process.",
    },
    {
      period: "May 2014 – December 2014",
      title: "Operational Transformation Consultant",
      company: "KPMG",
      description: "In this consulting role, I jumped into two major transformations. I project managed cross-functional teams for the relaunch of the Egg financial services brand, and served as Lead Consultant to deliver a new target operating model for Shawbrook Bank - streamlining their operations and defining their future structure.",
    },
    {
      period: "February 2012 – May 2014",
      title: "Business Analysis Manager",
      company: "Asda",
      description: "I focused heavily on strategy in this role, defining and launching the roadmap for Asda's RFID inventory management. Beyond the technology, I dedicated significant time to capability building - coaching and mentoring 40 Business Analysts on everything from business case development to benefits management.",
    },
    {
      period: "April 2011 – February 2012",
      title: "Business Analyst",
      company: "Republic Retail",
      description: "I drove the delivery of high-profile omnichannel initiatives, including the Click & Collect and In-Store Ordering programmes. To ensure we stayed user-centric, I established continuous product discovery channels - running frontline roundtables to verify that user feedback actually drove improvements for the Click & Collect service.",
    },
    {
      period: "September 2007 – April 2011",
      title: "Business Analyst (Graduate Programme)",
      company: "Asda",
      description: "I started my career on the Graduate Programme, conducting the deep-dive analysis needed for a major SAP payment systems cutover to mitigate transitional risk. I also cut my teeth on M&A integration, leading a critical HR system workstream that consolidated back-office support teams.",
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
    "Design Thinking",
    "Rapid Prototyping",
    "Pricing & Packaging",
    "Cross-functional Collaboration",
  ];

  const certifications = [
    "First Class BA (Hons) Business – Manchester Metropolitan University Business School",
    "Certified Scrum Product Owner (CSPO)",
    "PRINCE2 Practitioner",
    "GS1 Standards Professional",
    "Certified Pendo Administrator",
    "Business Analyst of the Year, awarded by the IIBA",
  ];

  return (
    <Layout>
      <SEO 
        title="Resume"
        description="Professional experience in B2B SaaS product management. 18+ years building and scaling platforms, leading teams, and driving growth."
        path="/resume"
      />
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
          <div className="space-y-14">
            {experiences.map((exp, index) => (
              <ExperienceItem
                key={index}
                {...exp}
                delay={0.3 + index * 0.1}
              />
            ))}
          </div>
        </section>

        {/* Core Skills */}
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
