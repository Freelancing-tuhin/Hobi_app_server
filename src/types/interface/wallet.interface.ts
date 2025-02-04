import { ITransaction } from "./transcation.interface";

export interface IWallet {
    user: any;
    balance: number;
    transactions: ITransaction[];
  }
  