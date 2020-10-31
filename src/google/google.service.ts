import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { Tokens } from '../social/tokens';
import { SocialInterface } from '../social/social.interface';

@Injectable()
export class GoogleService {
  private google: OAuth2Client;

  constructor(private configService: ConfigService) {
    this.google = new OAuth2Client(
      configService.get('google.clientId'),
      configService.get('google.clientSecret'),
    );
  }

  async getProfileByToken(tokens: Tokens): Promise<SocialInterface> {
    const { tokens: authTokens } = await this.google.getToken(tokens.token1);
    const ticket = await this.google.verifyIdToken({
      idToken: authTokens.id_token,
      audience: [this.configService.get('google.clientId')],
    });

    const data = ticket.getPayload();

    return {
      id: data.sub,
      email: data.email?.toLowerCase(),
      firstName: data.given_name,
      lastName: data.family_name,
    };
  }
}
