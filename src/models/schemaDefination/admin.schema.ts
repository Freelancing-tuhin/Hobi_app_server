import { Schema } from "mongoose";
import { GENERAL_SCHEMA_OPTIONS } from "../../constants/model/schemaOption";
import SCHEMA_DEFINITION_PROPERTY from "../../constants/model/model.constant";
import { IAdmin } from "../../types/interface/admn.interface";

const adminSchema: Schema<IAdmin> = new Schema<IAdmin>(
  {
    full_name: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
    phone: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
    password: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
    role: SCHEMA_DEFINITION_PROPERTY.optionalNullString,
  },
  GENERAL_SCHEMA_OPTIONS
);

export default adminSchema;
