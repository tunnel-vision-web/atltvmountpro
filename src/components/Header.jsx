import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, LogIn, User, ChevronDown } from "lucide-react";
import { useUI } from "@/contexts/UIContext";
import { useClientAuth } from "@/contexts/ClientAuthContext";

const navItems = [
  { name: "Home", path: "/" },
  { name: "Services", path: "/services" },
  { name: "Projects", path: "/projects" },
  { name: "Store", path: "/store" },
  { name: "About", path: "/about" },
  {
    name: "Team",
    path: "/team",
    children: [
      { name: "Our Team", path: "/team" },
      { name: "Become a Tech", path: "/join" }
    ]
  },
  {
    name: "Help",
    children: [
      { name: "Blog", path: "/blog" },
      { name: "Support & Claims", path: "/support" }
    ]
  },
  { name: "Contact", path: "/contact" }
];

const Header = () => {
  const location = useLocation();
  const { openBookingModal, openAuthModal } = useUI();
  const { user, isAuthenticated, logout, isCustomer } = useClientAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-400 ${
        isScrolled
          ? "bg-gray-900/85 backdrop-blur-md border-b border-gray-700/50 py-3"
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      {/* Full-width centering wrapper — always centers its contents */}
      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-400 ${
            isScrolled ? "w-full max-w-[980px]" : "w-full max-w-[1140px]"
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <img
              src="/images/logo/logo.png"
              alt="Atlanta TV Mount Pro"
              className={`transition-all duration-400 ${isScrolled ? "h-11" : "h-16"}`}
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-7">
            {navItems.map((item) => (
              item.children ? (
                <div key={item.name} className="relative group py-2">
                  <button className="flex items-center gap-1 transition-all duration-200 font-medium text-sm text-foreground hover:text-primary cursor-pointer">
                    {item.name}
                    <ChevronDown size={14} className="transition-transform duration-200 group-hover:rotate-180 text-muted-foreground/80 group-hover:text-primary" />
                  </button>
                  <div className="absolute left-0 mt-2 w-48 rounded-xl bg-card border border-border shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.path}
                        to={child.path}
                        className={`block px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
                          location.pathname === child.path
                            ? "text-primary bg-primary/5"
                            : "text-muted-foreground hover:text-primary hover:bg-muted/50"
                        }`}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`transition-all duration-200 font-medium text-sm ${
                    location.pathname === item.path
                      ? "text-primary"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || "Profile"}
                      className="w-6 h-6 rounded-full object-cover border border-primary/20"
                    />
                  ) : (
                    <User size={16} />
                  )}
                  {user?.name || user?.email}
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-end">
                <Button
                  onClick={() => openAuthModal("login")}
                  size={isScrolled ? "sm" : "sm"}
                  variant="outline"
                  className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200 active:scale-[0.98]"
                >
                  <LogIn size={14} className="mr-1" />
                  Log In
                </Button>
                <button
                  onClick={() => openAuthModal("chooseType")}
                  className="text-xs text-muted-foreground hover:text-primary transition-colors mt-0.5"
                >
                  Sign up
                </button>
              </div>
            )}
            <Button
              onClick={openBookingModal}
              size={isScrolled ? "sm" : "default"}
              className="bg-primary hover:bg-primary/90 text-primary-foreground transition-all duration-200 active:scale-[0.98]"
            >
              Book Now
            </Button>
          </div>

          {/* Mobile Hamburger */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="lg:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] lg:hidden">
              <nav className="flex flex-col gap-5 mt-8">
                {navItems.map((item) => (
                  item.children ? (
                    <div key={item.name} className="space-y-2">
                      <span className="text-sm font-bold text-muted-foreground block uppercase tracking-wider">{item.name}</span>
                      <div className="pl-3 flex flex-col gap-2.5 border-l border-border">
                        {item.children.map((child) => (
                          <Link
                            key={child.path}
                            to={child.path}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`text-base font-semibold transition-colors duration-200 ${
                              location.pathname === child.path
                                ? "text-primary"
                                : "text-foreground hover:text-primary"
                            }`}
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg font-medium transition-colors duration-200 ${
                        location.pathname === item.path
                          ? "text-primary"
                          : "text-foreground hover:text-primary"
                      }`}
                    >
                      {item.name}
                    </Link>
                  )
                ))}
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-lg font-medium text-primary flex items-center gap-2"
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name || "Profile"}
                          className="w-7 h-7 rounded-full object-cover border border-primary/20"
                        />
                      ) : (
                        <User size={18} />
                      )}
                      {user?.name || user?.email}
                    </Link>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        logout();
                      }}
                      className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal("login");
                      }}
                      className="text-lg font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <LogIn size={18} />
                      Log In
                    </button>
                    <button
                      onClick={() => {
                        setMobileMenuOpen(false);
                        openAuthModal("chooseType");
                      }}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      New here? Sign up
                    </button>
                  </>
                )}
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
