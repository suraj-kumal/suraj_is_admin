import { supabase } from "../config/supabaseClient";

export const authChecker = async (): Promise<boolean> => {
  try {
    const { data } = await supabase.auth.getUser();

    if (!data.user) {
      await supabase.auth.signOut();
      return false;
    }

    return true;
  } catch (err) {
    console.error("Auth check failed:", err);
    await supabase.auth.signOut();
    return false;
  }
};
