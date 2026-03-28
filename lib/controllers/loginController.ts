import { supabase } from "../config/supabaseClient";
import { User, Session } from "@supabase/supabase-js";

type LoginResponse = {
  data: {
    user: User;
    session: Session;
  } | null;
  error: string | null;
};

const login = async (
  email: string,
  password: string,
): Promise<LoginResponse> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      switch (error.message) {
        case "Invalid login credentials":
          return { data: null, error: "Invalid email or password" };

        case "Email not confirmed":
          return { data: null, error: "Please verify your email first" };

        default:
          return { data: null, error: "Authentication failed" };
      }
    }

    return {
      data: {
        user: data.user,
        session: data.session,
      },
      error: null,
    };
  } catch (err) {
    console.error(err);
    return {
      data: null,
      error: "Something went wrong. Please check your connection.",
    };
  }
};

export default login;
