import { model } from "mongoose";
import transactionSchema from "./schemaDefination/transaction.schema";
import { ITransaction } from "../types/interface/transcation.interface";

const TransactionModel = model<ITransaction>("transactions", transactionSchema);

export default TransactionModel;
