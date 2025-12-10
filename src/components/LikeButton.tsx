import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const LikeFloFrame = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const checkLike = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("app_likes")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) setLiked(true);
  };

  const handleLike = async () => {
    if (!user || liked) return;

    setLoading(true);

    const { error } = await supabase.from("app_likes").insert({
      user_id: user.id,
      user_email: user.email,
      liked: true,
    });

    if (!error) {
      setLiked(true);

      await fetch(`${SUPABASE_URL}/functions/v1/send-feedback-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "like",
          userEmail: user.email,
          userId: user.id,
        }),
      });

      toast({ title: "Thanks for the love! ❤️" });
    }

    setLoading(false);
  };

  useEffect(() => {
    checkLike();
  }, [user]);

  return (
    <div className="flex justify-center">
      <Button
        onClick={handleLike}
        disabled={liked || loading}
        className="rounded-full px-6 text-sm font-semibold">
        {liked ? "Thanks! ❤️" : "👍 I like FloFrame"}
      </Button>
    </div>
  );
};
