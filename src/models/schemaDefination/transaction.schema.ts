import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import SCHEMA_DEFINITION_PROPERTY from "../../constants/model/model.constant";
import { ITransaction } from "../../types/interface/transcation.interface";

const transactionSchema: Schema<ITransaction> = new Schema<ITransaction>(
	{
		type: {
			...SCHEMA_DEFINITION_PROPERTY.requiredString,
			enum: ["credit", "debit", "transfer", "bill_payment", "booking"]
		},
		amount: SCHEMA_DEFINITION_PROPERTY.requiredString,
		status: {
			...SCHEMA_DEFINITION_PROPERTY.requiredString,
			enum: ["success", "failed", "pending"]
		},
		senderId: SCHEMA_DEFINITION_PROPERTY.requiredString,
		receiverId: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		reference: SCHEMA_DEFINITION_PROPERTY.optionalNullString
	},
	GENERAL_SCHEMA_OPTIONS
);

export default transactionSchema;
