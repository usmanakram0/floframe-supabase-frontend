import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const FloFrameFeedback = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  const sendFeedback = async () => {
    if (!message.trim() || !user) return;

    setSending(true);

    const { error } = await supabase.from("app_feedback").insert({
      user_id: user.id,
      user_email: user.email,
      message,
    });

    if (!error) {
      await fetch(`${SUPABASE_URL}/functions/v1/send-feedback-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "feedback",
          userEmail: user.email,
          userId: user.id,
          message,
        }),
      });

      setMessage("");
      setSubmitted(true);

      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve.",
      });
    }

    setSending(false);
  };

  if (submitted) return null; // ✅ Auto remove after send

  return (
    <Card className="max-w-md mx-auto mt-10">
      <CardContent className="space-y-4 p-4">
        <div className="text-center">
          <h3 className="font-bold text-lg">Feedback</h3>
          <p className="text-sm text-muted-foreground">
            Help us improve FloFrame
          </p>
        </div>

        <Textarea
          placeholder="Tell us what you think…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <Button onClick={sendFeedback} disabled={sending} className="w-full">
          Send
        </Button>
      </CardContent>
    </Card>
  );
};
