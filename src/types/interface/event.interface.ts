export interface IInclusionItem {
	id: string;
	text: string;
}

export interface IExclusionItem {
	id: string;
	text: string;
}

export interface IEvent {
	organizerId: any;
	title: string;
	category: any;
	type: string;
	startDate: string;
	startTime: string;
	endTime: string;
	location: any;
	description: string;

	banner_Image: string;

	isTicketed: boolean;
	tickets: any;

	ticketName?: string;
	ticketPrice?: number;
	ratings?: number;

	verified: boolean;
	supportingImages?: string[];
	inclusions?: IInclusionItem[];
	exclusions?: IExclusionItem[];
}
