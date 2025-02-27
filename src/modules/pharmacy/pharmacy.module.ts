import { Module } from '@nestjs/common';
import {PharmacyController} from "./pharmacy.controller";
import {PharmacyService} from "./pharmacy.service";
import {MongooseModule} from "@nestjs/mongoose";
import {Pharmacy, PharmacySchema} from "./pharmacy.schema";
import {IsValidUserIdConstraint} from "../../common/validators/is-valid-user-id.validator";
import {RabbitMQModule} from "../../core/rabbitmq/rabbitmq.module";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Pharmacy.name, schema: PharmacySchema }]),
    ],
    controllers: [PharmacyController],
    providers: [PharmacyService],
})
export class PharmacyModule {}
