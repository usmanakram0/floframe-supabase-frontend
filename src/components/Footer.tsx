import { Edit } from "lucide-react"; // You'll need to install lucide-react if not already
import tiktok_icon from "@/assets/tik-tok.png";
import reddit_icon from "@/assets/reddit.png";
import youtube_icon from "@/assets/youtube.png";
import instagram_icon from "@/assets/instagram.png";
import twitter_icon from "@/assets/twitter.png";

// If TikTok icon is not available in lucide-react, you can use this alternative:
// import { MessageSquare, Twitter, Instagram, Youtube, Reddit } from 'lucide-react';

export function Footer() {
  const socialLinks = [
    {
      name: "X",
      icon: <img src={twitter_icon} alt="Twitter" className="h-5 w-5" />,
      url: "https://x.com/floframeapp?s=11&t=TwpG7GXLsNrZLuhhPFl4zQ",
    },
    {
      name: "TikTok",
      icon: <img src={tiktok_icon} alt="TikTok" className="h-5 w-5" />,
      url: "https://www.tiktok.com/@floframeapp?_r=1&_t=ZT-92iyJ3VKVjb",
    },
    {
      name: "Instagram",
      icon: <img src={instagram_icon} alt="Instagram" className="h-5 w-5" />,
      url: "https://www.instagram.com/floframeapp?igsh=MTNycHl0cHBiajRneQ%3D%3D&utm_source=qr",
    },
    {
      name: "YouTube",
      icon: <img src={youtube_icon} alt="YouTube" className="h-5 w-5" />,
      url: "https://youtube.com/@floframeapp?si=190WhJatPV-wwqHG",
    },
    {
      name: "Reddit",
      icon: <img src={reddit_icon} alt="Reddit" className="h-5 w-5" />,
      url: "https://www.reddit.com/u/FloFrameApp/s/jPtcVj2VWq",
    },
  ];

  return (
    <footer className="border-t bg-background fixed w-full bottom-0">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-row flex-wrap-reverse justify-center sm:justify-between items-center gap-3 md:gap-6">
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} FloFrame. All rights reserved.
            </p>
          </div>
          <div className="flex items-center gap-6">
            {socialLinks.map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-muted-foreground hover:text-foreground`}
                aria-label={`Visit our ${link.name} page`}>
                {link.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
