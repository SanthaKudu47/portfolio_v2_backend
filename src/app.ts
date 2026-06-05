import express from "express";
import { keyStatus } from "./oRouter/client.ts";
import { errorHandler } from "./errorHandler/errorHandler.ts";
import { appConfig, initialize } from "./config/config.ts";
import {
  getLanguages,
  getReadme,
  getRepoList,
  getFileTree,
  getFile,
} from "./github/github.ts";
import { buildTree, sendResponse } from "./helper/helper.ts";
import { headerValidator } from "./middleware/headerValidator.ts";
import type { RequestWithContext } from "./types/appTypes.ts";
import { toolManager } from "./tools/tools.ts";
import { chat } from "./groq/client.ts";
import { UserMessageSchema } from "./validation/validationSchema.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(headerValidator);
app.use(errorHandler);

console.log(process.env.OPENROUTER_API_KEY);

app.post("/chats", async function (request, res) {
  const req = request as RequestWithContext;
  const { message } = req.body;
  const result = UserMessageSchema.safeParse({ message: message });
  if (!result.success) {
    const zodErrorMessage = result.error.issues[0].message;
    console.log(result.error.issues[0].message);
    sendResponse(res, null, false, zodErrorMessage, 400);
    return;
  }
  const reply = await chat(message, req.sessionId);
  sendResponse(res, reply, true, null, 200);
});

app.get("/get-repos", async function (req, res) {
  const data = await getRepoList(appConfig);
  res.json(data);
});

app.get("/readme", async function (req, res) {
  const data = await getReadme(appConfig, "dev_port");
  res.send(data);
});

app.get("/langs", async function (req, res) {
  const data = await getLanguages(appConfig, "dev_port");
  res.send(data);
});

app.get("/files", async function (req, res) {
  const files = await getFileTree(appConfig, "dev_port", "main");
  res.json(buildTree(files.tree));
});

app.get("/file", async function (req, res) {
  await keyStatus();
  const file = await getFile(appConfig, "dev_port", "main", "src/App.tsx");
  res.send(file);
});

initialize();
app.listen(PORT, function (err: any) {
  if (err) {
    console.log("Failed to start Server");
    console.log(err);
    return;
  }

  console.log(`app listening on port ${PORT}`);
});
