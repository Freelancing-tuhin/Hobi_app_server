import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import SCHEMA_DEFINITION_PROPERTY from "../../constants/model/model.constant";
import { IOrganizer } from "../../types/interface/organizer.interface";

const organizerSchema: Schema<IOrganizer> = new Schema<IOrganizer>(
	{
		full_name: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		age: SCHEMA_DEFINITION_PROPERTY.optionalNullNumber,
		phone: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		email: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		gender: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		address: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		password: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		profile_pic: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		ratings: SCHEMA_DEFINITION_PROPERTY.optionalNullNumber,

		// Bank details
		accountHolderName: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		accountNumber: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		confirmAccountNumber: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		ifscCode: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		bankName: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		branchName: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		accountType: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		panNumber: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		aadharNumber: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		upiId: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		gstNumber: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		canceledChequeUrl: SCHEMA_DEFINITION_PROPERTY.optionalNullString
	},
	GENERAL_SCHEMA_OPTIONS
);

export default organizerSchema;
