/* eslint-disable no-unused-vars */
import fs from 'fs';
import readline from 'readline';
import { promisify } from 'util';
import mimeMessage from 'mime-message';
import { gmail_v1 as gmailV1, google } from 'googleapis';

const SCOPES = ['https://www.googleapis.com/auth/gmail.send'];
const TOKEN_PATH = 'token.json';
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

/**
 * Obtains and saves a new token after prompting the user for authorization,
 * then executes the provided callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client for which to get the token.
 * @param {getEventsCallback} callback The callback function for the authorized client.
 */
async function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this application by visiting this URL:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) {
        console.error('Error retrieving access token:', err);
        return;
      }
      oAuth2Client.setCredentials(token);
      writeFileAsync(TOKEN_PATH, JSON.stringify(token))
        .then(() => {
          console.log('Token stored to', TOKEN_PATH);
          callback(oAuth2Client);
        })
        .catch((writeErr) => console.error(writeErr));
    });
  });
}

/**
 * Creates an OAuth2 client using the provided credentials, then executes
 * the specified callback function.
 * @param {Object} credentials The credentials for the authorization client.
 * @param {function} callback The callback function to call with the authorized client.
 */
async function authorize(credentials, callback) {
  const clientSecret = credentials.web.client_secret;
  const clientId = credentials.web.client_id;
  const redirectURIs = credentials.web.redirect_uris;

  const oAuth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectURIs[0],
  );

  console.log('Starting client authorization process');

  // Check for previously stored token.
  await readFileAsync(TOKEN_PATH)
    .then((token) => {
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    })
    .catch(async () => getNewToken(oAuth2Client, callback));

  console.log('Client authorization completed');
}

/**
 * Sends an email using the user's account.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {gmailV1.Schema$Message} mail The email message to send.
 */
function sendMailService(auth, mail) {
  const gmail = google.gmail({ version: 'v1', auth });

  gmail.users.messages.send({
    userId: 'me',
    requestBody: mail,
  }, (err, _res) => {
    if (err) {
      console.log(`The API returned an error: ${err.message || err.toString()}`);
      return;
    }
    console.log('Email sent successfully');
  });
}

/**
 * Class containing methods for sending emails via Gmail.
 */
export default class Mailer {
  static checkAuth() {
    readFileAsync('credentials.json')
      .then(async (content) => {
        await authorize(JSON.parse(content), (auth) => {
          if (auth) {
            console.log('Authorization check was successful');
          }
        });
      })
      .catch((err) => {
        console.log('Error loading client secret file:', err);
      });
  }

  static buildMessage(destination, subjectLine, messageBody) {
    const senderEmail = process.env.GMAIL_SENDER;

    const messageData = {
      type: 'text/html',
      encoding: 'UTF-8',
      from: senderEmail,
      to: [destination],
      cc: [],
      bcc: [],
      replyTo: [],
      date: new Date(),
      subject: subjectLine,
      body: messageBody,
    };

    if (!senderEmail) {
      throw new Error(`Invalid sender email: ${senderEmail}`);
    }

    if (mimeMessage.validMimeMessage(messageData)) {
      const mimeMsg = mimeMessage.createMimeMessage(messageData);
      return { raw: mimeMsg.toBase64SafeString() };
    }

    throw new Error('Invalid MIME message format');
  }

  static sendMail(mail) {
    readFileAsync('credentials.json')
      .then(async (content) => {
        await authorize(
          JSON.parse(content),
          (auth) => sendMailService(auth, mail),
        );
      })
      .catch((err) => {
        console.log('Error loading client secret file:', err);
      });
  }
}
