import { model } from "mongoose";
import { IProvider } from "../types/interface/provider.interface";
import providerSchema from "./schemaDefination/provider.schema";

const ProviderModel = model<IProvider>("service_providers", providerSchema);

export default ProviderModel;
