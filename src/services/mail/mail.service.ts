import axios from "axios";
import { MSG91_CONFIG } from "../../config/config";

interface MSG91MailResponse {
	status: string;
	message: string;
	request_id?: string;
}

interface MailResponse {
	request_id?: string;
	message: string;
	status: boolean;
}

/**
 * Send email using MSG91 Email API
 * @param toEmail - Recipient email address
 * @param toName - Recipient name
 * @param variables - Dynamic variables for the template
 * @returns Promise with response
 */
export const sendEmail = async (
	toEmail: string,
	toName: string,
	variables: Record<string, string>
): Promise<MailResponse> => {
	try {
		const payload = {
			to: [
				{
					name: toName,
					email: toEmail
				}
			],
			from: {
				name: MSG91_CONFIG.FROM_NAME,
				email: MSG91_CONFIG.FROM_EMAIL
			},
			domain: MSG91_CONFIG.DOMAIN,
			template_id: MSG91_CONFIG.EMAIL_TEMPLATE_ID,
			variables: variables
		};

		const options = {
			method: "POST",
			url: `${MSG91_CONFIG.BASE_URL}/email/send`,
			headers: {
				authkey: MSG91_CONFIG.AUTH_KEY,
				accept: "application/json",
				"content-type": "application/json"
			},
			data: payload
		};

		console.log("Sending Email to:", toEmail);
		const response = await axios.request(options);

		console.log("MSG91 Email Response:", response.data);

		if (response.status === 200) {
			const msg91Response: MSG91MailResponse = response.data;

			return {
				request_id: msg91Response.request_id,
				message: "Email sent successfully",
				status: true
			};
		} else {
			throw new Error(`MSG91 Email API returned status: ${response.status}`);
		}
	} catch (error: any) {
		console.error("Error while sending email:", error);

		if (error.response) {
			console.error("MSG91 Email API Error Response:", error.response.data);
			throw new Error(`MSG91 Email API Error: ${error.response.data.message || "Unknown error"}`);
		} else if (error.request) {
			throw new Error("Network error: Unable to reach MSG91 Email API");
		} else {
			throw new Error(`Email failed: ${error.message}`);
		}
	}
};

/**
 * Send booking confirmation email
 * @param email - Recipient email
 * @param name - Recipient name
 * @param eventName - Name of the event
 * @param eventId - ID of the event to generate the link
 * @returns Promise with response
 */
export const sendBookingConfirmationEmail = async (email: string, name: string, eventName: string, eventId: string): Promise<MailResponse> => {
	const variables = {
		VAR7: eventName,
		event_link: `https://hobi.co.in/event-details/${eventId}`
	};
	return sendEmail(email, name, variables);
};
