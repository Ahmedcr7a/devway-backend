import { supabase } from "../../supabase";
import bcrypt from "bcryptjs";


export const getProfilesHandler = async () => {
  const { data, error } = await supabase.from("profiles").select("*");
  if (error) return { error: error.message };
  return { profiles: data };
};

export const deleteProfileHandler = (app: any) => {
  app.delete("/profiles/:id", async ({ params }) => {
    const { id } = params;

    const { error } = await supabase.from("profiles").delete().eq("id", id);

    if (error) {
      return { error: error.message };
    }

    return { message: "Profile deleted successfully" };
  });
};

export const getProfileByIdHandler = (app: any) => {
  app.get("/profiles/:id", async ({ params }) => {
    const { id } = params;

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single(); // 

    if (error) {
      return { error: error.message };
    }

    if (!data) {
      return { error: "Profile not found" };
    }

    return { profile: data };
  });
};


export const updatePasswordHandler = (app: any) => {
  app.put("/profiles/:id/password", async ({ params, body }) => {
    const { id } = params;
    const { old_password, new_password } = body;

    if (!old_password || !new_password) {
      return { error: "Old and new passwords are required" };
    }

    const { data: user, error: fetchError } = await supabase
      .from("profiles")
      .select("password")
      .eq("id", id)
      .single();

    if (fetchError) {
      return { error: fetchError.message };
    }

    if (!user) {
      return { error: "User not found" };
    }


    const isMatch = await bcrypt.compare(old_password, user.password);
    if (!isMatch) {
      return { error: "Old password is incorrect" };
    }


    const hashedPassword = await bcrypt.hash(new_password, 10);


    const { error: updateError } = await supabase
      .from("profiles")
      .update({ password: hashedPassword })
      .eq("id", id);

    if (updateError) {
      return { error: updateError.message };
    }

    return { message: "Password updated successfully" };
  });
};


