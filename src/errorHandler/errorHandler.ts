import type { NextFunction, Request, Response } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const errorMessage = err instanceof Error ? err.message : String(err);
  if (
    errorMessage == "OPENROUTER_API_KEY is not found in environment variables."
  ) {
    res.status(500).json({
      success: false,
      message:
        "Configuration Error: The server is missing a required API setup.",
      error: errorMessage, // Keeps the underlying error details optional but accessible
    });
    return;
  }

  if (errorMessage == "Failed to call model") {
    res.status(500).json({
      success: false,
      message:
        "The AI service is currently unavailable or busy. Please try again shortly.",
      error: errorMessage,
    });
  }

  // Fallback for any other unexpected system errors
  res.status(500).json({
    success: false,
    message: "An unexpected error occurred on our server.",
    error: errorMessage,
  });
  // next(err);
}
