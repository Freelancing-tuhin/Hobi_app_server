import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import SCHEMA_DEFINITION_PROPERTY from "../../constants/model/model.constant";
import { ICall } from "../../types/interface/call.interface";

const callSchema: Schema<ICall> = new Schema<ICall>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: "service_providers",
      required: true,
    },
    status: {
      type: String,
      enum: ["requested" ,"scheduled", "ongoing", "completed", "canceled"],
      default: "scheduled",
    },
    scheduledAt: SCHEMA_DEFINITION_PROPERTY.optionalNullDate,
    startedAt: SCHEMA_DEFINITION_PROPERTY.optionalNullDate,
    endedAt: SCHEMA_DEFINITION_PROPERTY.optionalNullDate,
    duration: SCHEMA_DEFINITION_PROPERTY.optionalNullNumber,
    callCost: SCHEMA_DEFINITION_PROPERTY.optionalNullNumber,
  },
  GENERAL_SCHEMA_OPTIONS
);

export default callSchema;
