import mongoose from "mongoose";
import { HttpException, HttpStatus } from "@nestjs/common";

export const toObjectId = (parameter: string): mongoose.Types.ObjectId => {
  try {
    if (!mongoose.Types.ObjectId.isValid(parameter)) {
      throw new HttpException(`Invalid ObjectId: ${parameter}`, HttpStatus.BAD_REQUEST);
    }
    return new mongoose.Types.ObjectId(parameter);
  }catch (err) {
    if (err instanceof HttpException) {
      throw new HttpException(err.message, err.getStatus());
    }
    throw new HttpException(err.message, 500);
  }
};