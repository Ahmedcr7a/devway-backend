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
        const { name, phone, tracks, studentIdUrl } = body as {
            name: string;
            phone: string;
            tracks: string[];
            studentIdUrl: string;
        };

        if (!name || !phone || !tracks || tracks.length === 0 || !studentIdUrl) {
            return { success: false, message: "البيانات ناقصة" };
        }

        const { data, error } = await supabase
            .from("registrations")
            .insert([{ name, phone, tracks, studentIdUrl }]);

        if (error) {
            return { success: false, message: error.message };
        }

        return { success: true, message: "تم التسجيل بنجاح", data };
    });
};
