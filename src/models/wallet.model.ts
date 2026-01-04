import { model } from "mongoose";
import walletSchema from "./schemaDefination/wallet.schema";
import { IWallet } from "../types/interface/wallet.interface";

const WalletModel = model<IWallet>("wallets", walletSchema);

export default WalletModel;
