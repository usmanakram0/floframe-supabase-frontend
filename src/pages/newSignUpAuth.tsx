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

//////////////////// ////////////////////////////////////////////////////////////// SIMPLE DOM EXTRACIONS //////////////////////////////////////////////

// import { useState, useCallback, useEffect } from "react";
// import { Upload as UploadIcon, Download, X } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useToast } from "@/hooks/use-toast";
// import { Navigation } from "@/components/Navigation";
// import { useUpload } from "@/contexts/UploadContext";
// import { useSettings } from "@/contexts/SettingsContext";
// import logo from "../assets/logo.png";
// import { useAuth } from "@/contexts/AuthContext";
// import { useProfile } from "@/hooks/useProfile";
// import { supabase } from "@/lib/supabaseClient";

// const Upload = () => {
//   const {
//     videoFile,
//     setVideoFile,
//     videoInfo,
//     setVideoInfo,
//     extractedFrame,
//     setExtractedFrame,
//     uploadProgress,
//     setUploadProgress,
//   } = useUpload();
//   const { darkMode } = useSettings();
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isDragging, setIsDragging] = useState(false);
//   const { toast } = useToast();

//   const { user } = useAuth();
//   const { profile, setProfile, loading: profileLoading } = useProfile(user?.id);

//   const validateFile = (file: File): boolean => {
//     const validTypes = ["video/mp4", "video/quicktime"];
//     const maxSize = 200 * 1024 * 1024; // 200MB

//     if (!validTypes.includes(file.type)) {
//       toast({
//         title: "Invalid file type",
//         description: "Please upload an MP4 or MOV file",
//         variant: "destructive",
//       });
//       return false;
//     }

//     if (file.size > maxSize) {
//       toast({
//         title: "File too large",
//         description: "Maximum file size is 200MB",
//         variant: "destructive",
//       });
//       return false;
//     }

//     return true;
//   };

//   const getVideoInfo = (
//     file: File
//   ): Promise<{ duration: number; resolution: string }> => {
//     return new Promise((resolve) => {
//       const video = document.createElement("video");
//       video.preload = "metadata";

//       video.onloadedmetadata = () => {
//         URL.revokeObjectURL(video.src);
//         const duration = Math.round(video.duration);
//         const resolution = `${video.videoWidth}x${video.videoHeight}`;
//         resolve({ duration, resolution });
//       };

//       video.src = URL.createObjectURL(file);
//     });
//   };

//   const handleFileSelect = async (file: File) => {
//     if (!validateFile(file)) return;

//     setUploadProgress(0);
//     setVideoFile(file);
//     const info = await getVideoInfo(file);
//     setVideoInfo(info);
//     setExtractedFrame(null);

//     // simulate progress
//     let progress = 0;
//     const progressInterval = setInterval(() => {
//       progress += 5;
//       setUploadProgress(progress);
//       if (progress >= 100) clearInterval(progressInterval);
//     }, 80);

//     toast({
//       title: "Video uploaded",
//       description: `Duration: ${info.duration}s, Resolution: ${info.resolution}`,
//     });
//   };

//   const handleDragOver = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(true);
//   }, []);

//   const handleDragLeave = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);
//   }, []);

//   const handleDrop = useCallback((e: React.DragEvent) => {
//     e.preventDefault();
//     setIsDragging(false);

//     const file = e.dataTransfer.files[0];
//     if (file) handleFileSelect(file);
//   }, []);

//   const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) handleFileSelect(file);
//   };

//   const extractFrame = async () => {
//     if (isProcessing || !videoFile || !profile || !user) return;

//     const now = Date.now();
//     let usageCount = profile.usage_count;

//     if (profile.last_extraction) {
//       const lastExtractionMs = new Date(profile.last_extraction).getTime();

//       const diffMs = now - lastExtractionMs;
//       const diffMinutes = diffMs / (1000 * 60);

//       const RESET_AFTER_MINUTES = 1440;

//       if (diffMinutes >= RESET_AFTER_MINUTES) {
//         usageCount = 0;

//         const { data } = await supabase
//           .from("profiles")
//           .update({ usage_count: 0 })
//           .eq("id", user.id)
//           .select()
//           .single();

//         if (data) {
//           setProfile(data);
//         }
//       }
//     }

//     const lastExtractionDate = new Date(profile.last_extraction);
//     const nextResetDate = new Date(
//       lastExtractionDate.getTime() + 24 * 60 * 60 * 1000
//     );

//     const nextResetTimeLocal = nextResetDate.toLocaleTimeString([], {
//       hour: "2-digit",
//       minute: "2-digit",
//       hour12: true,
//     });

//     // 2025-12-03 13:23:56.697+00
//     if (usageCount >= profile.usage_limit) {
//       toast({
//         title: "Limit Reached",
//         description: `You have used all free extractions for today. Come again tomorrow at ${nextResetTimeLocal}.`,
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsProcessing(true);

//     try {
//       const formData = new FormData();
//       formData.append("video", videoFile);

//       const response = await fetch(
//         "https://floframe-be.vercel.app/api/extract-last-frame",
//         { method: "POST", body: formData }
//       );

//       if (!response.ok) throw new Error("Extraction failed");

//       const blob = await response.blob();
//       const url = URL.createObjectURL(blob);
//       setExtractedFrame(url);

//       const { data, error } = await supabase
//         .from("profiles")
//         .update({
//           usage_count: usageCount + 1,
//           last_extraction: new Date().toISOString(),
//         })
//         .eq("id", user.id)
//         .select()
//         .single();

//       if (!error && data) {
//         setProfile(data);

//         toast({
//           title: "Frame extracted",
//           description: `Remaining: ${data.usage_limit - data.usage_count}`,
//         });
//       }
//     } catch (error: any) {
//       toast({
//         title: "Extraction Failed",
//         description: error.message,
//         variant: "destructive",
//       });
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const downloadFrame = async () => {
//     if (!extractedFrame) return;
//     try {
//       const blob = await (await fetch(extractedFrame)).blob();
//       const fileName = `floframe-${Date.now()}.png`;
//       const file = new File([blob], fileName, { type: "image/png" });

//       const ua = navigator.userAgent;
//       const isIOS = /iPad|iPhone|iPod/.test(ua);
//       const isAndroid = /Android/.test(ua);

//       if (isIOS && navigator.share) {
//         toast({
//           title: "Save to Photos",
//           description: "In the next screen, tap 'Save to Photos'.",
//         });

//         try {
//           await navigator.share({
//             files: [file],
//             title: "FloFrame",
//             text: "Save frame to Photos",
//           });
//         } catch {
//           const newTab = window.open();
//           if (newTab) {
//             newTab.document.write(
//               `<img src="${extractedFrame}" style="width:100%" />`
//             );
//           }
//         }
//       } else if (isAndroid && navigator.share) {
//         await navigator.share({
//           files: [file],
//           title: "FloFrame",
//           text: "Save frame to Gallery",
//         });
//       } else {
//         const link = document.createElement("a");
//         link.href = extractedFrame;
//         link.download = fileName;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//       }

//       setExtractedFrame(null);
//       setVideoFile(null);
//       setVideoInfo(null);
//       setUploadProgress(0);
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   const clearAll = () => {
//     setVideoFile(null);
//     setExtractedFrame(null);
//     setVideoInfo(null);
//     setUploadProgress(0);
//   };

//   useEffect(() => {
//     if (videoFile && uploadProgress === 100 && !extractedFrame) extractFrame();
//   }, [uploadProgress, videoFile]);

//   useEffect(() => {
//     if (!profile || !user) return;

//     const checkAndResetLimit = async () => {
//       const now = Date.now();
//       const lastExtractionMs = new Date(profile.last_extraction).getTime();
//       const diffMinutes = (now - lastExtractionMs) / (1000 * 60);

//       const RESET_AFTER_MINUTES = 1440;

//       if (diffMinutes >= RESET_AFTER_MINUTES && profile.usage_count > 0) {
//         const { data } = await supabase
//           .from("profiles")
//           .update({ usage_count: 0 })
//           .eq("id", user.id)
//           .select()
//           .single();

//         if (data) {
//           setProfile(data);
//         }
//       }
//     };

//     checkAndResetLimit();
//   }, [profile?.last_extraction]);

//   return (
//     <div className={darkMode ? "dark" : ""}>
//       <div className="min-h-screen bg-background">
//         <Navigation />

//         <main className="container mx-auto px-4 py-6 max-w-[600px]">
//           <div className="space-y-6">
//             {/* Logo Header */}
//             <div className="flex items-center justify-center gap-4 mb-8">
//               <div className="w-12 sm:w-16 h-12 sm:h-16 bg-primary rounded-xl flex items-center justify-center">
//                 <div className="w-16 h-16 flex items-center justify-center transition-transform group-hover:scale-105">
//                   <img src={logo} alt="" />
//                 </div>
//               </div>
//               <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
//                 FloFrame
//               </h1>
//             </div>

//             {/* Clickable Upload Box */}
//             {profile && (
//               <div className="text-center text-sm text-muted-foreground mb-2">
//                 {profile.usage_count < profile.usage_limit ? (
//                   <>
//                     Remaining Extractions Today:{" "}
//                     <span className="text-primary font-semibold">
//                       {profile.usage_limit - profile.usage_count}
//                     </span>
//                     /{profile.usage_limit}
//                   </>
//                 ) : (
//                   <span className="text-red-500 font-semibold">
//                     Daily limit reached
//                   </span>
//                 )}
//               </div>
//             )}

//             <div
//               className="border-2 cursor-pointer hover:border-primary transition-all ease-in-out 1s border-border bg-card rounded-2xl p-4"
//               onClick={() =>
//                 document.getElementById("videoUploadInput")?.click()
//               }>
//               <h2 className="mb-0 text-xl sm:text-2xl font-bold text-center text-foreground">
//                 Upload Video
//               </h2>
//             </div>
//             <input
//               id="videoUploadInput"
//               type="file"
//               accept="video/mp4,video/quicktime"
//               className="hidden"
//               onChange={handleFileInput}
//             />

//             {/* Drag & Drop Area */}
//             <div
//               onDragOver={handleDragOver}
//               onDragLeave={handleDragLeave}
//               onDrop={handleDrop}
//               className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ${
//                 isDragging
//                   ? "border-primary bg-primary/5"
//                   : "border-border bg-card hover:border-border/50"
//               }`}>
//               <input
//                 type="file"
//                 accept="video/mp4,video/quicktime"
//                 onChange={handleFileInput}
//                 className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
//                 disabled={!!videoFile}
//               />

//               <div
//                 className={`flex flex-row items-start justify-center text-center space-y-2  ${
//                   videoFile?.name ? "break-all" : undefined
//                 }`}>
//                 <p className="text-xl sm:text-2xl text-muted-foreground m-0 ">
//                   {videoFile
//                     ? videoFile.name
//                     : "Drop your MP4 or MOV file here"}
//                 </p>
//               </div>
//             </div>

//             {/* Progress Bar */}
//             {videoFile && uploadProgress !== 0 && (
//               <div className="space-y-1">
//                 <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
//                   <div
//                     className="h-full bg-primary transition-all duration-300"
//                     style={{ width: `${uploadProgress}%` }}
//                   />
//                 </div>
//                 <p className="text-xl text-muted-foreground">
//                   {uploadProgress}%
//                 </p>
//               </div>
//             )}

//             {/* Image Preview */}
//             {extractedFrame && (
//               <div className="border-2 border-border bg-card p-3 rounded-2xl overflow-hidden">
//                 <div className="overflow-hidden flex items-center justify-center rounded-xl">
//                   <img
//                     src={extractedFrame}
//                     alt="Extracted frame"
//                     className="w-full h-auto object-contain"
//                   />
//                 </div>
//               </div>
//             )}

//             {/* Action Buttons */}
//             {videoFile && uploadProgress >= 100 && (
//               <div className="space-y-4">
//                 {extractedFrame ? (
//                   <div className="flex gap-4">
//                     <Button
//                       onClick={downloadFrame}
//                       className="flex-1 h-16 text-xl font-bold bg-primary hover:bg-primary/90 rounded-2xl">
//                       {/* <Download className="w-6 h-6 mr-2" /> */}
//                       Extract Frame
//                     </Button>
//                   </div>
//                 ) : (
//                   <Button
//                     onClick={extractFrame}
//                     disabled={
//                       isProcessing ||
//                       profileLoading ||
//                       profile?.usage_count >= profile?.usage_limit
//                     }
//                     className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 rounded-2xl">
//                     {isProcessing ? "Processing..." : "Extract Frame"}
//                   </Button>
//                 )}
//               </div>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Upload;

// const extractFrame = async () => {
//   if (!videoFile || !profile || !user) return;

//   if (profile.usage_count >= profile.usage_limit) {
//     toast({
//       title: "Limit Reached",
//       description: `You have used all free extractions for today. Come again tomorrow at ${new Date(
//         profile.last_extraction.replace(" ", "T") + "Z"
//       ).toLocaleTimeString([], {
//         hour: "2-digit",
//         minute: "2-digit",
//         hour12: true,
//       })}.`,
//       variant: "destructive",
//     });
//     return;
//   }

//   setIsProcessing(true);

//   try {
//     const formData = new FormData();
//     formData.append("video", videoFile);

//     const response = await fetch(
//       "https://floframe-be.vercel.app/api/extract-last-frame",
//       // "https://13.222.13.17/api/extract-last-frame",
//       // "http://13.222.13.17:4000/api/extract-last-frame",
//       {
//         method: "POST",
//         body: formData,
//       }
//     );

//     if (!response.ok) throw new Error("Extraction failed");

//     const blob = await response.blob();
//     const url = URL.createObjectURL(blob);
//     setExtractedFrame(url);

//     // ✅ Update usage_count and last_extraction in Supabase
//     const { data, error } = await supabase
//       .from("profiles")
//       .update({
//         usage_count: profile.usage_count + 1,
//         last_extraction: new Date().toISOString(),
//       })
//       .eq("id", user.id)
//       .select(); // fetch updated row

//     if (!error && data?.[0]) {
//       // Update profile state immediately
//       setProfile(data[0]);
//       toast({
//         title: "Frame extracted",
//         description: `Remaining: ${
//           data[0].usage_limit - data[0].usage_count
//         }`,
//       });
//     }
//   } catch (error: any) {
//     toast({
//       title: "Extraction Failed",
//       description: error.message,
//       variant: "destructive",
//     });
//   } finally {
//     setIsProcessing(false);
//   }
// };
