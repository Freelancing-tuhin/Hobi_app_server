export interface IEvent {
	title: string;
	category: any;
	type: string;
	startDate: string;
	startTime: string;
	endTime: string;
	location: string;
	description: string;

	banner_Image: string;

	isTicketed: boolean;
	ticketName?: string;
	ticketPrice?: number;
}
