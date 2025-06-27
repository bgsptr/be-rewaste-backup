import { HttpStatus } from '@nestjs/common';
import { DomainException } from './domain.exception';

export class CustomConflict extends DomainException {
  constructor(entityName: string, identifier?: string, customMessage?: string) {
    const message = identifier
      ? `${entityName} with this ${identifier} already exists`
      : `${entityName} already exists`;
    super(customMessage  || message, HttpStatus.CONFLICT);
  }
}
