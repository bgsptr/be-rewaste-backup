import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class CustomForbidden extends DomainException {
  constructor(additional?: string, id?: string, rolesNeeded?: string) {
    const message = additional ? additional : `cannot access such resource`;
    super(message, HttpStatus.FORBIDDEN);
  }
}
