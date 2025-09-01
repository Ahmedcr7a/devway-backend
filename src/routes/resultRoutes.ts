import { t } from "elysia";
import { supabase } from "../../supabase";

export const resultsRoutes = (app: any) => {

    // جلب كل نتائج الطلاب لاختبار معين
    app.get("/exams/:id/results", async ({ params }) => {
        const { id } = params;

        const { data, error } = await supabase
            .from("exam_results")
            .select("*, profiles(full_name, email)")
            .eq("exam_id", id);

        if (error) return { error: error.message };
        return data;
    });

    // جلب نتيجة طالب معين لاختبار معين من جدول exam_submissions
    app.get("/exams/:id/results/:user_id", async ({ params, set }) => {
        const { id: exam_id, user_id } = params;

        try {
            // جلب ملخص نتيجة الطالب
            const { data, error } = await supabase
                .from("exam_submissions")
                .select("*, exams(title, mark_per_question)")
                .eq("exam_id", exam_id)
                .eq("user_id", user_id)
                .single(); // واحد بس لكل طالب لكل امتحان

            if (error || !data) {
                set.status = 404;
                return { error: error?.message || "Result not found" };
            }

            return data;

        } catch (err: any) {
            set.status = 500;
            return { error: err.message || "Server error" };
        }
    });


    // تقديم إجابات الامتحان وحساب النتيجة
    app.post("/exams/:id/submit", async ({ params, body, set }) => {
        const { id: exam_id } = params;
        const { user_id, answers } = body;

        if (!user_id || !answers || !Array.isArray(answers)) {
            set.status = 400;
            return { error: "user_id and answers are required" };
        }

        try {
            // منع تقديم الامتحان أكثر من مرة
            const { data: existing, error: existError } = await supabase
                .from("exam_submissions")
                .select("id")
                .eq("exam_id", exam_id)
                .eq("user_id", user_id);

            if (existError) {
                set.status = 500;
                return { error: existError.message };
            }

            if (existing && existing.length > 0) {
                set.status = 400;
                return { error: "You have already submitted this exam" };
            }

            // جلب أسئلة الامتحان
            const { data: questions, error: qError } = await supabase
                .from("questions")
                .select("*")
                .eq("exam_id", exam_id);

            if (qError || !questions) {
                set.status = 400;
                return { error: qError?.message || "Cannot fetch questions" };
            }

            // جلب علامة السؤال
            const { data: examInfo, error: examError } = await supabase
                .from("exams")
                .select("mark_per_question")
                .eq("id", exam_id)
                .single();

            if (examError || !examInfo) {
                set.status = 400;
                return { error: examError?.message || "Cannot fetch exam info" };
            }

            const mark_per_question = examInfo.mark_per_question;

            let score = 0;
            const resultsToInsert = answers.map(ans => {
                const question = questions.find(q => q.id === ans.question_id);
                const is_correct = question?.correct_option === ans.selected_option;
                if (is_correct) score += mark_per_question;

                return {
                    exam_id,
                    user_id,
                    question_id: ans.question_id,
                    selected_option: ans.selected_option,
                    is_correct
                };
            });

            // حفظ الإجابات في exam_results
            const { data: resultsData, error: resultsError } = await supabase
                .from("exam_results")
                .insert(resultsToInsert)
                .select();

            if (resultsError) {
                set.status = 400;
                return { error: resultsError.message };
            }

            const totalMarks = questions.length * mark_per_question;
            const percentage = Math.round((score / totalMarks) * 100);

            // حفظ ملخص النتيجة في exam_submissions
            const { data: submissionData, error: submissionError } = await supabase
                .from("exam_submissions")
                .insert([{
                    exam_id,
                    user_id,
                    score,
                    total_marks: totalMarks,
                    percentage
                }])
                .select();

            if (submissionError) {
                set.status = 400;
                return { error: submissionError.message };
            }

            return {
                message: "Exam submitted successfully",
                score,
                total: totalMarks,
                percentage,
                results: resultsData,
                submission: submissionData[0]
            };

        } catch (err: any) {
            set.status = 500;
            return { error: err.message || "Server error" };
        }
    }, {
        body: t.Object({
            user_id: t.String(),
            answers: t.Array(
                t.Object({
                    question_id: t.String(),
                    selected_option: t.Enum({ a: "a", b: "b", c: "c", d: "d" })
                })
            )
        })
    });



};
