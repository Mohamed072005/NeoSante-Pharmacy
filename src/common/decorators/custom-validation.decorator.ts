import { BadRequestException, HttpStatus, UsePipes, ValidationPipe } from "@nestjs/common";

export function CustomValidation() {
  return UsePipes(
    new ValidationPipe({
      transform: true,
      forbidNonWhitelisted: true,
      whitelist: true,
      exceptionFactory: (errors) => {
        const formattedErrors = errors.map((error) => ({
          field: error.property,
          constraints: Object.values(error.constraints || {}),
        }));

        throw new BadRequestException({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      },
    })
  )
}