/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';

/**
 * Represents an error within the API.
 */
export class CustomAPIError extends Error {
  constructor(statusCode, errorMessage) {
    super();
    this.statusCode = statusCode || 500;
    this.errorMessage = errorMessage;
  }
}

/**
 * Handles error responses for the API.
 * @param {Error} error The error object.
 * @param {Request} request The Express request object.
 * @param {Response} response The Express response object.
 * @param {NextFunction} nextFunction The Express next function.
 */
export const handleErrorResponse = (error, request, response, nextFunction) => {
  const fallbackMessage = `Unable to process ${request.url}`;

  if (error instanceof CustomAPIError) {
    response.status(error.statusCode).json({ error: error.errorMessage || fallbackMessage });
    return;
  }

  response.status(500).json({
    error: error ? error.message || error.toString() : fallbackMessage,
  });
};
