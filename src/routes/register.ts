import { supabase } from "../../supabase";
import bcrypt from "bcryptjs";

export async function registerHandler({ body }: any) {
  const { full_name, email, password, confirm_password, phone } = body;

  if (!full_name || !email || !password || !confirm_password || !phone) {
    return { error: "All fields are required" };
  }

  if (password !== confirm_password) {
    return { error: "Passwords do not match" };
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // 1. أضف اليوزر الأول بدون student_code
  const { data: profile, error: insertError } = await supabase
    .from("profiles")
    .insert([
      {
        full_name,
        email,
        phone,
        password: hashedPassword,
        role: "user",
      },
    ])
    .select("id")
    .single();

  if (insertError) return { error: insertError.message };

  // 2. ولّد student_code من الـ id الفريد
  const student_code = `ST-${profile.id}`;

  // 3. عدّل الحساب وأضف student_code
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ student_code })
    .eq("id", profile.id);

  if (updateError) return { error: updateError.message };

  return { message: "Account created successfully", student_code };
}
