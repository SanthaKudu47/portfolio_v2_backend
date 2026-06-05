import type { NextFunction, Response, Request } from "express";
import { contextManager } from "../context/context.ts";
import type { RequestWithContext } from "../types/appTypes.ts";
import { SignedTokenSchema } from "../validation/validationSchema.ts";
import { sendResponse, verifyToken } from "../helper/helper.ts";
import { appConfig } from "../config/config.ts";

export async function headerValidator(
  requestExpress: Request,
  res: Response,
  next: NextFunction,
) {
  const req: RequestWithContext = requestExpress as RequestWithContext;
  const signature = req.headers["ai-session-id"];

  //Validate header
  if (!signature || Array.isArray(signature)) {
    sendResponse(res, null, false, "Session token missing", 400);
    return;
  }

  const result = SignedTokenSchema.safeParse(signature);
  if (!result.success) {
    console.log(result.error.issues[0].message);
    sendResponse(res, null, false, "Invalid session token", 400);
    return;
  }

  //verify
  const serverKey = appConfig.serverKey;
  if (!serverKey) {
    sendResponse(res, null, false, "Server configuration error", 500);
    return;
  } //copilot-< beautify the message
  const isValid = verifyToken(result.data, serverKey);

  if (!isValid) {
    sendResponse(res, null, false, "Invalid or expired session", 400);
    return;
  }

  //Attach session to request
  const [sessionId] = result.data.split(".");
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
