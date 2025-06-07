import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class CustomConflict extends DomainException {
  constructor(entityName: string, identifier?: string) {
    const message = identifier
      ? `${entityName} with this ${identifier} already exists`
      : `${entityName} already exists`;
    super(message, HttpStatus.CONFLICT);
  }
}
