import { Controller, Injectable, InternalServerErrorException } from "@nestjs/common";
import { CustomUnauthorized } from "src/core/exceptions/custom-unathorized.exception";
import UserRoleRepository from "src/infrastructure/postgres/repositories/user-role.repository";
import UsersRepository from "src/infrastructure/postgres/repositories/users.repository";
import { Hasher } from "src/utils/static/hasher";
import * as jwt from "jsonwebtoken";
import { roleEnum } from "src/utils/enum/role.enum";
import AuthDto from "src/application/dto/auth.dto";

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
    ) { }

    async authenticateAccount({ email: emailDto, password: passwordDto }: AuthDto) {
        try {
            const { userId, email, password, phoneNumber, villageId, transporterId } = await this.userRepository.getAccountCredentialWithEmail(emailDto);

            const passwordIsMatch = await Hasher.comparePassword(passwordDto, password);
            if (!passwordIsMatch) throw new CustomUnauthorized();

            const roles = await this.userRoleRepository.getRoles(userId);
            const roleString = roles.map(role => role.roleId);
            const payload: PayloadJWT = {
                userId,
                roleString,
                data: {
                    transporterId: roleString.includes(roleEnum.TRANSPORTER) && transporterId !== null ? transporterId : undefined,
                    villageId: roleString.includes(roleEnum.VILLAGE) && villageId ? villageId : null,
                }
            }

            await this.userRepository.updateLastSeen(userId, new Date());

            const accessToken = this.generateJwtToken(payload, true);
            const refreshToken = this.generateJwtToken(payload, false);
            return {
                accessToken,
                refreshToken,
            }

        } catch (err) {
            if (err instanceof CustomUnauthorized) throw err;

            throw new InternalServerErrorException();
        }

    }

    private async generateJwtToken(payload: PayloadJWT, accessToken: boolean) {
        return jwt.sign(payload, process.env.JWT_SECRET_ACCESS_TOKEN ?? "secret", {
            expiresIn: accessToken ? "1h" : "7h"
        });
    }
}