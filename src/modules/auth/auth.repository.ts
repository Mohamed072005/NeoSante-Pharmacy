import { Injectable } from "@nestjs/common";
import { AuthRepositoryInterface } from "./interfaces/auth.repository.interface";

@Injectable()
export class AuthRepository implements AuthRepositoryInterface {

}