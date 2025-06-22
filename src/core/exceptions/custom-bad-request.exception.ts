import { HttpStatus } from "@nestjs/common";
import { DomainException } from "./domain.exception";

export class CustomBadRequest extends DomainException {
    constructor(message: string, validation?: any) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}