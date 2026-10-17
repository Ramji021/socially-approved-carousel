import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import { ApiError } from "../types/api-error";

export const notFoundHandler = (
  _request: Request,
  response: Response,
): void => {
  response.status(404).json({
    error: {
      code: "ROUTE_NOT_FOUND",
      message: "The requested route was not found.",
    },
  });
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _request: Request,
  response: Response,
  _next: NextFunction,
): void => {
  void _next;

  if (error instanceof ApiError) {
    response.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({
      error: {
        code: "INVALID_JSON",
        message: "Request body must contain valid JSON.",
      },
    });
    return;
  }

  console.error("Unhandled request error:", error);
  response.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "An unexpected error occurred.",
    },
  });
};
