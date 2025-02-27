import mongoose from "mongoose";

export const toObjectId = (parameter: string): mongoose.Types.ObjectId => {
  if (!mongoose.Types.ObjectId.isValid(parameter)) {
    throw new Error(`Invalid ObjectId: ${parameter}`);
  }
  return new mongoose.Types.ObjectId(parameter);
};