// MSG91 API Response Types

export interface MSG91BaseResponse {
	type: string;
	message: string;
	request_id?: string;
}

export interface MSG91OTPResponse {
	type: string;
	message: string;
	request_id: string;
}

export interface MSG91VerificationResponse {
	type: "success" | "error";
	message: string;
}

export interface MSG91FlowResponse {
	type: string;
	message: string;
	request_id?: string;
}

export interface MSG91SMSResponse {
	type: string;
	message: string;
	request_id: string;
}

export interface MSG91BalanceResponse {
	USER_PLAN: string;
	WALLET_BALANCE: number;
	SMS: {
		PLAN: string;
		PROMOTIONAL: number;
		TRANSACTIONAL: number;
	};
	EMAIL: {
		PLAN: string;
		PROMOTIONAL: number;
		TRANSACTIONAL: number;
	};
	VOICE: {
		PLAN: string;
		CREDITS: number;
	};
}

// Custom response types for our service
export interface OTPServiceResponse {
	otp: string;
	request_id?: string;
	message: string;
	success: boolean;
}

export interface SMSServiceResponse {
	request_id: string;
	message: string;
	status: boolean;
}

export interface VerificationResult {
	verified: boolean;
	message: string;
}

// Configuration types
export interface MSG91Config {
	AUTH_KEY: string;
	TEMPLATE_ID: string;
	SENDER_ID: string;
	BASE_URL: string;
}

// Phone number validation
export interface PhoneValidationResult {
	isValid: boolean;
	formatted: string;
	error?: string;
}

// OTP request/response types for controllers
export interface OTPRequest {
	phone: string;
}

export interface OTPVerificationRequest {
	phone: string;
	otp: string;
}

export interface EncryptedResponse {
	message: string;
	result: string; // encrypted data
}

// Error types
export class MSG91Error extends Error {
	public statusCode: number;
	public code: string;

	constructor(message: string, statusCode: number = 400, code: string = "MSG91_ERROR") {
		super(message);
		this.name = "MSG91Error";
		this.statusCode = statusCode;
		this.code = code;
	}
}

export class PhoneValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "PhoneValidationError";
	}
}
