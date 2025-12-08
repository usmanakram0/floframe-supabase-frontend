import { Navigation } from "@/components/Navigation";
import { useSettings } from "@/contexts/SettingsContext";

const About = () => {
  const { darkMode } = useSettings();

  return (
    <div className={darkMode ? "dark" : ""}>
      <div className="min-h-screen bg-background">
        <Navigation />

        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-foreground">
                About FloFrame
              </h1>
              <p className="text-xl text-muted-foreground">
                FloFrame is a simple, fast, and reliable tool for extracting the
                final frame from your videos. Whether you’re creating
                AI-generated scenes, designing storyboards, or capturing a clean
                reference image, FloFrame delivers a high-quality, uncompressed
                PNG in seconds.
              </p>
            </div>

            <div className="space-y-6 text-foreground">
              {/* Why FloFrame Exists */}
              <section className="space-y-3">
                <h2 className="text-2xl font-semibold">Why FloFrame Exists</h2>
                <p className="text-muted-foreground leading-relaxed">
                  AI video tools often struggle with continuity characters
                  shift, details change, and scenes fail to match from one clip
                  to the next. Final frame of a video is one of the most
                  important reference points creators use to maintain
                  consistency. FloFrame makes that crucial step effortless:
                  upload → extract → download.
                </p>
              </section>

              {/* Who It’s For */}
              <section className="space-y-3">
                <h2 className="text-2xl font-semibold">Who It’s For</h2>
                <p className="text-muted-foreground leading-relaxed">
                  FloFrame is designed for:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      AI video creators (Pika, Runway, Kling, Luma, etc.)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Storyboard artists</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Designers and animators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      Anyone needing the cleanest representation of a video’s
                      final moment
                    </span>
                  </li>
                </ul>
              </section>

              {/* Features / What FloFrame Does Today */}
              <section className="space-y-3">
                <h2 className="text-2xl font-semibold">
                  What FloFrame Does Today
                </h2>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Extracts the last frame from MP4 and MOV videos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      Outputs full-quality PNG files with zero compression
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Supports mobile and desktop</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>
                      Provides a simple, fast workflow for multiple consecutive
                      uploads
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Clears state automatically for each new upload</span>
                  </li>
                </ul>
              </section>

              {/* Future Roadmap */}
              <section className="space-y-3">
                <h2 className="text-2xl font-semibold">
                  Where FloFrame Is Going
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  FloFrame is in its early phase, but each update moves it
                  closer to becoming the standard continuity tool for AI
                  filmmaking. Upcoming milestones include:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Select-any-frame extraction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Timestamp-based extraction</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Smart scene continuity tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Integrated AI image/video generation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>User tiers and cloud history</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Automated workflow tools for creators</span>
                  </li>
                </ul>
                <p className="text-muted-foreground leading-relaxed mt-2">
                  Our vision is to make FloFrame the backbone of AI storytelling
                  — a tool that helps creators control details, preserve
                  consistency, and build seamless narratives.
                </p>
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default About;
