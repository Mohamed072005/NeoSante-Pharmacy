import {BadRequestException, Body, Controller, Get, HttpStatus, Post, UsePipes, ValidationPipe} from "@nestjs/common";
import {CreatePharmacyDto} from "./DTOs/create.pharmacy.dto";

@Controller('pharmacy')

export class PharmacyController {


    @Post('/create')
    @UsePipes(new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
        whitelist: true,
        exceptionFactory: (errors) => {
            const formattedErrors = errors.map(error => ({
                field: error.property,
                constraints: Object.values(error.constraints || {})
            }));

            throw new BadRequestException({
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Validation failed',
                errors: formattedErrors
            });
        }
    }))
    createPharmacy(
        @Body() createPharmacyDTO: CreatePharmacyDto
    ) {
        try {
            return {
                createPharmacyDTO: createPharmacyDTO
            }
        }catch(err) {
            return {
                error: err,
            }
        }
    }
}