export interface IProvider {
	full_name: string;
	age: number;
	phone: string;
	gender: string;
	address: string;
	password: string;
	profile_pic: string;
	provided_service: any;
	ratings: number;
	ratePerMinute: number;
	past_experience: [
		{
			title: { type: string };
			description: string;
			start_year: number;
			end_year: number;
			position: string;
			location: string;
		}
	];
}
