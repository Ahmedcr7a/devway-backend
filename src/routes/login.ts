import { supabase } from "../../supabase";
import bcrypt from "bcryptjs";


export async function loginHandler({ body }: any) {
  const { email, password } = body;

  if (!email || !password) return { error: "Email and password required" };

  // البحث عن المستخدم
  const { data: user, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !user) return { error: "User not found" };

  // مقارنة الباسورد
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return { error: "Incorrect password" };

  // ارجع بيانات المستخدم بدون كلمة المرور
  const { password: _, ...userData } = user;

  return { user: userData };
}
