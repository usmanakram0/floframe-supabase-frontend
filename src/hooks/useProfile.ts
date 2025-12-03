import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export const useProfile = (userId: string | null) => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (!error) setProfile(data);
      setLoading(false);
    };

    fetchProfile();
  }, [userId]);

  return { profile, loading, setProfile };
};
