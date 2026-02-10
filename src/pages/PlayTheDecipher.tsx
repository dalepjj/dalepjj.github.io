import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import SEO from "@/components/SEO";
import ScopeCreepSurvivor from "@/components/ScopeCreepSurvivor";

const PlayTheDecipher = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <SEO
        title="The Decipher"
        description="PMs love acronyms. Type the full definition before time runs out."
        path="/play/the-decipher"
      />
      <div className="pt-32 pb-20">
        <div className="content-container">
          <ScopeCreepSurvivor onBack={() => navigate("/play")} />
        </div>
      </div>
    </Layout>
  );
};

export default PlayTheDecipher;
