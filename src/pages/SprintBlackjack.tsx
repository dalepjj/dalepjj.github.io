import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import BlackjackGame from "@/components/games/BlackjackGame";

const SprintBlackjack = () => {
  return (
    <>
      <SEO
        title="Sprint Blackjack | Dale Cheney"
        description="A Product Management themed Blackjack game. Build stakeholder confidence, avoid scope creep, and master the roadmap!"
      />
      <Layout>
        <section className="content-container py-12 md:py-16">
          <div className="text-center mb-8">
            <h1 className="section-title mb-4">Sprint Blackjack</h1>
            <p className="body-text max-w-xl mx-auto">
              Build stakeholder confidence by winning sprints against The Deadline.
              Reach 1,000 confidence to master the roadmap!
            </p>
          </div>

          <BlackjackGame />
        </section>
      </Layout>
    </>
  );
};

export default SprintBlackjack;
