import { model } from "mongoose";
import organizerSchema from "./schemaDefination/organizer.schema";
import { IOrganizer } from "../types/interface/organizer.interface";

const OrganizerModel = model<IOrganizer>("organizers", organizerSchema);

export default OrganizerModel;
