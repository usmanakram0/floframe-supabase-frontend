import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import google from "../assets/google.png";

const Auth = () => {
  const navigate = useNavigate();

  const { darkMode } = useSettings();
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Account created",
        description: "You can now login",
      });
      setActiveTab("login");
      setPassword("");
    }
  };

  const signIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Logged in successfully" });
      navigate("/");
    }
  };

  const signInWithGoogle = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin, // sends back to your app
      },
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Google Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="bg-card border border-border p-8 rounded-2xl w-full max-w-sm space-y-6 shadow-lg">
          {/* Logo */}
          <div className="flex flex-col items-center gap-2">
            <img src={logo} className="w-14 h-14" />
            <h2 className="text-2xl font-bold text-foreground">FloFrame</h2>
          </div>

          {/* Tabs */}
          <div className="flex bg-secondary rounded-xl p-1 border border-border">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                activeTab === "login"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}>
              Login
            </button>

            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-2 rounded-lg font-medium transition ${
                activeTab === "signup"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}>
              Signup
            </button>
          </div>

          {/* Form */}
          <div className="space-y-4">
            {/* Email */}
            <input
              className="w-full p-3 rounded-xl bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            {/* Password with Eye Toggle */}
            <div className="relative">
              <input
                className="w-full p-3 pr-10 rounded-xl bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Action Buttons */}
            {activeTab === "login" ? (
              <Button
                onClick={signIn}
                disabled={loading}
                className="w-full h-12 text-lg">
                {loading ? "Logging in..." : "Login"}
              </Button>
            ) : (
              <Button
                onClick={signUp}
                disabled={loading}
                className="w-full h-12 text-lg">
                {loading ? "Creating..." : "Create Account"}
              </Button>
            )}
            <Button
              onClick={signInWithGoogle}
              disabled={loading}
              variant="secondary"
              className="w-full h-12 text-lg border border-border flex items-center justify-center gap-3">
              <img src={google} className="w-5 h-5" />
              Continue with Google
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
