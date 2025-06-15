import { Controller, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CustomUnauthorized } from "src/core/exceptions/custom-unathorized.exception";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { Hasher } from "src/utils/static/hasher";
import * as jwt from "jsonwebtoken";
import { roleNumber } from "src/utils/enum/role.enum";
import AuthDto from "src/application/dto/auth.dto";
import { LoggerService } from "src/infrastructure/logger/logger.service";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

interface PayloadJWT {
    userId: string,
    roleString: string[],
    data: {
        transporterId?: string | null,
        villageId: string | null,
    }
}

@Injectable()
export class AuthService {
    constructor(
        private userRepository: UsersRepository,
        private userRoleRepository: UserRoleRepository,
        private logger: LoggerService,
    ) { }

    async authenticateAccount({ email: emailDto, password: passwordDto }: AuthDto) {
        try {
            const { userId, email, password, phoneNumber, villageId, transporterId } = await this.userRepository.getAccountCredentialWithEmail(emailDto);

            const passwordIsMatch = await Hasher.comparePassword(passwordDto, password);
            if (!passwordIsMatch) throw new CustomUnauthorized(`password is not match`);

            const roles = await this.userRoleRepository.getRoles(userId);
            const roleString = roles.map(role => role.roleId);
            this.logger.debug(roleString);
            const payload: PayloadJWT = {
                userId,
                roleString,
                data: {
                    transporterId: roleString.includes(roleNumber.TRANSPORTER) && transporterId !== null ? transporterId : undefined,
                    villageId: roleString.includes(roleNumber.VILLAGE) && villageId ? villageId : null,
                }
            }

            await this.userRepository.updateLastSeen(userId, new Date());

            const accessToken = await this.generateJwtToken(payload, true);
            this.logger.log("token: ", accessToken);

            const refreshToken = await this.generateJwtToken(payload, false);
            return {
                userId,
                accessToken,
                refreshToken,
            }

        } catch (err) {
            if (err instanceof CustomUnauthorized) throw err;
            if (err instanceof PrismaClientKnownRequestError) throw new CustomUnauthorized(`can't find email of user`);
            throw new InternalServerErrorException();
        }

    }

    private async generateJwtToken(payload: PayloadJWT, accessToken: boolean) {
        return jwt.sign(payload, process.env.JWT_SECRET_ACCESS_TOKEN ?? "secret", {
            expiresIn: accessToken ? "1h" : "7h"
        });
    }
}