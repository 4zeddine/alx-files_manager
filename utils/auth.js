/* eslint-disable import/no-named-as-default */
/* eslint-disable no-unused-vars */
import sha1 from 'sha1';
import { Request } from 'express';
import mongoDBCore from 'mongodb/lib/core';
import databaseClient from './db';
import cacheClient from './redis';

/**
 * Retrieves the user from the Authorization header in the provided request object.
 * @param {Request} request The Express request object.
 * @returns {Promise<{_id: ObjectId, email: string, password: string}>}
 */
export const fetchUserFromAuthorization = async (request) => {
  const authHeader = request.headers.authorization || null;

  if (!authHeader) {
    return null;
  }
  const authParts = authHeader.split(' ');

  if (authParts.length !== 2 || authParts[0] !== 'Basic') {
    return null;
  }
  const decodedToken = Buffer.from(authParts[1], 'base64').toString();
  const separatorPosition = decodedToken.indexOf(':');
  const userEmail = decodedToken.substring(0, separatorPosition);
  const userPassword = decodedToken.substring(separatorPosition + 1);
  const user = await (await databaseClient.usersCollection()).findOne({ email: userEmail });

  if (!user || sha1(userPassword) !== user.password) {
    return null;
  }
  return user;
};

/**
 * Retrieves the user from the X-Token header in the provided request object.
 * @param {Request} request The Express request object.
 * @returns {Promise<{_id: ObjectId, email: string, password: string}>}
 */
export const fetchUserFromXToken = async (request) => {
  const token = request.headers['x-token'];

  if (!token) {
    return null;
  }
  const userId = await cacheClient.get(`auth_${token}`);
  if (!userId) {
    return null;
  }
  const user = await (await databaseClient.usersCollection())
    .findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });
  return user || null;
};

export default {
  fetchUserFromAuthorization: async (request) => fetchUserFromAuthorization(request),
  fetchUserFromXToken: async (request) => fetchUserFromXToken(request),
};
