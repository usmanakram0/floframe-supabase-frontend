import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSettings } from "@/contexts/SettingsContext";

const ResetPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { darkMode } = useSettings();

  const sendResetEmail = async () => {
    if (!email) {
      toast({
        title: "Enter email",
        description: "Please enter your email",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/new-password`,
      });
      if (error) throw error;
      toast({
        title: "Email sent",
        description: "Check your email for the reset link",
      });
      navigate("/auth");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="bg-card border border-border p-8 rounded-2xl w-full max-w-sm space-y-4 shadow-lg">
          <h2 className="text-2xl font-bold text-foreground text-center">
            Reset Password
          </h2>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Button
            onClick={sendResetEmail}
            disabled={loading}
            className="w-full">
            {loading ? "Sending..." : "Send Reset Email"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
