import { Elysia } from "elysia";
import { supabase } from "../../supabase";

export const registrationsRoutes = (app: Elysia) => {
    // Get all registrations
    app.get("/registrations", async () => {
        const { data, error } = await supabase.from("registrations").select("*");
        if (error) {
            return { success: false, message: error.message };
        }
        return { success: true, data };
    });

    // Register new user
    app.post("/registrations", async ({ body }) => {
        const { name, phone, track, studentIdUrl } = body as {
            name: string;
            phone: string;
            track: string;
            studentIdUrl: string; // صورة الكارنية بعد الرفع
        };

        if (!name || !phone || !track || !studentIdUrl) {
            return { success: false, message: "البيانات ناقصة" };
        }

        const { data, error } = await supabase
            .from("registrations")
            .insert([{ name, phone, track, studentIdUrl }]);

        if (error) {
            return { success: false, message: error.message };
        }

        return { success: true, message: "تم التسجيل بنجاح", data };
    });
};
