import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from "@nestjs/common";
import { UserRepositoryInterface } from "../../modules/user/interfaces/user.repository.interface";
import { toObjectId } from "../../common/transformers/object.id.transformer";

@Injectable()
export class CheckUserGuard implements CanActivate {
  constructor(
    @Inject('UserRepositoryInterface')
    private readonly userRepository: UserRepositoryInterface
  ) {}

  async canActivate(context: ExecutionContext):Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user_id = request.data?.user_id;

    if (!user_id) {
      throw new UnauthorizedException('User ID is missing');
    }
    const userObjectId  = toObjectId(user_id);
    const user = await this.userRepository.getUserById(userObjectId);
    if (user) {
      return true;
    }else {
      throw new UnauthorizedException("You're not Authorized");
    }
  }
}