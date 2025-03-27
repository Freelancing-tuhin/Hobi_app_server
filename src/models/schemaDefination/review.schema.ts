import { Schema, model } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import SCHEMA_DEFINITION_PROPERTY from "../../constants/model/model.constant";
import { IReview } from "../../types/interface/review.interface";

const reviewSchema: Schema<IReview> = new Schema<IReview>(
	{
		comment: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		remarks: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		review_status: {
			type: String,
			enum: ["Customer", "Organizer", "Admin"],
			default: "Organizer"
		},
		rating: {
			type: Number,
			required: true,
			default: 1,
			min: 1,
			max: 5
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: "users", // Referencing UserModel
			required: true
		},
		eventId: {
			type: Schema.Types.ObjectId,
			ref: "events", // Referencing ProviderModel
			required: true
		}
	},
	GENERAL_SCHEMA_OPTIONS
);

export default reviewSchema;
