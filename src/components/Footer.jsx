
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-muted text-muted-foreground border-t border-border">
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <img
              src="https://horizons-cdn.hostinger.com/10e32518-3a0b-422d-a971-66d579a3db35/47c7080c79518d5a6d915f8a78db18d6.png"
              alt="ATL TV Mount PRO"
              className="h-12 mb-4"
            />
            <p className="text-sm leading-relaxed">
              Professional TV mounting and handyman services in the Atlanta metro area
              and throughout Georgia.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <span className="font-semibold mb-4 block">Quick Links</span>
            <nav className="flex flex-col gap-2">
              <Link to="/" className="text-sm hover:text-primary transition-colors duration-200">
                Home
              </Link>
              <Link to="/services" className="text-sm hover:text-primary transition-colors duration-200">
                Services
              </Link>
              <Link to="/about" className="text-sm hover:text-primary transition-colors duration-200">
                About
              </Link>
              <Link to="/testimonials" className="text-sm hover:text-primary transition-colors duration-200">
                Testimonials
              </Link>
              <Link to="/contact" className="text-sm hover:text-primary transition-colors duration-200">
                Contact
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <span className="font-semibold mb-4 block">Contact</span>
            <div className="space-y-2 text-sm">
              <p>
                Phone:{' '}
                <a
                  href="tel:770-374-3203"
                  className="hover:text-primary transition-colors duration-200"
                >
                  770-374-3203
                </a>
              </p>
              <p>Service area: Atlanta metro area and Georgia</p>
              <p>Hours: Mon–Sat 8:00 AM – 6:00 PM</p>
              <div className="flex gap-4 mt-4">
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="hover:text-primary transition-colors duration-200"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2025 ATL TV Mount PRO. All rights reserved.</p>
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
