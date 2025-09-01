// routes/admins.ts
import { supabase } from "../../supabase";
import bcrypt from "bcryptjs";


export const adminsRoutes = (app: any) => {

    // GET all admins
    app.get("/admins", async () => {
        const { data, error } = await supabase
            .from("admins")
            .select("id, name, phone, email, created_at");

        if (error) return { error: error.message };
        return { admins: data };
    });

    // GET admin by ID
    app.get("/admins/:id", async ({ params }) => {
        const { id } = params;
        const { data, error } = await supabase
            .from("admins")
            .select("id, name, phone, email, created_at")
            .eq("id", id)
            .single();

        if (error) return { error: error.message };
        if (!data) return { error: "Admin not found" };

        return { admin: data };
    });

    // ADD new admin
    app.post("/admins", async ({ body }) => {
        const { name, phone, email, password } = body;

        if (!name || !phone || !email || !password) {
            return { error: "All fields are required" };
        }

        // فحص إذا كان البريد موجود بالفعل
        const { data: existingAdmins, error: fetchError } = await supabase
            .from("admins")
            .select("id")
            .eq("email", email);

        if (fetchError) {
            return { error: fetchError.message };
        }

        if (existingAdmins && existingAdmins.length > 0) {
            return { error: "Admin with this email already exists" };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const { error } = await supabase
            .from("admins")
            .insert([{ name, phone, email, password: hashedPassword, created_at: new Date() }]);

        if (error) return { error: error.message };

        return { message: "Admin added successfully" };
    });


    // UPDATE admin (including password if provided)
    app.put("/admins/:id", async ({ params, body }) => {
        const { id } = params;
        const { name, phone, email, password } = body;

        const updateData: any = { name, phone, email };
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        const { error } = await supabase
            .from("admins")
            .update(updateData)
            .eq("id", id);

        if (error) return { error: error.message };
        return { message: "Admin updated successfully" };
    });

    // DELETE admin
    app.delete("/admins/:id", async ({ params }) => {
        const { id } = params;
        const { error } = await supabase.from("admins").delete().eq("id", id);

        if (error) return { error: error.message };
        return { message: "Admin deleted successfully" };
    });


    app.post("/admin-login", async ({ body }) => {
        const { email, password } = body;

        if (!email || !password) {
            return { error: "Email and password required" };
        }

        // البحث عن الأدمن
        const { data: admin, error } = await supabase
            .from("admins")
            .select("*")
            .eq("email", email)
            .single();

        if (error || !admin) return { error: "Admin not found" };

        // مقارنة الباسورد
        const isValid = await bcrypt.compare(password, admin.password);
        if (!isValid) return { error: "Incorrect password" };

        // ارجع بيانات الأدمن بدون كلمة المرور، مع إضافة role
        const { password: _, ...adminData } = admin;
        return { admin: { ...adminData, role: "admin" } };
    });

};
