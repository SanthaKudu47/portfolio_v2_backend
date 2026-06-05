// A unified type definition for your API responses
import type { Request } from "express";

export interface ApiResponse {
  success: boolean;
  message: string;
  error?: string;
}

export type RequestWithContext = Request & {
  sessionId: string;
};

