import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import SCHEMA_DEFINITION_PROPERTY from "../../constants/model/model.constant";
import { IProvider } from "../../types/interface/provider.interface";

const providerSchema: Schema<IProvider> = new Schema<IProvider>(
  {
    full_name: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
    age: SCHEMA_DEFINITION_PROPERTY.optionalNullNumber,
    phone: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
    gender: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
    address: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
    password: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
    profile_pic:SCHEMA_DEFINITION_PROPERTY.optionalNullString,
    provided_service:SCHEMA_DEFINITION_PROPERTY.optionalNullString
  },
  GENERAL_SCHEMA_OPTIONS
);

export default providerSchema;
