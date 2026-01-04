import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import SCHEMA_DEFINITION_PROPERTY from "../../constants/model/model.constant";
import { ITransaction } from "../../types/interface/transcation.interface";

const transactionSchema: Schema<ITransaction> = new Schema<ITransaction>(
	{
		type: {
			...SCHEMA_DEFINITION_PROPERTY.requiredString,
			enum: ["credit", "debit", "transfer", "bill_payment", "booking", "wallet_credit", "wallet_debit"]
		},
		amount: SCHEMA_DEFINITION_PROPERTY.optionalNullObject,
		senderId: SCHEMA_DEFINITION_PROPERTY.requiredString,
		receiverId: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		reference: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		platformFee: SCHEMA_DEFINITION_PROPERTY.optionalNullObject,
		orderId: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		razorPay_payment_id: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		walletId: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		bookingId: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
		withdrawalStatus: {
			type: String,
			enum: ["pending", "completed", "failed", null],
			default: null
		}
	},
	GENERAL_SCHEMA_OPTIONS
);

export default transactionSchema;

