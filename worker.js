/* eslint-disable import/no-named-as-default */
import { writeFile } from 'fs';
import { promisify } from 'util';
import Queue from 'bull/lib/queue';
import imgThumbnail from 'image-thumbnail';
import mongoDBCore from 'mongodb/lib/core';
import databaseClient from './utils/db';
import Mailer from './utils/mailer';

const writeFileAsync = promisify(writeFile);
const thumbnailQueue = new Queue('thumbnail generation');
const emailQueue = new Queue('email sending');

/**
 * Creates a thumbnail image with the specified width.
 * @param {String} originalFilePath The path of the original image file.
 * @param {number} thumbnailWidth The desired width of the thumbnail.
 * @returns {Promise<void>}
 */
const createThumbnail = async (originalFilePath, thumbnailWidth) => {
  const buffer = await imgThumbnail(originalFilePath, { width: thumbnailWidth });
  console.log(`Creating thumbnail for file: ${originalFilePath}, width: ${thumbnailWidth}`);
  return writeFileAsync(`${originalFilePath}_${thumbnailWidth}`, buffer);
};

thumbnailQueue.process(async (job, done) => {
  const fileId = job.data.fileId || null;
  const userId = job.data.userId || null;

  if (!fileId) {
    throw new Error('fileId is required');
  }
  if (!userId) {
    throw new Error('userId is required');
  }
  console.log('Processing job for', job.data.name || '');

  const fileRecord = await (await databaseClient.filesCollection())
    .findOne({
      _id: new mongoDBCore.BSON.ObjectId(fileId),
      userId: new mongoDBCore.BSON.ObjectId(userId),
    });

  if (!fileRecord) {
    throw new Error('File not found');
  }

  const thumbnailSizes = [500, 250, 100];

  Promise.all(thumbnailSizes.map((size) => createThumbnail(fileRecord.localPath, size)))
    .then(() => {
      done();
    });
});

emailQueue.process(async (job, done) => {
  const userId = job.data.userId || null;

  if (!userId) {
    throw new Error('userId is required');
  }

  const userRecord = await (await databaseClient.usersCollection())
    .findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });

  if (!userRecord) {
    throw new Error('User not found');
  }

  console.log(`Welcome ${userRecord.email}!`);

  try {
    const emailSubject = 'Welcome to ALX-Files_Manager by B3zaleel';
    const emailBody = [
      '<div>',
      '<h3>Hello {{user.name}},</h3>',
      'Welcome to <a href="https://github.com/B3zaleel/alx-files_manager">',
      'ALX-Files_Manager</a>, ',
      'a simple file management API built with Node.js by ',
      '<a href="https://github.com/B3zaleel">Bezaleel Olakunori</a>. ',
      'We hope it meets your needs.',
      '</div>',
    ].join('');

    Mailer.sendMail(Mailer.buildMessage(userRecord.email, emailSubject, emailBody));
    done();
  } catch (error) {
    done(error);
  }
});
