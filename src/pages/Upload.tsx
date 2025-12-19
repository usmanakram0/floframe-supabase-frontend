// import { useState, useCallback, useEffect, useRef } from "react";
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
// import { useSubscribe } from "@/contexts/SubscribeContext";
// import { LikeFloFrame } from "@/components/LikeButton";
// import { FloFrameFeedback } from "@/components/FloFrameFeedback";

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
//   const { subscription, loading: loadingSub } = useSubscribe();
//   const hasTriggeredRef = useRef(false);

//   const { toast } = useToast();

//   const { user } = useAuth();
//   const { profile, setProfile, loading: profileLoading } = useProfile(user?.id);

//   function isSameLocalDate(dateA: Date, dateB: Date) {
//     return (
//       dateA.getFullYear() === dateB.getFullYear() &&
//       dateA.getMonth() === dateB.getMonth() &&
//       dateA.getDate() === dateB.getDate()
//     );
//   }

//   function getNextLocalMidnight() {
//     const now = new Date();
//     const midnight = new Date(
//       now.getFullYear(),
//       now.getMonth(),
//       now.getDate() + 1, // tomorrow
//       0,
//       0,
//       0,
//       0
//     );
//     return midnight;
//   }

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

//     // ✅ FULL RESET BEFORE NEW VIDEO
//     if (extractedFrame) {
//       URL.revokeObjectURL(extractedFrame);
//     }

//     setExtractedFrame(null);
//     setVideoFile(null);
//     setVideoInfo(null);
//     setUploadProgress(0);

//     // ✅ Let React flush state first
//     setTimeout(async () => {
//       setVideoFile(file);

//       const info = await getVideoInfo(file);
//       setVideoInfo(info);

//       // simulate progress
//       let progress = 0;
//       const progressInterval = setInterval(() => {
//         progress += 5;
//         setUploadProgress(progress);
//         if (progress >= 100) clearInterval(progressInterval);
//       }, 80);

//       toast({
//         title: "Video uploaded",
//         description: `Duration: ${info.duration}s, Resolution: ${info.resolution}`,
//       });
//     }, 50);
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
//     if (file) {
//       handleFileSelect(file);
//     }
//   }, []);

//   const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (file) {
//       handleFileSelect(file);
//     }

//     e.target.value = "";
//   };

//   const extractFrame = async () => {
//     if (isProcessing || !videoFile || !profile || !user) return;

//     const now = new Date();
//     let usageCount = profile.usage_count;
//     let shouldSetNewTimestamp = false;

//     if (!profile.last_extraction) {
//       // First extraction ever
//       usageCount = 0;
//       shouldSetNewTimestamp = true;
//     } else {
//       const last = new Date(profile.last_extraction);

//       if (!isSameLocalDate(now, last)) {
//         // New day → reset usage
//         usageCount = 0;
//         shouldSetNewTimestamp = true;
//       }
//     }

//     const nextMidnight = getNextLocalMidnight();
//     const nextResetTimeLocal = nextMidnight.toLocaleTimeString([], {
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
//         "https://floframe.app/api/extract-last-frame",
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
//           ...(shouldSetNewTimestamp && {
//             last_extraction: new Date().toISOString(),
//           }),
//         })
//         .eq("id", user.id)
//         .select()
//         .single();

//       if (!error && data) {
//         setProfile(data);
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

//   const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
//   const downloadFrame = async () => {
//     if (!extractedFrame) return;

//     try {
//       const blob = await (await fetch(extractedFrame)).blob();
//       const fileName = `floframe-${Date.now()}.png`;

//       if (isIOS) {
//         // On iOS, we do NOT download automatically
//         toast({
//           title: "iOS Device Detected",
//           description:
//             "Press and hold the image above, then select 'Save to Photos'.",
//         });
//         return;
//       }

//       // Android + Desktop: standard download
//       const link = document.createElement("a");
//       link.href = extractedFrame;
//       link.download = fileName;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);

//       resetState();
//     } catch (err: any) {
//       console.error(err);
//       toast({
//         title: "Download Failed",
//         description: err.message,
//         variant: "destructive",
//       });
//     }
//   };

//   const resetState = () => {
//     if (extractedFrame) {
//       URL.revokeObjectURL(extractedFrame);
//     }

//     setExtractedFrame(null);
//     setVideoFile(null);
//     setVideoInfo(null);
//     setUploadProgress(0);
//   };

//   useEffect(() => {
//     if (!videoFile) return;
//     if (uploadProgress !== 100) return;
//     if (isProcessing) return;
//     if (extractedFrame) return;
//     if (hasTriggeredRef.current) return;

//     hasTriggeredRef.current = true;
//     extractFrame();
//   }, [uploadProgress, videoFile, extractedFrame, isProcessing]);

//   useEffect(() => {
//     if (!profile || !user || !profile.last_extraction) return;

//     const interval = setInterval(async () => {
//       const now = new Date();
//       const last = new Date(profile.last_extraction);

//       const isNewDay = !isSameLocalDate(now, last);

//       if (isNewDay) {
//         const { data, error } = await supabase
//           .from("profiles")
//           .update({
//             usage_count: 0,
//             ...(profile.usage_count > 0 && {
//               last_extraction: now.toISOString(),
//             }),
//           })
//           .eq("id", user.id)
//           .select()
//           .single();

//         if (!error && data) {
//           setProfile(data);
//           console.log("🌙 Midnight reset completed");
//         }
//       }
//     }, 60000);

//     return () => clearInterval(interval);
//   }, [profile?.last_extraction, profile?.usage_count, user?.id]);

//   useEffect(() => {
//     hasTriggeredRef.current = false;
//   }, [videoFile]);

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
//                 {subscription && subscription.plan === "paid" && (
//                   <p className="text-primary text-sm p-0 font-bold">Premium</p>
//                 )}
//               </h1>
//             </div>

//             {/* Clickable Upload Box */}
//             {profile && profile.usage_limit <= 20 && (
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
//               className={`border-2 cursor-pointer hover:border-primary transition-all ease-in-out 1s border-border bg-card rounded-2xl p-4 ${
//                 isProcessing ? "cursor-not-allowed opacity-20" : ""
//               }`}
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
//               disabled={isProcessing}
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

//             {/* Progress Bar a */}
//             {videoFile && uploadProgress !== 0 && !extractedFrame && (
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
//                 {isIOS && (
//                   <p className="text-sm font-semibold text-muted-foreground mt-2 text-center">
//                     Press and hold the image to save it to Photos
//                   </p>
//                 )}
//               </div>
//             )}

//             {videoFile && uploadProgress >= 100 && (
//               <div className="space-y-4">
//                 {isProcessing ? (
//                   <Button className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 rounded-2xl">
//                     Processing...
//                   </Button>
//                 ) : extractedFrame && !isIOS ? (
//                   <Button
//                     onClick={downloadFrame}
//                     className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 rounded-2xl">
//                     Save
//                   </Button>
//                 ) : null}
//               </div>
//             )}

//             {extractedFrame && (
//               <>
//                 <LikeFloFrame />
//                 <FloFrameFeedback />
//               </>
//             )}
//           </div>
//         </main>
//       </div>
//     </div>
//   );
// };

// export default Upload;

import { useState, useCallback, useEffect, useRef } from "react";
import { Upload as UploadIcon, Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Navigation } from "@/components/Navigation";
import { useUpload } from "@/contexts/UploadContext";
import { useSettings } from "@/contexts/SettingsContext";
import logo from "../assets/logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/lib/supabaseClient";
import { useSubscribe } from "@/contexts/SubscribeContext";
import { LikeFloFrame } from "@/components/LikeButton";
import { FloFrameFeedback } from "@/components/FloFrameFeedback";

const Upload = () => {
  const {
    videoFile,
    setVideoFile,
    videoInfo,
    setVideoInfo,
    extractedFrame,
    setExtractedFrame,
    uploadProgress,
    setUploadProgress,
  } = useUpload();
  const { darkMode } = useSettings();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { subscription, loading: loadingSub } = useSubscribe();
  const hasTriggeredRef = useRef(false);

  const { toast } = useToast();

  const { user } = useAuth();
  // Comment out profile-related code since login is not required anymore
  // const { profile, setProfile, loading: profileLoading } = useProfile(user?.id);

  // Comment out date checking functions since we don't need daily limits
  /*
  function isSameLocalDate(dateA: Date, dateB: Date) {
    return (
      dateA.getFullYear() === dateB.getFullYear() &&
      dateA.getMonth() === dateB.getMonth() &&
      dateA.getDate() === dateB.getDate()
    );
  }

  function getNextLocalMidnight() {
    const now = new Date();
    const midnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + 1, // tomorrow
      0,
      0,
      0,
      0
    );
    return midnight;
  }
  */

  const validateFile = (file: File): boolean => {
    const validTypes = ["video/mp4", "video/quicktime"];
    const maxSize = 200 * 1024 * 1024; // 200MB

    if (!validTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload an MP4 or MOV file",
        variant: "destructive",
      });
      return false;
    }

    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Maximum file size is 200MB",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const getVideoInfo = (
    file: File
  ): Promise<{ duration: number; resolution: string }> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        const duration = Math.round(video.duration);
        const resolution = `${video.videoWidth}x${video.videoHeight}`;
        resolve({ duration, resolution });
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (!validateFile(file)) return;

    // ✅ FULL RESET BEFORE NEW VIDEO
    if (extractedFrame) {
      URL.revokeObjectURL(extractedFrame);
    }

    setExtractedFrame(null);
    setVideoFile(null);
    setVideoInfo(null);
    setUploadProgress(0);

    // ✅ Let React flush state first
    setTimeout(async () => {
      setVideoFile(file);

      const info = await getVideoInfo(file);
      setVideoInfo(info);

      // simulate progress
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        setUploadProgress(progress);
        if (progress >= 100) clearInterval(progressInterval);
      }, 80);

      toast({
        title: "Video uploaded",
        description: `Duration: ${info.duration}s, Resolution: ${info.resolution}`,
      });
    }, 50);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }

    e.target.value = "";
  };

  const extractFrame = async () => {
    // Remove user/profile check since everyone can use it
    if (isProcessing || !videoFile) return;

    // Comment out all daily limit checking logic
    /*
    const now = new Date();
    let usageCount = profile.usage_count;
    let shouldSetNewTimestamp = false;

    if (!profile.last_extraction) {
      // First extraction ever
      usageCount = 0;
      shouldSetNewTimestamp = true;
    } else {
      const last = new Date(profile.last_extraction);

      if (!isSameLocalDate(now, last)) {
        // New day → reset usage
        usageCount = 0;
        shouldSetNewTimestamp = true;
      }
    }

    const nextMidnight = getNextLocalMidnight();
    const nextResetTimeLocal = nextMidnight.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    // 2025-12-03 13:23:56.697+00
    if (usageCount >= profile.usage_limit) {
      toast({
        title: "Limit Reached",
        description: `You have used all free extractions for today. Come again tomorrow at ${nextResetTimeLocal}.`,
        variant: "destructive",
      });
      return;
    }
    */

    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("video", videoFile);

      const response = await fetch(
        "https://floframe.app/api/extract-last-frame",
        { method: "POST", body: formData }
      );

      if (!response.ok) throw new Error("Extraction failed");

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setExtractedFrame(url);

      // Comment out profile update since no login required
      /*
      const { data, error } = await supabase
        .from("profiles")
        .update({
          usage_count: usageCount + 1,
          ...(shouldSetNewTimestamp && {
            last_extraction: new Date().toISOString(),
          }),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (!error && data) {
        setProfile(data);
      }
      */
    } catch (error: any) {
      toast({
        title: "Extraction Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const downloadFrame = async () => {
    if (!extractedFrame) return;

    try {
      const blob = await (await fetch(extractedFrame)).blob();
      const fileName = `floframe-${Date.now()}.png`;

      if (isIOS) {
        // On iOS, we do NOT download automatically
        toast({
          title: "iOS Device Detected",
          description:
            "Press and hold the image above, then select 'Save to Photos'.",
        });
        return;
      }

      // Android + Desktop: standard download
      const link = document.createElement("a");
      link.href = extractedFrame;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      resetState();
    } catch (err: any) {
      console.error(err);
      toast({
        title: "Download Failed",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const resetState = () => {
    if (extractedFrame) {
      URL.revokeObjectURL(extractedFrame);
    }

    setExtractedFrame(null);
    setVideoFile(null);
    setVideoInfo(null);
    setUploadProgress(0);
  };

  useEffect(() => {
    if (!videoFile) return;
    if (uploadProgress !== 100) return;
    if (isProcessing) return;
    if (extractedFrame) return;
    if (hasTriggeredRef.current) return;

    hasTriggeredRef.current = true;
    extractFrame();
  }, [uploadProgress, videoFile, extractedFrame, isProcessing]);

  // Comment out the midnight reset effect since no daily limits
  /*
  useEffect(() => {
    if (!profile || !user || !profile.last_extraction) return;

    const interval = setInterval(async () => {
      const now = new Date();
      const last = new Date(profile.last_extraction);

      const isNewDay = !isSameLocalDate(now, last);

      if (isNewDay) {
        const { data, error } = await supabase
          .from("profiles")
          .update({
            usage_count: 0,
            ...(profile.usage_count > 0 && {
              last_extraction: now.toISOString(),
            }),
          })
          .eq("id", user.id)
          .select()
          .single();

        if (!error && data) {
          setProfile(data);
          console.log("🌙 Midnight reset completed");
        }
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [profile?.last_extraction, profile?.usage_count, user?.id]);
  */

  useEffect(() => {
    hasTriggeredRef.current = false;
  }, [videoFile]);

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="container mx-auto px-4 py-6 max-w-[600px]">
          <div className="space-y-6">
            {/* Logo Header */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-primary rounded-xl flex items-center justify-center">
                <div className="w-16 h-16 flex items-center justify-center transition-transform group-hover:scale-105">
                  <img src={logo} alt="" />
                </div>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-foreground">
                FloFrame
                {/* Comment out subscription display since no login required */}
                {/* 
                {subscription && subscription.plan === "paid" && (
                  <p className="text-primary text-sm p-0 font-bold">Premium</p>
                )}
                */}
              </h1>
            </div>

            {/* Comment out daily limit display since everyone has unlimited access */}
            {/* 
            {profile && profile.usage_limit <= 20 && (
              <div className="text-center text-sm text-muted-foreground mb-2">
                {profile.usage_count < profile.usage_limit ? (
                  <>
                    Remaining Extractions Today:{" "}
                    <span className="text-primary font-semibold">
                      {profile.usage_limit - profile.usage_count}
                    </span>
                    /{profile.usage_limit}
                  </>
                ) : (
                  <span className="text-red-500 font-semibold">
                    Daily limit reached
                  </span>
                )}
              </div>
            )}
            */}

            {/* Display message about free unlimited access */}
            {/* <div className="text-center text-sm text-muted-foreground mb-2">
              <span className="text-primary font-semibold">
                Free unlimited extractions for everyone!
              </span>
            </div> */}

            <div
              className={`border-2 cursor-pointer hover:border-primary transition-all ease-in-out 1s border-border bg-card rounded-2xl p-4 ${
                isProcessing ? "cursor-not-allowed opacity-20" : ""
              }`}
              onClick={() =>
                document.getElementById("videoUploadInput")?.click()
              }>
              <h2 className="mb-0 text-xl sm:text-2xl font-bold text-center text-foreground">
                Upload Video
              </h2>
            </div>
            <input
              id="videoUploadInput"
              type="file"
              accept="video/mp4,video/quicktime"
              className="hidden"
              onChange={handleFileInput}
              disabled={isProcessing}
            />

            {/* Drag & Drop Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-border/50"
              }`}>
              <input
                type="file"
                accept="video/mp4,video/quicktime"
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={!!videoFile}
              />

              <div
                className={`flex flex-row items-start justify-center text-center space-y-2  ${
                  videoFile?.name ? "break-all" : undefined
                }`}>
                <p className="text-xl sm:text-2xl text-muted-foreground m-0 ">
                  {videoFile
                    ? videoFile.name
                    : "Drop your MP4 or MOV file here"}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            {videoFile && uploadProgress !== 0 && !extractedFrame && (
              <div className="space-y-1">
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xl text-muted-foreground">
                  {uploadProgress}%
                </p>
              </div>
            )}

            {/* Image Preview */}
            {extractedFrame && (
              <div className="border-2 border-border bg-card p-3 rounded-2xl overflow-hidden">
                <div className="overflow-hidden flex items-center justify-center rounded-xl">
                  <img
                    src={extractedFrame}
                    alt="Extracted frame"
                    className="w-full h-auto object-contain"
                  />
                </div>
                {isIOS && (
                  <p className="text-sm font-semibold text-muted-foreground mt-2 text-center">
                    Press and hold the image to save it to Photos
                  </p>
                )}
              </div>
            )}

            {videoFile && uploadProgress >= 100 && (
              <div className="space-y-4">
                {isProcessing ? (
                  <Button className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 rounded-2xl">
                    Processing...
                  </Button>
                ) : extractedFrame && !isIOS ? (
                  <Button
                    onClick={downloadFrame}
                    className="w-full h-16 text-xl font-bold bg-primary hover:bg-primary/90 rounded-2xl">
                    Save
                  </Button>
                ) : null}
              </div>
            )}

            {/* {extractedFrame && (
              <>
                <LikeFloFrame />
                <FloFrameFeedback />
              </>
            )} */}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Upload;
