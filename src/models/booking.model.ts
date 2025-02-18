import { model } from "mongoose";
import { IBooking } from "../types/interface/booking.interface";
import bookingSchema from "./schemaDefination/booking.schema";

const BookingModel = model<IBooking>("bookings", bookingSchema);

export default BookingModel;
