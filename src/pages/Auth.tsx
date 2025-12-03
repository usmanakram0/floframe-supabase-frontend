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
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const signUp = async () => {
    if (password !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "Confirm password does not match",
        variant: "destructive",
      });
      return;
    }

    if (!firstName || !lastName || !email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName },
        },
      });

      if (error) {
        toast({
          title: "Signup failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (data?.user) {
        const { error: profileError } = await supabase.from("profiles").upsert(
          {
            id: data.user.id,
            first_name: firstName,
            last_name: lastName,
            usage_count: 0,
            usage_limit: 5, // free tier limit
            plan: "free",
          },
          { onConflict: "id" }
        );

        if (profileError) {
          toast({
            title: "Profile creation failed",
            description: profileError.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Account created",
            description: "You can now login",
          });
          setActiveTab("login");
          setPassword("");
          setConfirmPassword("");
        }
      }
    } catch (err: any) {
      toast({
        title: "Signup error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
      options: { redirectTo: window.location.origin },
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
        <div className="bg-card border border-border p-8 rounded-2xl w-full max-w-sm space-y-4 shadow-lg">
          <div className="flex flex-col items-center gap-2">
            <img src={logo} className="w-14 h-14" />
            <h2 className="text-2xl font-bold text-foreground">FloFrame</h2>
          </div>

          {/* Tabs */}
          <div className="flex bg-secondary rounded-xl p-1 border border-border">
            <button
              onClick={() => setActiveTab("login")}
              className={`flex-1 py-2 rounded-[8px] font-medium transition ${
                activeTab === "login"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}>
              Login
            </button>
            <button
              onClick={() => setActiveTab("signup")}
              className={`flex-1 py-2 rounded-[8px] font-medium transition ${
                activeTab === "signup"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground"
              }`}>
              Signup
            </button>
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              activeTab === "login" ? signIn() : signUp();
            }}
            className="space-y-3">
            <div className="space-y-3">
              {activeTab === "signup" && (
                <>
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-3 rounded-xl bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                  />
                </>
              )}

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 rounded-xl bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {activeTab === "signup" && (
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-xl bg-background text-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-muted-foreground"
                />
              )}

              {/* Buttons */}
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
                <img src={google} className="w-5 h-5" /> Continue with Google
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
