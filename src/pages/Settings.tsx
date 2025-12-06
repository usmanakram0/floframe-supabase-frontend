import { useEffect, useState } from "react";
import { Navigation } from "@/components/Navigation";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/contexts/SettingsContext";
import { LogOut, Loader2 } from "lucide-react";
import logo from "../assets/logo.png";
import avatar from "../assets/avatar.png";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useUpload } from "@/contexts/UploadContext";
import { useSubscribe } from "@/contexts/SubscribeContext";

const Settings = () => {
  const {
    frameRate,
    setFrameRate,
    quality,
    setQuality,
    darkMode,
    setDarkMode,
  } = useSettings();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clearAll } = useUpload();

  const { subscription, loading: loadingSub } = useSubscribe();

  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated",
    });
  };

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please sign in first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const res = await fetch(
        "https://prgyccukphmtwsqedhlz.supabase.co/functions/v1/create-checkout-session",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ priceId, userId: user.id }),
        }
      );

      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else throw new Error("Unable to create checkout session");
    } catch (err: any) {
      toast({
        title: "Payment Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearAll();
    navigate("/auth", { replace: true });
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="container mx-auto px-4 py-12 max-w-2xl space-y-8">
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center transition-transform group-hover:scale-105">
              <img src={logo} alt="Logo" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          </div>

          {/* Subscription Card */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4 shadow-md">
            <h3 className="text-lg font-semibold text-foreground">
              Subscription
            </h3>

            {loadingSub ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="animate-spin w-5 h-5" />
                Loading subscription...
              </div>
            ) : subscription ? (
              <div className="space-y-4">
                {/* Paid Users */}
                {subscription.plan !== "free" && (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Plan:{" "}
                      <span
                        className={`${
                          darkMode ? "text-white" : "text-black"
                        } font-medium capitalize`}>
                        {subscription.plan}
                      </span>
                    </p>

                    {subscription.billing_interval && (
                      <p className="text-sm text-muted-foreground">
                        Active Plan:{" "}
                        <span
                          className={`${
                            darkMode ? "text-white" : "text-black"
                          } font-medium capitalize`}>
                          {subscription.billing_interval === "year"
                            ? "Yearly"
                            : "Monthly"}
                        </span>
                      </p>
                    )}
                  </>
                )}

                {/* Free Plan */}
                {subscription.plan === "free" && (
                  <div className="space-y-2 mt-4">
                    <p className="text-sm text-muted-foreground">
                      Upgrade to Pro to unlock unlimited extractions and premium
                      features!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 mt-2">
                      <Button
                        onClick={() =>
                          handleSubscribe("price_1Sb5FPDvJPahImiqIrD7LHw0")
                        }
                        className="flex-1 h-14 text-lg font-semibold bg-primary hover:bg-primary/90">
                        $5 / Month
                      </Button>
                      <Button
                        onClick={() =>
                          handleSubscribe("price_1Sb5FPDvJPahImiq2vQHSnAC")
                        }
                        className="flex-1 h-14 text-lg font-semibold bg-primary hover:bg-primary/90">
                        $50 / Year
                      </Button>
                    </div>
                  </div>
                )}

                {/* Paid Monthly */}
                {subscription.plan === "paid" &&
                  subscription.billing_interval === "month" && (
                    <div className="pt-4 border-t divide-y divide-border">
                      <p className="text-sm text-muted-foreground mb-2">
                        Upgrade to yearly for more savings!
                      </p>
                      <Button
                        onClick={() =>
                          handleSubscribe("price_1Sb5FPDvJPahImiq2vQHSnAC")
                        }
                        className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90">
                        $50 / Year
                      </Button>
                    </div>
                  )}

                {/* Paid Yearly */}
                {subscription.plan === "paid" &&
                  subscription.billing_interval === "year" && (
                    <p className="text-sm text-muted-foreground mt-4">
                      You’re currently on the yearly plan. Enjoy premium
                      features!
                    </p>
                  )}
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  You don’t have an active subscription.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-2">
                  <Button
                    onClick={() =>
                      handleSubscribe("price_1Sb5FPDvJPahImiqIrD7LHw0")
                    }
                    className="flex-1 h-14 text-lg font-semibold bg-primary hover:bg-primary/90">
                    $5 / Month
                  </Button>
                  <Button
                    onClick={() =>
                      handleSubscribe("price_1Sb5FPDvJPahImiq2vQHSnAC")
                    }
                    className="flex-1 h-14 text-lg font-semibold bg-primary hover:bg-primary/90">
                    $50 / Year
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Other Settings */}
          <div className="bg-card rounded-2xl border border-border divide-y divide-border">
            {/* Frame Rate */}
            <div className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-foreground">
                  Frame Rate
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set the target frame rate for extraction
                </p>
              </div>
              <Select value={frameRate} onValueChange={setFrameRate}>
                <SelectTrigger
                  className={`w-32 bg-secondary border-border ${
                    darkMode ? "text-white" : "text-black"
                  }`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="24">24 FPS</SelectItem>
                  <SelectItem value="30">30 FPS</SelectItem>
                  <SelectItem value="60">60 FPS</SelectItem>
                  <SelectItem value="120">120 FPS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quality */}
            <div className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-foreground">Quality</h3>
                <p className="text-sm text-muted-foreground">
                  Extract frames in maximum quality
                </p>
              </div>
              <Switch
                checked={quality}
                onCheckedChange={setQuality}
                className="data-[state=checked]:bg-primary"
              />
            </div>

            {/* Dark Mode */}
            <div className="p-6 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-foreground">
                  Dark Mode
                </h3>
                <p className="text-sm text-muted-foreground">
                  Use dark theme interface
                </p>
              </div>
              <Switch
                checked={darkMode}
                onCheckedChange={setDarkMode}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90">
            Save Changes
          </Button>

          {/* User Info */}
          {user && (
            <div className="pt-6 border-t border-border space-y-4">
              <div className="flex items-center gap-4 p-4 bg-card rounded-xl">
                <img
                  src={avatar}
                  alt="User Avatar"
                  className="w-12 h-12 rounded-full border border-border"
                />
                <div className="flex-1">
                  <p className="text-foreground font-medium">{user.email}</p>
                </div>
              </div>
            </div>
          )}

          <Button
            onClick={handleLogout}
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90">
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </main>
      </div>
    </div>
  );
};

export default Settings;
