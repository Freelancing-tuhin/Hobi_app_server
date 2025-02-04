export interface ITransaction {
    type: "credit" | "debit";
    amount: number;
    date: Date;
    referenceId?: string;
  }