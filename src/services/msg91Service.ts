import axios from "axios";
import { MSG91_CONFIG } from "../config/config";

interface MSG91Response {
	type: string;
	message: string;
	request_id?: string;
}

interface SMSResponse {
	request_id: string;
	message: string;
	status: boolean;
}

export class MSG91Service {
	private authKey: string;
	private baseUrl: string;

	constructor() {
		this.authKey = MSG91_CONFIG.AUTH_KEY;
		this.baseUrl = MSG91_CONFIG.BASE_URL;
	}

	/**
	 * Format phone number for MSG91 API
	 * @param phoneNumber - Raw phone number
	 * @returns Formatted phone number
	 */
	private formatPhoneNumber(phoneNumber: string): string {
		let formatted = phoneNumber.replace(/[^\d+]/g, "");

		if (formatted.startsWith("+")) {
			formatted = formatted.substring(1);
		}

		// Add country code if not present (91 for India)
		if (formatted.length === 10) {
			formatted = "91" + formatted;
		}

		return formatted;
	}

	/**
	 * Send OTP using MSG91's Flow API with custom template
	 * @param phoneNumber - Target phone number
	 * @param otp - OTP to send
	 * @param templateId - Optional template ID
	 * @returns Promise with response
	 */
	async sendOTPWithTemplate(phoneNumber: string, otp: string, templateId?: string): Promise<SMSResponse> {
		const formattedPhone = this.formatPhoneNumber(phoneNumber);

		try {
			const payload = {
				template_id: templateId || MSG91_CONFIG.TEMPLATE_ID,
				recipients: [
					{
						mobiles: formattedPhone,
						var: otp
					}
				]
			};

			const response = await axios.post(`${this.baseUrl}/flow/`, payload, {
				headers: {
					authkey: this.authKey,
					accept: "application/json",
					"content-type": "application/json"
				}
			});

			if (response.status === 200) {
				return {
					request_id: response.data.request_id || "success",
					message: "OTP sent successfully",
					status: true
				};
			} else {
				throw new Error(`MSG91 API returned status: ${response.status}`);
			}
		} catch (error: any) {
			console.error("MSG91 Flow API Error:", error.response?.data || error.message);
			throw new Error(`Failed to send OTP: ${error.response?.data?.message || error.message}`);
		}
	}

	/**
	 * Send OTP using MSG91's built-in OTP service
	 * @param phoneNumber - Target phone number
	 * @returns Promise with response
	 */
	async sendOTP(phoneNumber: string): Promise<SMSResponse> {
		const formattedPhone = this.formatPhoneNumber(phoneNumber);

		try {
			const payload = {
				authkey: this.authKey,
				template_id: MSG91_CONFIG.TEMPLATE_ID,
				mobile: formattedPhone
			};

			const response = await axios.post(`${this.baseUrl}/otp`, payload, {
				headers: {
					authkey: this.authKey,
					accept: "application/json",
					"content-type": "application/json"
				}
			});

			if (response.status === 200) {
				return {
					request_id: response.data.request_id || "success",
					message: "OTP sent successfully",
					status: true
				};
			} else {
				throw new Error(`MSG91 API returned status: ${response.status}`);
			}
		} catch (error: any) {
			console.error("MSG91 OTP API Error:", error.response?.data || error.message);
			throw new Error(`Failed to send OTP: ${error.response?.data?.message || error.message}`);
		}
	}

	/**
	 * Verify OTP using MSG91's verification service
	 * @param phoneNumber - Target phone number
	 * @param otp - OTP to verify
	 * @returns Promise with verification result
	 */
	async verifyOTP(phoneNumber: string, otp: string): Promise<boolean> {
		const formattedPhone = this.formatPhoneNumber(phoneNumber);

		try {
			const payload = {
				authkey: this.authKey,
				mobile: formattedPhone,
				otp: otp
			};

			const response = await axios.post(`${this.baseUrl}/otp/verify`, payload, {
				headers: {
					authkey: this.authKey,
					accept: "application/json",
					"content-type": "application/json"
				}
			});

			return response.status === 200 && response.data.type === "success";
		} catch (error: any) {
			console.error("MSG91 OTP Verification Error:", error.response?.data || error.message);
			return false;
		}
	}

	/**
	 * Resend OTP using MSG91
	 * @param phoneNumber - Target phone number
	 * @param retryType - Type of retry (text, voice)
	 * @returns Promise with response
	 */
	async resendOTP(phoneNumber: string, retryType: "text" | "voice" = "text"): Promise<SMSResponse> {
		const formattedPhone = this.formatPhoneNumber(phoneNumber);

		try {
			const payload = {
				authkey: this.authKey,
				mobile: formattedPhone,
				retrytype: retryType
			};

			const response = await axios.post(`${this.baseUrl}/otp/retry`, payload, {
				headers: {
					authkey: this.authKey,
					accept: "application/json",
					"content-type": "application/json"
				}
			});

			if (response.status === 200) {
				return {
					request_id: response.data.request_id || "success",
					message: `OTP resent successfully via ${retryType}`,
					status: true
				};
			} else {
				throw new Error(`MSG91 API returned status: ${response.status}`);
			}
		} catch (error: any) {
			console.error("MSG91 Resend OTP Error:", error.response?.data || error.message);
			throw new Error(`Failed to resend OTP: ${error.response?.data?.message || error.message}`);
		}
	}

	/**
	 * Send custom SMS using MSG91
	 * @param phoneNumber - Target phone number
	 * @param message - Message to send
	 * @param senderId - Optional sender ID
	 * @returns Promise with response
	 */
	async sendSMS(phoneNumber: string, message: string, senderId?: string): Promise<SMSResponse> {
		const formattedPhone = this.formatPhoneNumber(phoneNumber);

		try {
			const payload = {
				authkey: this.authKey,
				mobiles: formattedPhone,
				message: message,
				sender: senderId || MSG91_CONFIG.SENDER_ID,
				route: 4 // Transactional route
			};

			const response = await axios.post(`${this.baseUrl}/sms`, payload, {
				headers: {
					authkey: this.authKey,
					accept: "application/json",
					"content-type": "application/json"
				}
			});

			if (response.status === 200) {
				return {
					request_id: response.data.request_id || "success",
					message: "SMS sent successfully",
					status: true
				};
			} else {
				throw new Error(`MSG91 API returned status: ${response.status}`);
			}
		} catch (error: any) {
			console.error("MSG91 SMS API Error:", error.response?.data || error.message);
			throw new Error(`Failed to send SMS: ${error.response?.data?.message || error.message}`);
		}
	}

	/**
	 * Get account balance from MSG91
	 * @returns Promise with balance information
	 */
	async getBalance(): Promise<{ balance: number; type: string }> {
		try {
			const response = await axios.get(`${this.baseUrl}/user/getBalance`, {
				headers: {
					authkey: this.authKey,
					accept: "application/json"
				}
			});

			if (response.status === 200) {
				return {
					balance: response.data.balance || 0,
					type: response.data.type || "unknown"
				};
			} else {
				throw new Error(`MSG91 API returned status: ${response.status}`);
			}
		} catch (error: any) {
			console.error("MSG91 Balance API Error:", error.response?.data || error.message);
			throw new Error(`Failed to get balance: ${error.response?.data?.message || error.message}`);
		}
	}
}

// Export singleton instance
export const msg91Service = new MSG91Service();
