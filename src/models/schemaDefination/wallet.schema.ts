import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import SCHEMA_DEFINITION_PROPERTY from "../../constants/model/model.constant";
import { IWallet } from "../../types/interface/wallet.interface";
import transactionSchema from "./transaction.schema";


const walletSchema: Schema<IWallet> = new Schema<IWallet>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    balance: SCHEMA_DEFINITION_PROPERTY.optionalNullNumber,
    transactions: [transactionSchema],
  },
  GENERAL_SCHEMA_OPTIONS
);

export default walletSchema;
