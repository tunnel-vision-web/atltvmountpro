import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUI } from "@/contexts/UIContext";
import { useClientAuth } from "@/contexts/ClientAuthContext";
import { toast } from "sonner";
import { Eye, EyeOff, User, Wrench, ArrowLeft } from "lucide-react";

const ClientAuthModal = () => {
  const { authModalOpen, closeAuthModal, authModalMode, setAuthModalMode } =
    useUI();
  const { login, loginWithGoogle, signup } = useClientAuth();

  const [mode, setMode] = useState("login"); // login | signup | chooseType | signupForm
  const [accountType, setAccountType] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    preferredChannel: "Email",
  });

  React.useEffect(() => {
    if (authModalMode) {
      setMode(authModalMode);
    }
  }, [authModalMode]);

  React.useEffect(() => {
    if (!authModalOpen) {
      setTimeout(() => {
        setMode("login");
        setAccountType("customer");
        setForm({
          name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
          preferredChannel: "Email",
        });
        setShowPassword(false);
        setAgreeTerms(false);
      }, 300);
    }
  }, [authModalOpen]);

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      closeAuthModal();
    } catch (err) {
      toast.error(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!agreeTerms) {
      toast.error("Please accept the Terms of Service and Privacy Policy to register.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      await signup({
        email: form.email,
        password: form.password,
        name: form.name,
        phone: form.phone,
        type: accountType,
        preferredChannel: form.preferredChannel,
      });
      closeAuthModal();
    } catch (err) {
      toast.error(err.message || "Sign up failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (field, value) =>
    setForm((f) => ({ ...f, [field]: value }));

  return (
    <Dialog open={authModalOpen} onOpenChange={closeAuthModal}>
      <DialogContent className="w-full max-w-[420px] p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <DialogTitle className="text-lg">
            {mode === "login" && "Welcome Back"}
            {mode === "signup" && "Create Account"}
            {mode === "chooseType" && "I am a..."}
            {mode === "signupForm" &&
              (accountType === "customer"
                ? "Client Sign Up"
                : "Technician Sign Up")}
          </DialogTitle>
          <DialogDescription className="text-sm mt-0.5">
            {mode === "login" &&
              "Sign in to track your jobs and manage invoices."}
            {mode === "signup" && "Join Atlanta TV Mount Pro to get started."}
            {mode === "chooseType" &&
              "Select the account type that best describes you."}
            {mode === "signupForm" &&
              "Fill in your details to create your account."}
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5">
          {/* LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="auth-password">Password</Label>
                <div className="relative">
                  <Input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    required
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    await loginWithGoogle();
                    closeAuthModal();
                  } catch (err) {
                    toast.error(err.message || "Google Authentication failed.");
                  }
                }}
                className="w-full border-border bg-card hover:bg-muted text-foreground flex items-center justify-center gap-2 h-10 text-xs font-semibold cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.091 14.973 0 12 0 7.354 0 3.398 2.673 1.48 6.574l3.786 3.191z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.275c0-.818-.073-1.609-.21-2.373H12v4.582h6.44c-.277 1.464-1.1 2.709-2.34 3.545l3.65 2.836c2.136-1.973 3.37-4.873 3.37-8.59z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.266 14.235A7.093 7.093 0 0 1 4.91 12c0-.79.13-1.555.356-2.265L1.48 6.545A11.905 11.905 0 0 0 0 12c0 2.01.5 3.91 1.38 5.61l3.886-3.375z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.957-1.077 7.94-2.927l-3.65-2.836c-1.01.677-2.3 1.082-3.79 1.082-2.923 0-5.4-1.973-6.282-4.627L1.38 17.936A11.927 11.927 0 0 0 12 24z"
                  />
                </svg>
                <span>Gmail / Google</span>
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("chooseType")}
                  className="text-primary hover:underline font-medium cursor-pointer"
                >
                  Sign up
                </button>
              </p>
            </form>
          )}

          {/* CHOOSE TYPE */}
          {mode === "chooseType" && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  setAccountType("customer");
                  setMode("signupForm");
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Customer</p>
                  <p className="text-sm text-muted-foreground">
                    Book services and track your jobs
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountType("tech");
                  setMode("signupForm");
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    New Technician
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Join our team and manage assignments
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setMode("login")}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 pt-2"
              >
                <ArrowLeft size={14} /> Already have an account? Sign in
              </button>
            </div>
          )}

          {/* SIGNUP FORM */}
          {mode === "signupForm" && (
            <form onSubmit={handleSignup} className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="su-name">Full Name</Label>
                <Input
                  id="su-name"
                  value={form.name}
                  onChange={(e) => updateForm("name", e.target.value)}
                  required
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-email">Email</Label>
                <Input
                  id="su-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateForm("email", e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-phone">Phone</Label>
                <Input
                  id="su-phone"
                  type="tel"
                  value={form.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-channel">Preferred Contact Channel</Label>
                <select
                  id="su-channel"
                  value={form.preferredChannel || "Email"}
                  onChange={(e) => updateForm("preferredChannel", e.target.value)}
                  className="w-full bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  required
                >
                  <option value="Email">Email</option>
                  <option value="SMS">SMS</option>
                  <option value="WhatsApp">WhatsApp</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-password">Password</Label>
                <div className="relative">
                  <Input
                    id="su-password"
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => updateForm("password", e.target.value)}
                    required
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-confirm">Confirm Password</Label>
                <div className="relative">
                  <Input
                    id="su-confirm"
                    type={showPassword ? "text" : "password"}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      updateForm("confirmPassword", e.target.value)
                    }
                    required
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground flex items-center"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
              <div className="flex items-start gap-2.5 py-1 text-xs select-none">
                <input
                  type="checkbox"
                  id="su-agree"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary h-4 w-4 bg-muted/40 cursor-pointer mt-0.5"
                  required
                />
                <Label htmlFor="su-agree" className="text-muted-foreground font-normal leading-normal cursor-pointer">
                  I agree to the{" "}
                  <Link to="/terms-of-service" target="_blank" className="text-primary hover:underline font-semibold">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy-policy" target="_blank" className="text-primary hover:underline font-semibold">Privacy Policy</Link>
                  {accountType === "tech" && (
                    <>
                      {" "}and{" "}
                      <Link to="/technician-terms" target="_blank" className="text-primary hover:underline font-semibold">Technician Membership Terms</Link>
                    </>
                  )}
                  .
                </Label>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground mt-2"
                disabled={loading}
              >
                {loading ? "Creating account…" : "Create Account"}
              </Button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-border"></div>
                <span className="flex-shrink mx-4 text-muted-foreground text-[10px] uppercase font-bold tracking-wider">Or sign up with</span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    await loginWithGoogle();
                    closeAuthModal();
                  } catch (err) {
                    toast.error(err.message || "Google Authentication failed.");
                  }
                }}
                className="w-full border-border bg-card hover:bg-muted text-foreground flex items-center justify-center gap-2 h-10 text-xs font-semibold cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l3.51-3.51C17.642 1.091 14.973 0 12 0 7.354 0 3.398 2.673 1.48 6.574l3.786 3.191z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.49 12.275c0-.818-.073-1.609-.21-2.373H12v4.582h6.44c-.277 1.464-1.1 2.709-2.34 3.545l3.65 2.836c2.136-1.973 3.37-4.873 3.37-8.59z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.266 14.235A7.093 7.093 0 0 1 4.91 12c0-.79.13-1.555.356-2.265L1.48 6.545A11.905 11.905 0 0 0 0 12c0 2.01.5 3.91 1.38 5.61l3.886-3.375z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.957-1.077 7.94-2.927l-3.65-2.836c-1.01.677-2.3 1.082-3.79 1.082-2.923 0-5.4-1.973-6.282-4.627L1.38 17.936A11.927 11.927 0 0 0 12 24z"
                  />
                </svg>
                <span>Gmail / Google</span>
              </Button>

              <button
                type="button"
                onClick={() => setMode("chooseType")}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1 cursor-pointer"
              >
                <ArrowLeft size={14} /> Back
              </button>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ClientAuthModal;
