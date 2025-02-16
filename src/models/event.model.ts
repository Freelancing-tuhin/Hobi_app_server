import { model } from "mongoose";
import { IEvent } from "../types/interface/event.interface";
import eventSchema from "./schemaDefination/event.schema";

const EventModel = model<IEvent>("events", eventSchema);

export default EventModel;
