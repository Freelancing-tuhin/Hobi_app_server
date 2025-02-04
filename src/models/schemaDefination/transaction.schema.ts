import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import SCHEMA_DEFINITION_PROPERTY from "../../constants/model/model.constant";
import { ITransaction } from "../../types/interface/transcation.interface";

const transactionSchema: Schema<ITransaction> = new Schema<ITransaction>(
  {
    type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: SCHEMA_DEFINITION_PROPERTY.optionalNullNumber,
    date: SCHEMA_DEFINITION_PROPERTY.optionalNullDate,
    referenceId: {
      type: Schema.Types.ObjectId,
      ref: "calls",
      required: false,
    },
  },
  { _id: false } // Embedding schema without generating separate document IDs
);

 

export default transactionSchema;
