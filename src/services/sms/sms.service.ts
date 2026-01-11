import axios from "axios";
import { MSG91_CONFIG } from "../../config/config";

interface MSG91Response {
	type: string;
	message: string;
	request_id?: string;
}

interface SMSResponse {
	request_id?: string;
	message: string;
	status: boolean;
}

/**
 * Send booking confirmation SMS using MSG91 Flow API
 * @param phone_no - Target phone number
 * @param bookingId - Booking ID to be sent as variable
 * @returns Promise with response
 */
export const sendBookingConfirmationSms = async (phone_no: string, bookingId: string): Promise<SMSResponse> => {
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
			template_id: MSG91_CONFIG.CNF_TEMPLATE_ID,
			recipients: [
				{
					mobiles: formattedPhoneNo,
					var: phone_no,
					var2: bookingId
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

		console.log("Sending Confirmation SMS to:", formattedPhoneNo);
		const response = await axios.request(options);

		console.log("MSG91 Response:", response.data);

		if (response.status === 200) {
			const msg91Response: MSG91Response = response.data;

			return {
				request_id: msg91Response.request_id,
				message: "Confirmation SMS sent successfully",
				status: true
			};
		} else {
			throw new Error(`MSG91 API returned status: ${response.status}`);
		}
	} catch (error: any) {
		console.error("Error while sending confirmation SMS:", error);

		if (error.response) {
			console.error("MSG91 API Error Response:", error.response.data);
			throw new Error(`MSG91 API Error: ${error.response.data.message || "Unknown error"}`);
		} else if (error.request) {
			throw new Error("Network error: Unable to reach MSG91 API");
		} else {
			throw new Error(`Confirmation SMS failed: ${error.message}`);
		}
	}
};
