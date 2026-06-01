import type { IAppConfig } from "./types.ts";

export let appConfig: IAppConfig = {
  githubToken: null,
  githubUser: null,
  openRouterKey: null,
  groqKey: null,
};
export function initialize() {
  console.log("Reading From .env");
  const githubToken = process.env.GITHUB;
  const githubUser = process.env.GITHUB_USER;
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  if (!githubToken || !githubUser || !openRouterKey || !groqKey) {
    process.exit(1);
  }
  appConfig = { githubToken, githubUser, openRouterKey,groqKey };
}
