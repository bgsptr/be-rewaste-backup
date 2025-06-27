import { ArgumentMetadata, PipeTransform } from "@nestjs/common";
import { ZodSchema } from "zod";

export class ZodValidationPipe implements PipeTransform {
    constructor(
        private schema: ZodSchema,
    ) { }

    transform(value: unknown, metadata: ArgumentMetadata) {
        const result = this.schema.safeParse(value);
        console.log(result);
        if (!result.success) {
            console.log(result.error);
            throw result.error;
        }

        return result.data;
    }
}