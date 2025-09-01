// routes/attachments.ts
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config();

const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const attachmentsRoutes = (app: any) => {
    // رفع ملف جديد
    app.post("/attachments", async ({ request }: any) => {
        const form = await request.formData();
        const file = form.get("file") as File;
        const sessionNumber = form.get("sessionNumber") as string;
        const category = form.get("category") as string;
        const title = form.get("title") as string;
        const description = form.get("description") as string;

        if (!file) return { error: "No file provided" };

        const fileName = `${Date.now()}-${file.name}`;

        const { error: uploadError } = await supabaseAdmin.storage
            .from("attachments")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) return { error: uploadError.message };

        const { data } = supabaseAdmin.storage
            .from("attachments")
            .getPublicUrl(fileName);

        const fileUrl = data.publicUrl;

        const { error: dbError } = await supabaseAdmin
            .from("attachments")
            .insert([
                {
                    sessionNumber,
                    category,
                    title,
                    description,
                    fileUrl,
                },
            ]);

        if (dbError) return { error: dbError.message };

        return { url: fileUrl, message: "File uploaded and recorded successfully" };
    });

    // جلب كل البيانات
    app.get("/attachments", async () => {
        const { data, error } = await supabaseAdmin
            .from("attachments")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) return { error: error.message };

        return { attachments: data };
    });

    // حذف ملف
    app.delete("/attachments/:id", async ({ params }: any) => {
        const { id } = params;

        // أولًا نجلب رابط الملف
        const { data: rowData, error: fetchError } = await supabaseAdmin
            .from("attachments")
            .select("fileUrl")
            .eq("id", id)
            .single();

        if (fetchError) return { error: fetchError.message };
        if (!rowData) return { error: "Attachment not found" };

        // استخراج اسم الملف من الرابط
        const fileUrl: string = rowData.fileUrl;
        const fileName = fileUrl.split("/").pop()!;

        // حذف الملف من bucket
        const { error: deleteFileError } = await supabaseAdmin
            .storage
            .from("attachments")
            .remove([fileName]);

        if (deleteFileError) return { error: deleteFileError.message };

        // حذف الصف من الجدول
        const { error: dbError } = await supabaseAdmin
            .from("attachments")
            .delete()
            .eq("id", id);

        if (dbError) return { error: dbError.message };

        return { message: "Attachment deleted successfully" };
    });
};
