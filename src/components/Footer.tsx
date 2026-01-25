import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border mt-20">
      <div className="content-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          <div>
            <h4 className="text-sm font-medium mb-2">Email</h4>
            <a 
              href="mailto:dale@dalejacobs.uk" 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              dale@dalejacobs.uk
            </a>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">LinkedIn</h4>
            <a 
              href="https://linkedin.com/in/dalepjj" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              /in/dalepjj
            </a>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Bluesky</h4>
            <a 
              href="https://bsky.app/profile/dalejacobs.uk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 text-sm"
            >
              @dalejacobs.uk
            </a>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Fun</h4>
            <Link 
              to="/play" 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Play Sprint Runner
            </Link>
          </div>
          
          <div className="md:text-right">
            <p className="text-sm text-muted-foreground mt-7 md:mt-7">
              © {new Date().getFullYear()} Dale Jacobs
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
