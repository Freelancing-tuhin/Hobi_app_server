export interface IOrganizer {
	full_name: string;
	age: number;
	phone: string;
	email: string;
	gender: string;
	address: string;
	password: string;
	profile_pic: string;
	ratings: number;

	accountHolderName: string; // Name as per bank records
	accountNumber: string; // Bank account number
	confirmAccountNumber: string; // Confirmation field
	ifscCode: string; // IFSC Code of the bank branch
	bankName: string; // Name of the bank
	branchName: string; // Bank branch name
	accountType: string; // Type of account
	panNumber: string; // PAN Card number for tax compliance
	aadharNumber: string; // Aadhaar number for identity verification
	upiId?: string; // Optional UPI ID for payments
	gstNumber?: string; // Optional GST Number (if applicable)
	canceledChequeUrl?: string; // URL of uploaded canceled cheque for verification
}
