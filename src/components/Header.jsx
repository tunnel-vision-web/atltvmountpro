
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useUI } from '@/contexts/UIContext';

const navItems = [
  { name: 'Home', path: '/' },
  { name: 'Services', path: '/services' },
  { name: 'About', path: '/about' },
  { name: 'Team', path: '/team' },
  { name: 'Testimonials', path: '/testimonials' },
  { name: 'Contact', path: '/contact' },
];

const Header = () => {
  const location = useLocation();
  const { openBookingModal } = useUI();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        isScrolled
          ? 'bg-gray-900/85 backdrop-blur-md border-b border-gray-700/50 py-3'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      {/* Full-width centering wrapper — always centers its contents */}
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-400 ${
            isScrolled ? 'w-full max-w-[980px]' : 'w-full max-w-[1140px]'
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="https://horizons-cdn.hostinger.com/10e32518-3a0b-422d-a971-66d579a3db35/47c7080c79518d5a6d915f8a78db18d6.png"
              alt="ATL TV Mount PRO"
              className={`transition-all duration-400 ${isScrolled ? 'h-8' : 'h-12'}`}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-7">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`transition-all duration-200 font-medium ${
                  isScrolled ? 'text-sm' : 'text-sm'
                } ${
                  location.pathname === item.path
                    ? 'text-primary'
                    : 'text-foreground hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href="tel:770-374-3203"
              className={`font-medium text-foreground hover:text-primary transition-colors duration-200 whitespace-nowrap ${
                isScrolled ? 'text-sm' : 'text-sm'
              }`}
            >
              770-374-3203
            </a>
            <Button
              onClick={openBookingModal}
              size={isScrolled ? 'sm' : 'default'}
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
            >
              Book Now
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
              <nav className="flex flex-col gap-6 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-lg font-medium transition-colors duration-200 ${
                      location.pathname === item.path
                        ? 'text-primary'
                        : 'text-foreground hover:text-primary'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <a
                  href="tel:770-374-3203"
                  className="text-lg font-medium text-foreground hover:text-primary transition-colors duration-200"
                >
                  770-374-3203
                </a>
                <Button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openBookingModal();
                  }}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
                >
                  Book Now
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
