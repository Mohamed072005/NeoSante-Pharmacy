import { HttpException, HttpStatus, Injectable, UnauthorizedException } from "@nestjs/common";
import * as jwt from 'jsonwebtoken'
import * as dotenv from 'dotenv'
import * as process from "node:process";
dotenv.config()

@Injectable()
export class JwtHelper {
    VerifyJWTToken(token: string) {
        try {
            const decoded = jwt.verify(token, process.env.SECRET_KEY as string);
            return decoded;
        }catch(err){
            if (err.name === 'TokenExpiredError') throw new HttpException('Token has expired', HttpStatus.UNAUTHORIZED);
            if (err.name === 'JsonWebTokenError') throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
            throw new HttpException('Failed to verify token', HttpStatus.UNAUTHORIZED);
        }
    }

    async generateJWTToken (payload: any, expiresIn: string):  Promise<{ token: string }> {
        try {
            const token = jwt.sign(payload, process.env.SECRET_KEY as string, { expiresIn });
            return { token };
        }catch (err: any) {
            console.error(err);
            throw new Error(`Failed to generate JWT: ${err.message}`);
        }
    }

}