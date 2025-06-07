import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";

export class NotFoundException extends DomainException {
  constructor(entityName: string, id?: string) {
    const message = id ? `${entityName} with ID ${id} not found` : `${entityName} not found`;
    super(message, HttpStatus.NOT_FOUND);
  }
}