import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";

export class CustomUnauthorized extends DomainException {
  constructor(errMessage?: string) {
    const message = errMessage ? errMessage : `user is not authorized`;
    super(message, HttpStatus.UNAUTHORIZED);
  }
}