import * as bycrpt from "bcrypt";

export class Hasher {
    static async hashPassword(plainPass: string, saltRounds = 10): Promise<string> {
        return await bycrpt.hash(plainPass, saltRounds);
    }

    static async comparePassword(plainInput: string, hashedText: string): Promise<boolean> {
        return await bycrpt.compare(plainInput, hashedText);
    }
}