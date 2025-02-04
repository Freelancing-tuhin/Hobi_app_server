import { model } from "mongoose";
import { IWallet } from "../types/interface/wallet.interface";
import walletSchema from "./schemaDefination/wallet.schema";

const WalletModel = model<IWallet>("wallets", walletSchema);

export default WalletModel;
