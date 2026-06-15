import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import pb from "@/lib/pocketbaseClient";

export default function VerifyOptinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState("verifying"); // verifying | success | error
  const [errorMessage, setErrorMessage] = useState("");
  const [channel, setChannel] = useState("Email");

  useEffect(() => {
    const performVerification = async () => {
      if (!token || !email) {
        setStatus("error");
        setErrorMessage("Missing verification token or email address.");
        return;
      }

      try {
        // Try PocketBase first
        const records = await pb.collection("clients").getFullList({
          filter: `email="${email}" && DoubleOptIn_Token="${token}"`,
        });

        if (records.length > 0) {
          const record = records[0];
          await pb.collection("clients").update(record.id, {
            OptIn_Status: "Confirmed",
            OptIn_Date: new Date().toISOString(),
          });
          setChannel(record.OptIn_Channel || "Email");
          setStatus("success");
          return;
        }

        // PocketBase record not found, try fallback local storage
        const localUsers = JSON.parse(localStorage.getItem("atltv_local_users") || "[]");
        const idx = localUsers.findIndex(u => u.email === email && u.DoubleOptIn_Token === token);
        
        if (idx !== -1) {
          localUsers[idx].OptIn_Status = "Confirmed";
          localUsers[idx].OptIn_Date = new Date().toISOString();
          localStorage.setItem("atltv_local_users", JSON.stringify(localUsers));
          setChannel(localUsers[idx].OptIn_Channel || "Email");
          setStatus("success");
          return;
        }

        // Neither found
        setStatus("error");
        setErrorMessage("Invalid or expired verification token.");
      } catch (err) {
        console.error("Verification error:", err);
        setStatus("error");
        setErrorMessage("An error occurred during verification. Please try again later.");
      }
    };

    performVerification();
  }, [token, email]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-20">
      <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-xl text-center relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />

        {status === "verifying" && (
          <div className="py-8 flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
            <h1 className="text-xl font-bold text-foreground">Verifying Preference...</h1>
            <p className="text-sm text-muted-foreground">
              Please wait while we secure your communication preferences.
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="py-6 flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 text-green-500 animate-pulse">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Verified Successfully!</h1>
            <p className="text-sm text-muted-foreground leading-relaxed px-2">
              Your preferred channel (<span className="font-semibold text-primary capitalize">{channel}</span>) has been verified. You will now receive invoices and job status notifications via this channel.
            </p>
            <Button 
              onClick={() => navigate("/")} 
              className="mt-4 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-6 rounded-xl"
            >
              Go to Home Page
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="py-6 flex flex-col items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center border border-destructive/20 text-destructive">
              <AlertTriangle className="w-10 h-10" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">Verification Failed</h1>
            <p className="text-sm text-muted-foreground leading-relaxed px-2">
              {errorMessage}
            </p>
            <Button 
              onClick={() => navigate("/")} 
              variant="outline"
              className="mt-4 w-full border-border hover:bg-muted text-foreground py-6 rounded-xl"
            >
              Return to Site
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
