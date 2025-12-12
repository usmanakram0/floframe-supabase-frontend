import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, Menu, Moon, Sun } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useSettings } from "@/contexts/SettingsContext";
import { Switch } from "./ui/switch";
import { Button } from "./ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useUpload } from "@/contexts/UploadContext";

export const Navigation = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { darkMode, setDarkMode } = useSettings();
  const { clearAll } = useUpload();
  const navigate = useNavigate();
  const isAdminEmail = import.meta.env.VITE_ADMIN_USER_EMAIL;

  const isActive = (path: string) => location.pathname === path;

  const navItemClasses = (path: string) =>
    `block py-2 text-[16px] ${
      isActive(path)
        ? "text-foreground font-medium"
        : "text-muted-foreground hover:text-foreground"
    }`;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearAll();
    navigate("/auth", { replace: true });
  };

  return (
    <nav
      className={`w-full px-4 sm:px-6 py-4 flex items-center justify-between border-b border-border ${
        darkMode ? "dark" : ""
      }`}>
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 flex items-center justify-center transition-transform group-hover:scale-105">
          <img src={logo} alt="" />
        </div>
        <span className="text-xl font-bold text-foreground">FloFrame</span>
      </Link>

      <div className="hidden sm:flex items-center gap-6">
        <Link to="/" className={navItemClasses("/")}>
          Upload
        </Link>
        <Link to="/about" className={navItemClasses("/about")}>
          About
        </Link>
        <Link to="/settings" className={navItemClasses("/settings")}>
          Settings
        </Link>

        {user?.email === "mianali4118@gmail.com" && (
          <Link to="/dashboard" className={navItemClasses("/dashboard")}>
            Dashboard
          </Link>
        )}
      </div>

      <div className="sm:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <button className="text-white p-2 rounded-md hover:bg-accent">
              <Menu className="h-6 w-6 text-foreground" />
            </button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className={`w-[70%] ${darkMode ? "dark" : ""}`}>
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <img src={logo} className="w-8 h-8" />
                <span className="text-lg font-semibold text-foreground">
                  FloFrame
                </span>
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 px-6 space-y-3">
              <Link to="/" className={navItemClasses("/")}>
                Upload
              </Link>
              <Link to="/about" className={navItemClasses("/about")}>
                About
              </Link>
              <Link to="/settings" className={navItemClasses("/settings")}>
                Settings
              </Link>

              {user?.email === isAdminEmail && (
                <Link to="/dashboard" className={navItemClasses("/dashboard")}>
                  Dashboard
                </Link>
              )}
            </div>

            <div className="mt-4 px-6 border-t pt-6">
              <div className="flex items-center justify-between">
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
            <div className="mt-4 w-full flex border-t pt-6">
              <Button
                onClick={handleLogout}
                className="border-t mx-4 mt-1 py-1 w-full h-12 text-lg rounded-[6px] font-semibold bg-primary hover:bg-primary/90">
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
};
