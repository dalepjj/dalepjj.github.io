import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import andrewPhoto from "@/assets/testimonial-andrew.jpg";
import charlesPhoto from "@/assets/testimonial-charles.jpg";

interface Testimonial {
  name: string;
  title: string;
  company: string;
  photo: string;
  quote: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Andrew Bartholomew",
    title: "Sr. Director, Digital Marketing and Demand Generation",
    company: "Digimarc",
    photo: andrewPhoto,
    quote: "Dale is a talented product leader, a clear and confident communicator, and someone who thrives in fast-moving, ambiguous environments. In my time working with Dale, he demonstrated a rare ability to turn messy feedback into focused, actionable direction, and proved to be an outstanding cross-functional partner—thoughtful, collaborative, and genuinely supportive of other teams. On top of that, he's just a good person: personable, positive, respectful, and super easy to work with."
  },
  {
    name: "Charles Adeeko",
    title: "Director, Quality Engineering",
    company: "EVRYTHNG & Digimarc",
    photo: charlesPhoto,
    quote: "Dale is a genuinely high-quality product leader. He's deeply trusted by the executive team and consistently takes ownership far beyond what you'd expect from a typical product role. His attention to detail, especially around design and product direction, sets a very high bar, and everything he delivers is done to an exceptional standard. Dale is highly communicative, relentlessly dependable, and always gives 110%. If I were building a top-tier team, he'd absolutely be in it."
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
        <h3 className="font-serif text-lg font-medium">{testimonial.name}</h3>
        <p className="text-sm text-coral">{testimonial.title}</p>
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
