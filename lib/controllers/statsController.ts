import { supabase } from "../config/supabaseClient";

const StatsData = async () => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      console.log("No active session");
      return [];
    }

    const { data, error } = await supabase
      .from("portfolio_analytics")
      .select("date, visitors")
      .order("date", { ascending: true });

    if (error) throw error;

    // ✅ format for chart
    const formatted = data.map((item) => ({
      date: item.date,
      visitors: Number(item.visitors || 0),
    }));

    return formatted;
  } catch (e: any) {
    console.error("err:", e.message);
    return [];
  }
};

export default StatsData;
