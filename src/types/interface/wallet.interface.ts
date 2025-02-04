import { ITransaction } from "./transcation.interface";

export interface IWallet {
	owner: any;
	ownerType: string;
	balance: number;
	transactions: ITransaction[];
}
