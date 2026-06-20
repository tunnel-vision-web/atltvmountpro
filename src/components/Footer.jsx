import React from "react";
import { Link } from "react-router-dom";
import { Globe, Phone, Mail } from "lucide-react";
import { useCMS } from "@/hooks/useCMS";

const Footer = () => {
  const { data: footerData } = useCMS("footer");

  const brandDescription = footerData.brandDescription || "Professional TV mounting and handyman services in the Atlanta metro area and Georgia.";
  const phone = footerData.phone || "770-374-3203";
  const serviceArea = footerData.serviceArea || "Atlanta metro area and Georgia";
  const hours = footerData.hours || "Mon–Sat 8:00 AM – 7:00 PM";
  const email = footerData.email || "info@atltvmountpro.com";
  const copyrightText = footerData.copyrightText || "© 2025 Atlanta TV Mount PRO. All rights reserved.";

  return (
    <footer className="bg-muted text-muted-foreground border-t border-border">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center text-center">
            <img
              src="/images/logo/logo-footer.png"
              alt="Atlanta TV Mount Pro"
              className="h-12 mb-4"
            />
            <div 
              className="text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: brandDescription }}
            />
          </div>

          {/* Quick links */}
          <div>
            <span className="font-semibold mb-4 block">Quick Links</span>
            <nav className="flex flex-col gap-2">
              <Link
                to="/"
                className="text-sm hover:text-primary transition-colors duration-200"
              >
                Home
              </Link>
              <Link
                to="/services"
                className="text-sm hover:text-primary transition-colors duration-200"
              >
                Services
              </Link>
              <Link
                to="/about"
                className="text-sm hover:text-primary transition-colors duration-200"
              >
                About
              </Link>
              <Link
                to="/testimonials"
                className="text-sm hover:text-primary transition-colors duration-200"
              >
                Testimonials
              </Link>
              <Link
                to="/contact"
                className="text-sm hover:text-primary transition-colors duration-200"
              >
                Contact
              </Link>
              <Link
                to="/join"
                className="text-sm hover:text-primary transition-colors duration-200"
              >
                Become a Tech
              </Link>
              <Link
                to="/apps/tech"
                className="text-sm hover:text-primary transition-colors duration-200"
              >
                Tech App (Mock)
              </Link>
              <Link
                to="/apps/customer"
                className="text-sm hover:text-primary transition-colors duration-200"
              >
                Customer App (Mock)
              </Link>
              <Link
                to="/support"
                className="text-sm hover:text-primary transition-colors duration-200"
              >
                Support & Claims
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <span className="font-semibold mb-4 block">Contact</span>
            <div className="space-y-2 text-sm">
              <p>
                Phone:{" "}
                <a
                  href={`tel:${phone}`}
                  className="hover:text-primary transition-colors duration-200"
                >
                  {phone}
                </a>
              </p>
              <p>Service area: {serviceArea}</p>
              <p>Hours: {hours}</p>
              <div className="flex gap-4 mt-4">
                <a
                  href="/"
                  className="hover:text-primary transition-colors duration-200"
                  aria-label="Website"
                >
                  <Globe className="w-5 h-5" />
                </a>
                <a
                  href={`tel:${phone}`}
                  className="hover:text-primary transition-colors duration-200"
                  aria-label="Phone"
                >
                  <Phone className="w-5 h-5" />
                </a>
                <a
                  href={`mailto:${email}`}
                  className="hover:text-primary transition-colors duration-200"
                  aria-label="Email"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            {copyrightText}
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              to="/privacy-policy"
              className="hover:text-primary transition-colors duration-200"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms-of-service"
              className="hover:text-primary transition-colors duration-200"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
