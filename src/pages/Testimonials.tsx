import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import andrewPhoto from "@/assets/testimonial-andrew.jpg";
import charlesPhoto from "@/assets/testimonial-charles.jpg";
import bethPhoto from "@/assets/testimonial-beth.jpg";
import megPhoto from "@/assets/testimonial-meg.jpg";

interface Testimonial {
  name: string;
  title: string;
  company: string;
  photo: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Meg Rotondo",
    title: "VP, Product Operations",
    company: "Digimarc",
    photo: megPhoto,
    quote: "Dale is an exceptional product leader: strategic, technically sophisticated, and able to see the full picture while bringing clarity to complexity. He has a rare ability to understand diverse perspectives and guide teams toward alignment with consistent calm, insight, and empathy. Dale transformed how our company captured and prioritized requests, leveraging simple tools like Jira Product Discovery to streamline processes and create greater transparency. He excels at leading and inspiring globally distributed teams and navigating across cultures to help individuals reach their full potential. Beyond his product leadership, Dale is simply an excellent human: thoughtful, steady, and a true partner."
  },
  {
    name: "Andrew Bartholomew",
    title: "Sr. Director, Digital Marketing and Demand Generation",
    company: "Digimarc",
    photo: andrewPhoto,
    quote: "Dale is a talented product leader, a clear and confident communicator, and someone who thrives in fast-moving, ambiguous environments. In my time working with Dale, he demonstrated a rare ability to turn messy feedback into focused, actionable direction, and proved to be an outstanding cross-functional partner—thoughtful, collaborative, and genuinely supportive of other teams. On top of that, he's just a good person: personable, positive, respectful, and super easy to work with."
  },
  {
    name: "Beth Gantz",
    title: "Head of Global Sales",
    company: "Digimarc",
    photo: bethPhoto,
    quote: "Dale is one of the best product leaders I have worked with. He is an incredible listener and a true collaborator, always focused on what will make things clearer and easier for customers and for the teams supporting them. From a sales perspective, Dale was a fantastic partner. He worked closely with us to align product and sales, built tools that simplified conversations, and consistently thought through what customers actually needed to be successful. He had a strong ability to translate product strategy into something practical and usable in the field. Dale works extremely well in fast paced, challenging environments and brings calm, clarity, and focus even when things are moving quickly. He is also excellent in front of customers, with a strong presence, clear communication, and presentation skills that build trust. I would absolutely love to work with Dale again and would highly recommend him to any organization looking for a collaborative and effective product leader."
  },
  {
    name: "Charles Adeeko",
    title: "Director, Quality Engineering",
    company: "EVRYTHNG & Digimarc",
    photo: charlesPhoto,
    quote: "Dale is the kind of product leader that executive teams depend on, and for good reason. Having worked with him over several years, I've seen him take complete ownership of every project, delivering exceptional work that consistently exceeds expectations. His attention to detail is evident in everything he does, from the strategic roadmaps he designs to his clear, proactive communication with stakeholders. What truly sets Dale apart is his reliability. When he commits to something, it gets done to the highest standard. Executive teams trust him because he's earned it through consistent, quality execution. Simply put, if I were building a team to deliver a product, Dale would be on it every time. He's trustworthy, hardworking, and here's what makes him truly exceptional: he gives 110% every single day. Whether it's a major product launch or daily execution, he brings the same level of commitment year after year. That sustained drive to deliver excellence is incredibly rare."
  }
];

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
    className="bg-card border border-border rounded-lg p-6 md:p-8"
  >
    <div className="flex items-center gap-4 mb-6">
      <img
        src={testimonial.photo}
        alt={testimonial.name}
        className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover"
      />
      <div>
        <h3 className="font-serif text-lg font-medium text-coral">{testimonial.name}</h3>
        <p className="text-sm text-foreground font-serif">{testimonial.title}</p>
        <p className="text-sm text-muted-foreground">{testimonial.company}</p>
      </div>
    </div>
    <blockquote className="text-muted-foreground italic leading-relaxed">
      "{testimonial.quote}"
    </blockquote>
  </motion.div>
);

const Testimonials = () => {
  return (
    <Layout>
      <SEO
        title="Testimonials - Dale Jacobs"
        description="What colleagues and partners say about working with Dale Jacobs. Testimonials from product, engineering, and marketing leaders."
        path="/testimonials"
      />
      <div className="content-container py-12 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-medium tracking-tight mb-6">
            Testimonials
          </h1>
          <p className="body-text max-w-2xl">
            I'm fortunate to have worked with talented people who push me to be better. 
            Here's what some of them have to say.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={testimonial.name} testimonial={testimonial} index={index} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Testimonials;
