import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { authenticate } from '@google-cloud/local-auth'
import { google } from 'googleapis';

import * as path from 'path';
import * as fs from 'fs/promises';
import { OAuth2Client } from 'google-auth-library';

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly'];
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');
const TOKEN_PATH = path.join(process.cwd(), 'token.json');

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('authorize')
  async authorize() {
    const existingClient = await this.loadSavedCredentialsIfExist();
    if (existingClient) {
      return existingClient;
    }
    const client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await this.saveCredentials(client);
    }
    return client;
  }

  @Get('list')
  async list() {
    const client: any = await this.loadSavedCredentialsIfExist();
    const drive = google.drive({version: 'v3', auth: client});
    const res = await drive.files.list({
      fields: 'nextPageToken, files(id,name,createdTime,modifiedTime,size)',
    });
    return res.data.files;
  }

    /**
   * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
   *
   * @param {OAuth2Client} client
   * @return {Promise<void>}
   */
  async saveCredentials(client: OAuth2Client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content.toString());
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  }

  async loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content.toString());
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }
}
