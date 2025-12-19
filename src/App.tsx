import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SettingsProvider } from "./contexts/SettingsContext";
import { UploadProvider } from "./contexts/UploadContext";
import Upload from "./pages/Upload";
import Settings from "./pages/Settings";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import NewPasswordPage from "./pages/NewPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import { SubscribeProvider } from "./contexts/SubscribeContext";
import Dashboard from "./pages/DashboardPage";

const queryClient = new QueryClient();
// abc
const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SettingsProvider>
        <UploadProvider>
          <SubscribeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* <Route path="/auth" element={<Auth />} />
                  <Route
                    path="/reset-password"
                    element={<ResetPasswordPage />}
                  />
                  <Route path="/new-password" element={<NewPasswordPage />} /> */}
                  <Route
                    path="/"
                    element={
                      // <ProtectedRoute>
                      <Upload />
                      // </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/settings"
                    element={
                      // <ProtectedRoute>
                      <Settings />
                      // </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/about"
                    element={
                      // <ProtectedRoute>
                      <About />
                      // </ProtectedRoute>
                    }
                  />
                  {/* <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  /> */}

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </SubscribeProvider>
        </UploadProvider>
      </SettingsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
