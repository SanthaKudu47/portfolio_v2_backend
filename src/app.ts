import express from "express";
import { sendMessage } from "./oRouter/client.ts";
import { errorHandler } from "./errorHandler/errorHandler.ts";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(errorHandler);

console.log(process.env.OPENROUTER_API_KEY)

app.post("/chats", async function (req, res) {
  const message = req.body;
  const reply = await sendMessage("hi");
  res.send(reply);
});

if (!process.env.OPENROUTER_API_KEY) {
  console.log(
    " Error: OPENROUTER_API_KEY is not found in environment variables.",
  );
  process.exit(1);
}

app.listen(PORT, function (err: any) {
  if (err) {
    console.log("Failed to start Server");
    console.log(err);
    return;
  }

  console.log(`app listening on port ${PORT}`);
});
