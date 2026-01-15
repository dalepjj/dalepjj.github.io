import { Linkedin, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border mt-20">
      <div className="content-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-sm font-medium mb-2">Phone</h4>
            <a 
              href="tel:+447720271071" 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              +44 7720 271 071
            </a>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Email</h4>
            <a 
              href="mailto:dale.pjj@gmail.com" 
              className="text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              dale.pjj@gmail.com
            </a>
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Connect</h4>
            <a 
              href="https://linkedin.com/in/dalepjj" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1 text-sm"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          </div>
          
          <div className="md:text-right">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Dale Jacobs
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
