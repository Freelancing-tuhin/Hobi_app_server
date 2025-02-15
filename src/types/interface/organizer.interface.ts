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

	is_verified: boolean;

	type_of_firm: string;
	certificate_of_incorporation: string;
	PAN: string;
	GST: string;
	bank_account: string;
	bank_account_type: string;
	IFSC_code: string;

	service_category: any;
	licenses_for_establishment: string;
	licenses_for_activity_undertaken: string;
	certifications: string[];
	insurance_for_outdoor_activities: boolean;
	health_safety_compliance: string;
	health_safety_documents: string[];
}
