import { JwtPayload } from './jwt-payload.interface';

export interface LoginResponse {
  accessToken: string;
  user: JwtPayload;
}
