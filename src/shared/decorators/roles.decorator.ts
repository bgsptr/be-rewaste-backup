import { SetMetadata } from "@nestjs/common";
// import { Reflector } from "@nestjs/core";

// export const Roles = Reflector.createDecorator<string[]>();

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);


// export const FetchRoles = createParamDecorator(
//     (data: unknown, ctx: ExecutionContext) => {
//         const request = ctx.switchToHttp().getRequest();
//         return request.user?.roles;
//     }
// )