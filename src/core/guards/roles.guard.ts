import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ROLES_KEY } from "src/shared/decorators/roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const allowedRoles = this.reflector.get<String[]>(ROLES_KEY, context.getHandler());

        if (!allowedRoles || allowedRoles.length === 0) return true;

        const { user } = context.switchToHttp().getRequest();
        const userRoles = user?.roles || [];
        console.log(userRoles);

        return userRoles.some((role: string) => allowedRoles.includes(role));
    }
}