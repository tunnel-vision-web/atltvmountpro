import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClientAuth } from "@/contexts/ClientAuthContext";

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithSSO } = useClientAuth();

  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const [status, setStatus] = useState("verifying"); // verifying | error
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      const storedState = localStorage.getItem("sso_state");
      const codeVerifier = localStorage.getItem("sso_code_verifier");

      // Clean up localStorage keys immediately
      localStorage.removeItem("sso_state");
      localStorage.removeItem("sso_code_verifier");

      if (!code) {
        setStatus("error");
        setErrorMessage("Missing authorization code from Identity Provider.");
        return;
      }

      if (!state || state !== storedState) {
        setStatus("error");
        setErrorMessage("CSRF token verification failed. Unauthorized request.");
        return;
      }

      try {
        const intermavenBackendUrl =
          window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
            ? "http://localhost:8001"
            : "https://intermaven.onrender.com";

        const redirectUri = window.location.origin + "/auth/callback";

        // 1. Exchange authorization code for token
        const params = new URLSearchParams();
        params.append("grant_type", "authorization_code");
        params.append("code", code);
        params.append("redirect_uri", redirectUri);
        params.append("client_id", "atltvmount");
        if (codeVerifier) {
          params.append("code_verifier", codeVerifier);
        }

        const tokenResponse = await fetch(`${intermavenBackendUrl}/api/auth/sso/token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params.toString(),
        });

        if (!tokenResponse.ok) {
          const errData = await tokenResponse.json().catch(() => ({}));
          throw new Error(errData.detail || "Failed to exchange authorization code for tokens.");
        }

        const tokenData = await tokenResponse.json();

        // 2. Fetch UserInfo from Identity Provider
        const userInfoResponse = await fetch(`${intermavenBackendUrl}/api/auth/sso/userinfo`, {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        if (!userInfoResponse.ok) {
          throw new Error("Failed to retrieve user profile information.");
        }

        const profileData = await userInfoResponse.json();

        // 3. Log user in with SSO info
        loginWithSSO(profileData, tokenData.access_token);

        // 4. Redirect home/dashboard
        navigate("/");
      } catch (err) {
        console.error("SSO Callback Error:", err);
        setStatus("error");
        setErrorMessage(err.message || "An error occurred during single sign-on authentication.");
      }
    };

    handleCallback();
  }, [code, state, navigate, loginWithSSO]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20">
      <div className="w-full max-w-md bg-card border border-border p-8 shadow-xl text-center relative overflow-hidden rounded-[3px]">
        {status === "verifying" && (
          <div className="py-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <h1 className="text-xl font-bold text-foreground">Completing Sign In...</h1>
            <p className="text-sm text-muted-foreground">
              Please wait while we establish your partner session.
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="py-6 flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 text-destructive">
              <AlertCircle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Authentication Failed</h1>
            <p className="text-sm text-muted-foreground leading-relaxed px-2">
              {errorMessage}
            </p>
            <Button 
              onClick={() => navigate("/")} 
              variant="outline"
              className="mt-4 w-full border-border hover:bg-muted text-foreground py-6 rounded-[3px]"
            >
              Return to Site
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
