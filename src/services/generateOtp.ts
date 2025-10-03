import axios from "axios";
import { MSG91_CONFIG } from "../config/config";

interface MSG91Response {
	type: string;
	message: string;
	request_id?: string;
}

interface OTPResponse {
	otp: string;
	request_id?: string;
	message: string;
}

export const generateOtp = async (phone_no: string): Promise<OTPResponse> => {
	const otp = Math.floor(1000 + Math.random() * 9000).toString();

	// Format phone number - remove any special characters except +
	let formattedPhoneNo = phone_no.replace(/[^\d+]/g, "");

	// Remove + if present for MSG91 API
	if (formattedPhoneNo.startsWith("+")) {
		formattedPhoneNo = formattedPhoneNo.substring(1);
	}

	// Ensure phone number starts with country code (91 for India)
	if (formattedPhoneNo.length === 10) {
		formattedPhoneNo = "91" + formattedPhoneNo;
	}

	try {
		const payload = {
			template_id: MSG91_CONFIG.TEMPLATE_ID,
			recipients: [
				{
					mobiles: formattedPhoneNo,
					var: otp
				}
			]
		};

		const options = {
			method: "POST",
			url: `${MSG91_CONFIG.BASE_URL}/flow/`,
			headers: {
				authkey: MSG91_CONFIG.AUTH_KEY,
				accept: "application/json",
				"content-type": "application/json"
			},
			data: payload
		};

		console.log("Sending OTP to:", formattedPhoneNo);
		const response = await axios.request(options);

		console.log("MSG91 Response:", response.data);

		if (response.status === 200) {
			const msg91Response: MSG91Response = response.data;

			return {
				otp: otp,
				request_id: msg91Response.request_id,
				message: "OTP sent successfully"
			};
		} else {
			throw new Error(`MSG91 API returned status: ${response.status}`);
		}
	} catch (error: any) {
		console.error("Error while sending OTP:", error);

		if (error.response) {
			console.error("MSG91 API Error Response:", error.response.data);
			throw new Error(`MSG91 API Error: ${error.response.data.message || "Unknown error"}`);
		} else if (error.request) {
			throw new Error("Network error: Unable to reach MSG91 API");
		} else {
			throw new Error(`OTP generation failed: ${error.message}`);
		}
	}
};

// Alternative method using MSG91's send OTP API (simpler approach)
export const sendOtpViaMSG91 = async (phone_no: string): Promise<{ request_id: string; message: string }> => {
	let formattedPhoneNo = phone_no.replace(/[^\d+]/g, "");

	if (formattedPhoneNo.startsWith("+")) {
		formattedPhoneNo = formattedPhoneNo.substring(1);
	}

	if (formattedPhoneNo.length === 10) {
		formattedPhoneNo = "91" + formattedPhoneNo;
	}

	try {
		const options = {
			method: "POST",
			url: `${MSG91_CONFIG.BASE_URL}/otp`,
			headers: {
				authkey: MSG91_CONFIG.AUTH_KEY,
				accept: "application/json",
				"content-type": "application/json"
			},
			data: {
				template_id: MSG91_CONFIG.TEMPLATE_ID,
				mobile: formattedPhoneNo,
				authkey: MSG91_CONFIG.AUTH_KEY
			}
		};

		const response = await axios.request(options);

		if (response.status === 200) {
			return {
				request_id: response.data.request_id || "success",
				message: "OTP sent successfully via MSG91"
			};
		} else {
			throw new Error(`MSG91 API returned status: ${response.status}`);
		}
	} catch (error: any) {
		console.error("Error while sending OTP via MSG91:", error);
		throw new Error(`Failed to send OTP: ${error.message}`);
	}
};

// Method to verify OTP sent via MSG91
export const verifyOtpViaMSG91 = async (phone_no: string, otp: string): Promise<boolean> => {
	let formattedPhoneNo = phone_no.replace(/[^\d+]/g, "");

	if (formattedPhoneNo.startsWith("+")) {
		formattedPhoneNo = formattedPhoneNo.substring(1);
	}

	if (formattedPhoneNo.length === 10) {
		formattedPhoneNo = "91" + formattedPhoneNo;
	}

	try {
		const options = {
			method: "POST",
			url: `${MSG91_CONFIG.BASE_URL}/otp/verify`,
			headers: {
				authkey: MSG91_CONFIG.AUTH_KEY,
				accept: "application/json",
				"content-type": "application/json"
			},
			data: {
				authkey: MSG91_CONFIG.AUTH_KEY,
				mobile: formattedPhoneNo,
				otp: otp
			}
		};

		const response = await axios.request(options);

		return response.status === 200 && response.data.type === "success";
	} catch (error: any) {
		console.error("Error while verifying OTP:", error);
		return false;
	}
};
