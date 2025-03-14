import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import SCHEMA_DEFINITION_PROPERTY from "../../constants/model/model.constant";
import { IService } from "../../types/interface/service.interface";

const serviceSchema: Schema<IService> = new Schema<IService>(
	{
		service_name: SCHEMA_DEFINITION_PROPERTY.requiredString, // Assuming service_name is required
		description: SCHEMA_DEFINITION_PROPERTY.optionalNullString // Assuming description is optional
	},
	GENERAL_SCHEMA_OPTIONS
);

export default serviceSchema;
