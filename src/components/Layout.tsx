import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";
import SkipLink from "./SkipLink";
import PageTransition from "./PageTransition";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <PageTransition>
      <div className="page-container">
        <SkipLink />
        <Header />
        <main id="main-content" className="pt-24" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Layout;
