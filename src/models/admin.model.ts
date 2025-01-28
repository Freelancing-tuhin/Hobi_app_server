import { model } from "mongoose";
import userSchema from "./schemaDefination/user.schema";
import { IAdmin } from "../types/interface/admn.interface";
import adminSchema from "./schemaDefination/admin.schema";

const AdminModel = model<IAdmin>("admins", adminSchema);

export default AdminModel;
