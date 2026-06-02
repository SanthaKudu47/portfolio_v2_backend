import type { NextFunction, Response, Request } from "express";
import { contextManager } from "../context/context.ts";
import type { RequestWithContext } from "../types/appTypes.ts";
export async function headerValidator(
  requestExpress: Request,
  res: Response,
  next: NextFunction,
) {
  const req: RequestWithContext = requestExpress as RequestWithContext;
  const sessionId = req.headers["ai-session-id"];

  //Validate header
  if (!sessionId || Array.isArray(sessionId))
    throw new Error("Invalid request.");

  //Attach session to request
  req.sessionId = sessionId;

  try {
    const hasContextSession = contextManager.hasSessionContext(sessionId);

    // Create new session if needed
    if (!hasContextSession) {
      contextManager.createNewContextSession(sessionId);
    }
  } catch (error) {
    console.error("Context initialization failed:", error);
    throw new Error("Unable to initialize AI session context.");
  }

  next();
}
