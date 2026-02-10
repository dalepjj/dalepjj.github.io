import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import SprintRunner from "@/components/SprintRunner";

const PlaySprintRunner = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <SEO
        title="Sprint Runner"
        description="Navigate the chaos of product development in this arcade game."
        path="/play/sprint-runner"
      />
      <div className="pt-32 pb-20">
        <div className="content-container">
          <SprintRunner onBack={() => navigate("/play")} />
        </div>
      </div>
    </Layout>
  );
};

export default PlaySprintRunner;
