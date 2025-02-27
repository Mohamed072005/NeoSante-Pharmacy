import {registerDecorator, ValidationOptions} from "class-validator";
import {IsValidUserIdConstraint} from "../validators/is-valid-user-id.validator";

export function IsValidUserId(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        console.log('data')
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsValidUserIdConstraint,
        });
    };
}