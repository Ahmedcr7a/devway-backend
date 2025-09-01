import { t } from "elysia";
import { supabase } from "../../supabase";

export const examsRoutes = (app: any) => {
    // إضافة اختبار
    app.post("/exams", async ({ body, set }) => {
        const { title, mark_per_question, duration, start_time, end_time, status } = body;

        const { data, error } = await supabase.from("exams").insert([
            { title, mark_per_question, duration, start_time, end_time, status },
        ]).select();

        if (error) {
            set.status = 400;
            return { error: error.message };
        }

        return { message: "Exam created", exam: data[0] };
    }, {
        body: t.Object({
            title: t.String(),
            mark_per_question: t.Number(),
            duration: t.Number(),
            start_time: t.String(),
            end_time: t.String(),
            status: t.Boolean()
        })
    });

    // تعديل اختبار
    app.put("/exams/:id", async ({ params, body, set }) => {
        const { id } = params;

        const { data, error } = await supabase
            .from("exams")
            .update(body)
            .eq("id", id)
            .select();

        if (error) {
            set.status = 400;
            return { error: error.message };
        }

        return { message: "Exam updated", exam: data[0] };
    });

    // جلب كل الاختبارات
    app.get("/exams", async () => {
        const { data, error } = await supabase.from("exams").select("*");
        if (error) return { error: error.message };
        return data;
    });

    // جلب اختبار واحد حسب الـ id
    app.get("/exams/:id", async ({ params, set }) => {
        const { id } = params;

        const { data, error } = await supabase
            .from("exams")
            .select("*")
            .eq("id", id)
            .single(); // يجيب عنصر واحد فقط

        if (error) {
            set.status = 400;
            return { error: error.message };
        }

        return data;
    });


    // حذف اختبار
    app.delete("/exams/:id", async ({ params, set }) => {
        const { id } = params;

        const { error } = await supabase
            .from("exams")
            .delete()
            .eq("id", id);

        if (error) {
            set.status = 400;
            return { error: error.message };
        }

        return { message: "Exam deleted" };
    });

};
