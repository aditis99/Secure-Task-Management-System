import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getData() {
    return { message: 'Secure Task Management API is online' };
  }
}
