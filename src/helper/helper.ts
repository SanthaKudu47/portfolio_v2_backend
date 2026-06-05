import type { Response } from "express";
import type { GitHubRepo, IDir, ITree, SimplifiedRepo } from "../config/types";

async function readWebStreamToText(
  stream: ReadableStream<Uint8Array>,
): Promise<string> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value!);
  }

  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const full = new Uint8Array(totalLength);

  let offset = 0;
  for (const chunk of chunks) {
    full.set(chunk, offset);
    offset += chunk.length;
  }

  return new TextDecoder("utf-8").decode(full);
}

export { readWebStreamToText };

export function formatRepoData(repos: GitHubRepo[]): SimplifiedRepo[] {
  return repos.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    description: repo.description,
    url: repo.html_url,
    homepage: repo.homepage,
    language: repo.language,
    topics: repo.topics,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    updatedAt: repo.pushed_at,
    defaultBranch: repo.default_branch,
    isFork: repo.fork,
  }));
}
//public/dev_port.svg

export function buildTree(trees: ITree[]) {
  const root: IDir = { name: "root", type: "folder", children: [] };
  trees.forEach((tree: ITree) => {
    let current = root;
    const { path, type } = tree;
    const parts = path.split("/");
    const isFile = type === "blob";
    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      const nodeType = isLast && isFile ? "file" : "folder";
      const isCreated = current.children?.find((dir) => dir.name === part);
      if (!isCreated) {
        const element: IDir = {
          name: part,
          type: nodeType,
          children: nodeType === "folder" ? [] : undefined,
        };
        current.children?.push(element);
        current = element;
      } else {
        current = isCreated;
      }
    });

    // parts.forEach((part, index) => {
    //   if (index === parts.length - 1) {
    //     if (isFile) {
    //       current.children.push({
    //         name: parts[parts.length - 1],
    //         children: [],
    //         type: "file",
    //       });
    //     } else {
    //       const folder = root.children.find((dir) => dir.name === part);
    //       if (!folder) {
    //         const dir: IDir = { name: part, type: "folder", children: [] };
    //         current.children.push(dir);
    //       } else {
    //         current = folder;
    //       }
    //     }
    //   } else {
    //     const folder = root.children.find((dir) => dir.name === part);
    //     if (!folder) {
    //       const dir: IDir = {
    //         name: part,
    //         type: isFile ? "file" : "folder",
    //         children: [],
    //       };
    //       current.children.push(dir);
    //     } else {
    //       current = folder;
    //     }
    //   }
    // });
  });

  return root;
}

export function sendResponse(
  res: Response,
  data: string | number | boolean | null,
  ok: boolean,
  error: string | null,
  status: number,
) {
  res.header("Content-Type", "application/json");
  res.status(status);
  res.send({
    ok: ok,
    data: data,
    error: error,
  });
}

function validateInputs(data: string) {}
