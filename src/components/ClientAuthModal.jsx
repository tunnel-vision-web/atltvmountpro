import React, { useState } from "react";
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
  const { login, signup } = useClientAuth();

  const [mode, setMode] = useState("login"); // login | signup | chooseType | signupForm
  const [accountType, setAccountType] = useState("customer");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
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
        });
        setShowPassword(false);
      }, 300);
    }
  }, [authModalOpen]);

  const handleLogin = async (e) => {
    e.preventDefault();
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
            {mode === "signup" && "Join ATL TV Mount PRO to get started."}
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
              <div className="space-y-1.5 relative">
                <Label htmlFor="auth-password">Password</Label>
                <Input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[30px] text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>
              <p className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("chooseType")}
                  className="text-primary hover:underline font-medium"
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
              <div className="space-y-1.5 relative">
                <Label htmlFor="su-password">Password</Label>
                <Input
                  id="su-password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => updateForm("password", e.target.value)}
                  required
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[30px] text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-confirm">Confirm Password</Label>
                <Input
                  id="su-confirm"
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    updateForm("confirmPassword", e.target.value)
                  }
                  required
                  placeholder="••••••••"
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={loading}
              >
                {loading ? "Creating account…" : "Create Account"}
              </Button>
              <button
                type="button"
                onClick={() => setMode("chooseType")}
                className="w-full text-center text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-1"
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
