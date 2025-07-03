import * as jwt from "jsonwebtoken";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

export interface AdditionalData {
    villageId?: string
    transporterId?: string
}

export interface AuthenticatedRequest extends Request {
    user?: {
        id?: string;
        roles?: string[];
        activeRole?: string;
        data?: AdditionalData;
    }
}

export class AuthDecodedData {
    constructor(
        public id: string,
        public roles: string[],
        public activeRole: string,
        // public iat?: number,
        // public exp?: number
    ) {}
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
    use(req: AuthenticatedRequest, res: Response, next: NextFunction) {
        const authorization = req.headers.authorization;
        // console.log(authorization)
        // const token = authorization?.split(' ')[1];

        console.log("token", req.cookies.token)

        // if (!token) return res.status(401).json({
        //     error: true,
        //     message: "token is missing"
        // })

        jwt.verify(req.cookies.token, process.env.SECRET_KEY || "secret", (err: any, decoded: jwt.JwtPayload) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    return res.status(401).json({
                        error: true,
                        message: "token has expired",
                    });
                }
                return res.status(401).json({
                    error: true,
                    message: "user is not authorized",
                });
            }

            if (!decoded) return res.status(401).json({
                error: true,
                message: "invalid token payload"
            })

            console.log("hallo: ", decoded)

            const id: string = decoded?.userId || null;
            const roles: string[] = decoded?.roleString || null;
            const activeRole: string = decoded?.activeRole || null;
            req.user = new AuthDecodedData(id, roles, activeRole);
            next();
        })
    }
}