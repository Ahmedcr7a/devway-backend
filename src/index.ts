import { Elysia } from "elysia";
import cors from "@elysiajs/cors";
import { getProfilesHandler, deleteProfileHandler, getProfileByIdHandler, updatePasswordHandler } from "./routes/getProfiles";
import { registerHandler } from "./routes/register";
import { loginHandler } from "./routes/login";
import { examsRoutes } from "./routes/exams";
import { questionsRoutes } from "./routes/questions";
import { resultsRoutes } from "./routes/resultRoutes";
import { attachmentsRoutes } from "./routes/attachments";
import { adminsRoutes } from "./routes/admins";

const PORT = process.env.PORT || 3000;

const app = new Elysia();

app.use(cors({ origin: "*" }));

// Profiles
app.get("/profiles", getProfilesHandler);
deleteProfileHandler(app);
getProfileByIdHandler(app);
updatePasswordHandler(app);

app.post("/register", registerHandler);
app.post("/login", loginHandler);

examsRoutes(app);
questionsRoutes(app);
resultsRoutes(app);
attachmentsRoutes(app);
adminsRoutes(app);

app.listen(PORT);
console.log("🚀 Backend running on http://localhost:3000");
