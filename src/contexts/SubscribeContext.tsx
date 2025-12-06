import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/contexts/AuthContext";

type Subscription = {
  plan: string;
  subscription_status: string;
  billing_interval?: string;
};

type SubscribeContextType = {
  subscription: Subscription | null;
  loading: boolean;
  refresh: () => void;
};

const SubscribeContext = createContext<SubscribeContextType>({
  subscription: null,
  loading: true,
  refresh: () => {},
});

export const SubscribeProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscription = async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await supabase
        .from("profiles")
        .select("plan, subscription_status, billing_interval")
        .eq("id", user.id)
        .single();

      if (res.data) setSubscription(res.data);
      else setSubscription(null);
    } catch (err) {
      console.error("Error fetching subscription:", err);
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [user]);

  return (
    <SubscribeContext.Provider
      value={{ subscription, loading, refresh: fetchSubscription }}>
      {children}
    </SubscribeContext.Provider>
  );
};

export const useSubscribe = () => useContext(SubscribeContext);
