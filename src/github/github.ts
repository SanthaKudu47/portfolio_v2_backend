import type { IAppConfig } from "../config/types.ts";
import { formatRepoData } from "../helper/helper.ts";

function validateConfig(config: IAppConfig) {
  if (!config.githubToken || !config.githubUser) {
    throw new Error("Failed to find github token and user");
  }
}

export async function getRepoList(config: IAppConfig) {
  try {
    validateConfig(config);
    const response = await fetch(`https://api.github.com/user/repos`, {
      headers: {
        Authorization: `Bearer  ${config.githubToken}`,
        Accept: "application/vnd.github+json",
        // "X-GitHub-Api-Version": "2026-03-10",
      },
    });
    const repos = await response.json();
    const simplifiedRepos = formatRepoData(repos);
    return simplifiedRepos;
  } catch (error) {
    console.log("Failed to fetch repo list");
    console.log(error);
    return null;
  }
}

export async function getReadme(config: IAppConfig, repo: string) {
  try {
    validateConfig(config);
    const response = await fetch(
      `https://api.github.com/repos/${config.githubUser?.toLocaleLowerCase()}/${repo}/readme`,
      {
        headers: {
          Authorization: `Bearer  ${config.githubToken}`,
          Accept: "application/vnd.github.raw+json",
        },
      },
    );
    if (!response.ok) {
      console.log("Failed to fetch README of", repo, response.status, response);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.log("Failed  fetch README of ", repo);
    console.log(error);
    return null;
  }
}

export async function getLanguages(config: IAppConfig, repo: string) {
  try {
    validateConfig(config);
    const response = await fetch(
      `https://api.github.com/repos/${config.githubUser}/${repo}/languages`,
      {
        headers: {
          Authorization: `Bearer  ${config.githubToken}`,
          Accept: "application/vnd.github+json",
        },
      },
    );
    if (!response.ok) {
      console.log("Failed to fetch README of", repo, response.status);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.log("Failed  fetch languages  of ", repo);
    console.log(error);
    return null;
  }
}

export async function getFileTree(
  config: IAppConfig,
  repo: string,
  branch: string,
) {
  try {
    validateConfig(config);
    const response = await fetch(
      `https://api.github.com/repos/${config.githubUser}/${repo}/git/trees/${branch}?recursive=1`,
      {
        headers: {
          Authorization: `Bearer  ${config.githubToken}`,
          Accept: "application/vnd.github+json",
        },
      },
    );

    console.log(response);
    if (!response.ok) {
      console.log("Failed  fetch file tree  of ", repo, "at branch ", branch);
      console.log(response.status);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.log("Failed  fetch file tree  of ", repo, "at branch ", branch);
    console.log(error);
    return null;
  }
}

export async function getFile(
  config: IAppConfig,
  repo: string,
  branch: string,
  path: string,
) {
  try {
    validateConfig(config);
    const response = await fetch(
      `https://api.github.com/repos/${config.githubUser}/${repo}/contents/${path}?ref=${branch}`,
      {
        headers: {
          Authorization: `Bearer  ${config.githubToken}`,
          Accept: "application/vnd.github.raw+json",
        },
      },
    );

    // console.log(response)
    if (!response.ok) {
      console.log("Failed  fetch file from ", repo, "at branch ", branch);
      console.log(response.status);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.log("Failed  fetch file from ", repo, "at branch ", branch);
    console.log(error);
    return null;
  }
}
