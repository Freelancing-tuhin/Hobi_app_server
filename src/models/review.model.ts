import { model } from "mongoose";
import reviewSchema from "./schemaDefination/review.schema";
import { IReview } from "../types/interface/review.interface";

const ReviewModel = model<IReview>("reviews", reviewSchema);

export default ReviewModel;
