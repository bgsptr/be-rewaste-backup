import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";

export class CustomUnauthorized extends DomainException {
  constructor() {
    const message = `user is not authorized`;
    super(message, HttpStatus.UNAUTHORIZED);
  }
}