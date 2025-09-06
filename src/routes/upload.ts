import { Elysia } from "elysia";
import { supabase } from "../../supabase";

export const uploadRoutes = (app: Elysia) => {
    app.post("/upload", async ({ body }) => {
        const formData = body as FormData;
        const file = formData.get("file") as File;

        if (!file) {
            return { success: false, message: "مفيش ملف مرفوع" };
        }

        const fileName = `${Date.now()}_${file.name}`;
        const { data, error } = await supabase.storage
            .from("student-ids")
            .upload(fileName, file);

        if (error) {
            return { success: false, message: error.message };
        }

        const { data: { publicUrl } } = supabase.storage
            .from("student-ids")
            .getPublicUrl(fileName);

        return { success: true, url: publicUrl };
    });
};
