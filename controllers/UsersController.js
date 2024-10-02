/* eslint-disable import/no-named-as-default */
import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import databaseClient from '../utils/db';

const emailQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(req, res) {
    const userEmail = req.body ? req.body.email : null;
    const userPassword = req.body ? req.body.password : null;

    if (!userEmail) {
      res.status(400).json({ error: 'Email is required' });
      return;
    }
    if (!userPassword) {
      res.status(400).json({ error: 'Password is required' });
      return;
    }

    const existingUser = await (await databaseClient.usersCollection()).findOne({ email: userEmail });

    if (existingUser) {
      res.status(400).json({ error: 'User already exists' });
      return;
    }

    const insertResult = await (await databaseClient.usersCollection())
      .insertOne({ email: userEmail, password: sha1(userPassword) });

    const newUserId = insertResult.insertedId.toString();

    emailQueue.add({ userId: newUserId });
    res.status(201).json({ email: userEmail, id: newUserId });
  }

  static async getMe(req, res) {
    const { user } = req;

    res.status(200).json({ email: user.email, id: user._id.toString() });
  }
}
