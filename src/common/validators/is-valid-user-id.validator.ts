import {ValidationArguments, ValidatorConstraintInterface} from "class-validator";
import {firstValueFrom} from "rxjs";
import {Inject} from "@nestjs/common";
import {ClientProxy} from "@nestjs/microservices";

export class IsValidUserIdConstraint implements ValidatorConstraintInterface {
    constructor(@Inject('PHARMACY_SERVICE') private readonly authServiceClient: ClientProxy ) {
    }
    async validate(userId: string) {
        try {
            console.log('Validating user ID:', userId);

            const isValid = await firstValueFrom(
              this.authServiceClient.send({ cmd: 'validate_user_id' }, { user_id: userId }),
            );

            console.log('Validation result:', isValid);
            return isValid;
        } catch (error) {
            console.error('Error validating user ID:', error);
            return false;
        }
    }

    defaultMessage() {
        return 'User ID is invalid or does not exist!';
    }
}