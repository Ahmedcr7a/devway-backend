import { Elysia } from "elysia";
import { supabase } from "../../supabase";

export const uploadRoutes = (app: Elysia) => {
    app.post("/upload", async ({ body }) => {
        try {
            const file = (body as any).file as File;

            if (!file) {
                return { success: false, message: "مفيش ملف مرفوع" };
            }

            // تحديد الامتداد من نوع الملف
            const ext = file.type.split("/")[1] || "bin";
            const fileName = `${Date.now()}.${ext}`;

            // تحويل الملف إلى Uint8Array بدل Buffer
            const uint8Array = new Uint8Array(await file.arrayBuffer());

            // رفع الملف إلى Supabase
            const { data, error } = await supabase.storage
                .from("student-ids")
                .upload(fileName, uint8Array, {
                    contentType: file.type || "application/octet-stream",
                });

            if (error) {
                return { success: false, message: error.message };
            }

            const {
                data: { publicUrl },
            } = supabase.storage.from("student-ids").getPublicUrl(fileName);

            return { success: true, url: publicUrl };
        } catch (err: any) {
            return { success: false, message: err.message || "حصل خطأ في الرفع" };
        }
    });
};
