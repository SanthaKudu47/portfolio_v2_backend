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
import { buildTree } from "./helper/helper.ts";
import type { ITree } from "./config/types.ts";
import { chat} from "./groq/client.ts";
import { headerValidator } from "./middleware/headerValidator.ts";
import type { RequestWithContext } from "./types/appTypes.ts";

const app = express();
const PORT = 3000;

app.use(express.json());

app.use(headerValidator);
app.use(errorHandler);

console.log(process.env.OPENROUTER_API_KEY);

app.post("/chats", async function (request, res) {
  const req = request as RequestWithContext;
  const { message } = req.body;
  const reply = await chat(message,req.sessionId);
  res.json(reply);
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

const data = [
  {
    path: "package.json",
    mode: "100644",
    type: "blob",
    sha: "15c0f5a0a66041505fdbee8808b95b35b1b422f7",
    size: 926,
    url: "https://api.github.com/repos/SanthaKudu47/dev_port/git/blobs/15c0f5a0a66041505fdbee8808b95b35b1b422f7",
  },
  {
    path: "postcss.config.js",
    mode: "100644",
    type: "blob",
    sha: "2e7af2b7f1a6f391da1631d93968a9d487ba977d",
    size: 80,
    url: "https://api.github.com/repos/SanthaKudu47/dev_port/git/blobs/2e7af2b7f1a6f391da1631d93968a9d487ba977d",
  },
  {
    path: "public",
    mode: "040000",
    type: "tree",
    sha: "4cedfad86048f387544fd531397c819e9413d3f4",
    url: "https://api.github.com/repos/SanthaKudu47/dev_port/git/trees/4cedfad86048f387544fd531397c819e9413d3f4",
  },
  {
    path: "public/dev_port.svg",
    mode: "100644",
    type: "blob",
    sha: "78a50db269c409847a270e7071224fed7e9842d0",
    size: 2569,
    url: "https://api.github.com/repos/SanthaKudu47/dev_port/git/blobs/78a50db269c409847a270e7071224fed7e9842d0",
  },
  {
    path: "public/thumb_one.png",
    mode: "100644",
    type: "blob",
    sha: "c06f2497853551654ee313f6a67b287b425f3f82",
    size: 42117,
    url: "https://api.github.com/repos/SanthaKudu47/dev_port/git/blobs/c06f2497853551654ee313f6a67b287b425f3f82",
  },

  {
    path: "src",
    mode: "040000",
    type: "tree",
    sha: "c8023d7d8af6e68177eee76309c6e46c8abf871c",
    url: "https://api.github.com/repos/SanthaKudu47/dev_port/git/trees/c8023d7d8af6e68177eee76309c6e46c8abf871c",
  },
  {
    path: "src/App.tsx",
    mode: "100644",
    type: "blob",
    sha: "4eefefcdae067d9fff667041e835da6a18edce16",
    size: 479,
    url: "https://api.github.com/repos/SanthaKudu47/dev_port/git/blobs/4eefefcdae067d9fff667041e835da6a18edce16",
  },
  {
    path: "src/assets",
    mode: "040000",
    type: "tree",
    sha: "0342007a0ebb81708b1425a083df436b56d98cc0",
    url: "https://api.github.com/repos/SanthaKudu47/dev_port/git/trees/0342007a0ebb81708b1425a083df436b56d98cc0",
  },
  {
    path: "src/assets/dark_mode_icon.svg",
    mode: "100644",
    type: "blob",
    sha: "40206e6843a58e4fa8ed1d6163920d7d0d0b8448",
    size: 397,
    url: "https://api.github.com/repos/SanthaKudu47/dev_port/git/blobs/40206e6843a58e4fa8ed1d6163920d7d0d0b8448",
  },
  {
    path: "src/assets/email.svg",
    mode: "100644",
    type: "blob",
    sha: "798d7a7ca00329567fc35d7511f8f1ffe9c4268b",
    size: 244,
    url: "https://api.github.com/repos/SanthaKudu47/dev_port/git/blobs/798d7a7ca00329567fc35d7511f8f1ffe9c4268b",
  },

  {
    path: "src/assets/project_image_icon.svg",
    mode: "100644",
    type: "blob",
    sha: "0cc70ec4cfc764dc7998edcec1eb9ab94139e7dd",
    size: 377547,
    url: "https://api.github.com/repos/SanthaKudu47/dev_port/git/blobs/0cc70ec4cfc764dc7998edcec1eb9ab94139e7dd",
  },

  {
    path: "src/components",
    mode: "040000",
    type: "tree",
    sha: "f1b8ce1f26b87080438228482562879602188a8e",
    url: "https://api.github.com/repos/SanthaKudu47/dev_port/git/trees/f1b8ce1f26b87080438228482562879602188a8e",
  },
];

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
