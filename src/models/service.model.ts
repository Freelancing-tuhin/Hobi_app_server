import { model } from "mongoose";
import { IService } from "../types/interface/service.interface";
import serviceSchema from "./schemaDefination/services.schema";

const ServiceModel = model<IService>("services", serviceSchema);

export default ServiceModel;
