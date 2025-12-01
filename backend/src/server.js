import express from "express";
import { ENV } from "./lib/env.js";
import authRoutes from "./routes/auth.route.js";
import messagesRoutes from "./routes/messages.route.js";
import path from "path";
import { connectDB } from "./lib/db.js";
import cookieParser from "cookie-parser";

const app = express();
const __dirname = path.resolve();

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);

// if (ENV.NODE_ENV === "production") {
if (ENV.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
  });
} else {
  // Simple root route in development to indicate backend is running.
  app.get("/", (req, res) => {
    res.send(
      "Backend running. Start Vite dev server in frontend or build to serve static files."
    );
  });
}
// }

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
  connectDB();
});
