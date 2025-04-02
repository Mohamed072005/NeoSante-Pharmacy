import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';
import { Inject, Injectable } from "@nestjs/common";
import { UserRepositoryInterface } from "../../modules/user/interfaces/user.repository.interface";
import { toObjectId } from "../transformers/object.id.transformer"; // Adjust the import based on your project structure

@ValidatorConstraint({ name: 'IsValidUserId', async: true })
@Injectable()
export class IsValidUserIdConstraint implements ValidatorConstraintInterface {
    constructor(
      @Inject('UserRepositoryInterface') private userRepository: UserRepositoryInterface
    ) {}

    async validate(userId: string, args: ValidationArguments) {
        const user_id = toObjectId(userId);
        const user = await this.userRepository.getUserById(user_id);
        return !!user;
    }

    defaultMessage(args: ValidationArguments) {
        return 'Invalid userId'; // Custom error message
    }
}

export function IsValidUserId(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidUserIdConstraint,
        });
    };
}