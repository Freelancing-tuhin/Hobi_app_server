import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import SCHEMA_DEFINITION_PROPERTY from "../../constants/model/model.constant";
import { IWallet } from "../../types/interface/wallet.interface";

const walletSchema: Schema<IWallet> = new Schema<IWallet>(
	{
		organizerId: {
			...SCHEMA_DEFINITION_PROPERTY.requiredString,
			unique: true,
			index: true
		},
		balance: {
			type: Number,
			default: 0,
			min: 0
		},
		totalEarnings: {
			type: Number,
			default: 0,
			min: 0
		},
		totalWithdrawals: {
			type: Number,
			default: 0,
			min: 0
		},
		pendingWithdrawals: {
			type: Number,
			default: 0,
			min: 0
		},
		lastTransactionAt: SCHEMA_DEFINITION_PROPERTY.optionalNullDate,
		isActive: {
			type: Boolean,
			default: true
		}
	},
	GENERAL_SCHEMA_OPTIONS
);

export default walletSchema;
