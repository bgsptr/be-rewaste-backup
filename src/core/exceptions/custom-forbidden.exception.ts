import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class CustomForbidden extends DomainException {
  constructor(id?: string, rolesNeeded?: string) {
    const message = `cannot access such resource`;
    super(message, HttpStatus.FORBIDDEN);
  }
}
