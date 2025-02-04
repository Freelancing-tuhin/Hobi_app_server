import { model } from "mongoose";
import { ICall } from "../types/interface/call.interface";
import callSchema from "./schemaDefination/call.schema";

const CallModel = model<ICall>("service_calls", callSchema);

export default CallModel;
