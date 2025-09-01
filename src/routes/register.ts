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

  const { data: lastProfile } = await supabase
    .from("profiles")
    .select("student_code")
    .order("id", { ascending: false })
    .limit(1);

  let nextNumber = 1001;
  if (lastProfile && lastProfile.length > 0) {
    const lastCode = lastProfile[0].student_code;
    const lastNumber = parseInt(lastCode?.split("-")[1] || "1000", 10);
    nextNumber = lastNumber + 1;
  }

  const student_code = `ST-${nextNumber}`;

  const { error } = await supabase.from("profiles").insert([
    {
      full_name,
      email,
      phone,
      password: hashedPassword,
      role: "user",
      student_code
    }
  ]);

  if (error) return { error: error.message };

  return { message: "Account created successfully", student_code };
}
