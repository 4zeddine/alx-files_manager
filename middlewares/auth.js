/* eslint-disable no-unused-vars */
import { Request, Response, NextFunction } from 'express';
import { getUserFromXToken, getUserFromAuthorization } from '../utils/auth';

/**
 * Implements Basic authentication for a specified route.
 * @param {Request} request The Express request object.
 * @param {Response} response The Express response object.
 * @param {NextFunction} nextFunction The Express next function.
 */
export const basicAuthenticate = async (request, response, nextFunction) => {
  const authenticatedUser = await getUserFromAuthorization(request);

  if (!authenticatedUser) {
    response.status(401).json({ error: 'Unauthorized access' });
    return;
  }
  request.user = authenticatedUser;
  nextFunction();
};

/**
 * Implements X-Token authentication for a specified route.
 * @param {Request} request The Express request object.
 * @param {Response} response The Express response object.
 * @param {NextFunction} nextFunction The Express next function.
 */
export const xTokenAuthenticate = async (request, response, nextFunction) => {
  const authenticatedUser = await getUserFromXToken(request);

  if (!authenticatedUser) {
    response.status(401).json({ error: 'Unauthorized access' });
    return;
  }
  request.user = authenticatedUser;
  nextFunction();
};
