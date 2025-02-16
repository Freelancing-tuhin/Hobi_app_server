import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import SCHEMA_DEFINITION_PROPERTY from "../../constants/model/model.constant";
import { IEvent } from "../../types/interface/event.interface";

const eventSchema: Schema<IEvent> = new Schema<IEvent>(
	{
		organizerId: SCHEMA_DEFINITION_PROPERTY.requiredObjectId,
		title: SCHEMA_DEFINITION_PROPERTY.requiredString,
		category: SCHEMA_DEFINITION_PROPERTY.optionalNullObject,
		type: {
			type: String,
			enum: ["Single", "Recurring"],
			required: true
		},
		startDate: SCHEMA_DEFINITION_PROPERTY.requiredString,
		startTime: SCHEMA_DEFINITION_PROPERTY.requiredString,
		endTime: SCHEMA_DEFINITION_PROPERTY.requiredString,
		location: SCHEMA_DEFINITION_PROPERTY.requiredString,
		description: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		banner_Image: SCHEMA_DEFINITION_PROPERTY.requiredString,
		isTicketed: SCHEMA_DEFINITION_PROPERTY.optionalBoolean,
		ticketName: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		ticketPrice: SCHEMA_DEFINITION_PROPERTY.optionalNullNumber
	},
	GENERAL_SCHEMA_OPTIONS
);

export default eventSchema;
