import "dotenv/config";
import { createApp } from "./createApp";

const app = createApp();

const PORT = process.env.PORT || 3001;
const server = app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});

const gracefulShutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export default app;
