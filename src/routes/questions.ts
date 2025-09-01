import { t } from "elysia";
import { supabase } from "../../supabase";

export const questionsRoutes = (app: any) => {
    // إضافة سؤال
    app.post("/questions", async ({ body, set }) => {
        const { exam_id, content, option_a, option_b, option_c, option_d, correct_option } = body;

        const { data, error } = await supabase.from("questions").insert([
            { exam_id, content, option_a, option_b, option_c, option_d, correct_option },
        ]).select();

        if (error) {
            set.status = 400;
            return { error: error.message };
        }

        return { message: "Question added", question: data[0] };
    }, {
        body: t.Object({
            exam_id: t.String(),
            content: t.String(),
            option_a: t.String(),
            option_b: t.String(),
            option_c: t.String(),
            option_d: t.String(),
            correct_option: t.String()
        })
    });

    // تعديل سؤال
    app.put("/questions/:id", async ({ params, body, set }) => {
        const { id } = params;

        const { data, error } = await supabase
            .from("questions")
            .update(body)
            .eq("id", id)
            .select();

        if (error) {
            set.status = 400;
            return { error: error.message };
        }

        return { message: "Question updated", question: data[0] };
    });

    // حذف سؤال
    app.delete("/questions/:id", async ({ params, set }) => {
        const { id } = params;

        const { error } = await supabase
            .from("questions")
            .delete()
            .eq("id", id);

        if (error) {
            set.status = 400;
            return { error: error.message };
        }

        return { message: "Question deleted" };
    });


    // جلب أسئلة اختبار
    app.get("/exams/:id/questions", async ({ params }) => {
        const { id } = params;
        const { data, error } = await supabase.from("questions").select("*").eq("exam_id", id);

        if (error) return { error: error.message };
        return data;
    });
};
