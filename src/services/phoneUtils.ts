import { PhoneValidationResult, PhoneValidationError } from "../types/interface/msg91.interface";

/**
 * Utility functions for phone number handling and validation
 */

export class PhoneNumberUtils {
	// Indian phone number validation regex
	private static readonly INDIAN_PHONE_REGEX = /^(\+91|91)?[6-9]\d{9}$/;

	/**
	 * Validate and format Indian phone number
	 * @param phoneNumber Raw phone number input
	 * @returns Validation result with formatted number
	 */
	static validateAndFormat(phoneNumber: string): PhoneValidationResult {
		if (!phoneNumber || typeof phoneNumber !== "string") {
			return {
				isValid: false,
				formatted: "",
				error: "Phone number is required"
			};
		}

		// Remove all non-digit characters except +
		let cleaned = phoneNumber.replace(/[^\d+]/g, "");

		// Remove leading + if present
		if (cleaned.startsWith("+")) {
			cleaned = cleaned.substring(1);
		}

		// Check if it matches Indian phone number pattern
		if (!this.INDIAN_PHONE_REGEX.test(cleaned)) {
			return {
				isValid: false,
				formatted: "",
				error: "Invalid Indian phone number format. Must be 10 digits starting with 6-9"
			};
		}

		// Format for MSG91 (ensure it has country code)
		let formatted = cleaned;
		if (formatted.length === 10) {
			formatted = "91" + formatted;
		}

		return {
			isValid: true,
			formatted: formatted,
			error: undefined
		};
	}

	/**
	 * Quick validation without formatting
	 * @param phoneNumber Phone number to validate
	 * @returns True if valid Indian phone number
	 */
	static isValid(phoneNumber: string): boolean {
		return this.validateAndFormat(phoneNumber).isValid;
	}

	/**
	 * Format phone number for MSG91 API
	 * @param phoneNumber Raw phone number
	 * @returns Formatted phone number for MSG91
	 * @throws PhoneValidationError if invalid
	 */
	static formatForMSG91(phoneNumber: string): string {
		const result = this.validateAndFormat(phoneNumber);

		if (!result.isValid) {
			throw new PhoneValidationError(result.error || "Invalid phone number");
		}

		return result.formatted;
	}

	/**
	 * Format phone number for display (adds spaces for readability)
	 * @param phoneNumber Raw phone number
	 * @returns Formatted phone number for display
	 */
	static formatForDisplay(phoneNumber: string): string {
		const result = this.validateAndFormat(phoneNumber);

		if (!result.isValid) {
			return phoneNumber; // Return as-is if invalid
		}

		// Format as +91 99999 99999
		const formatted = result.formatted;
		if (formatted.length === 12 && formatted.startsWith("91")) {
			return `+91 ${formatted.substring(2, 7)} ${formatted.substring(7)}`;
		}

		return phoneNumber;
	}

	/**
	 * Extract country code from phone number
	 * @param phoneNumber Phone number
	 * @returns Country code or null if not found
	 */
	static extractCountryCode(phoneNumber: string): string | null {
		const cleaned = phoneNumber.replace(/[^\d+]/g, "");

		if (cleaned.startsWith("+91") || cleaned.startsWith("91")) {
			return "91";
		}

		return null;
	}

	/**
	 * Get phone number without country code
	 * @param phoneNumber Phone number
	 * @returns Phone number without country code
	 */
	static getWithoutCountryCode(phoneNumber: string): string {
		const result = this.validateAndFormat(phoneNumber);

		if (!result.isValid) {
			return phoneNumber;
		}

		const formatted = result.formatted;
		if (formatted.startsWith("91") && formatted.length === 12) {
			return formatted.substring(2);
		}

		return formatted;
	}

	/**
	 * Validate multiple phone numbers
	 * @param phoneNumbers Array of phone numbers
	 * @returns Array of validation results
	 */
	static validateMultiple(phoneNumbers: string[]): PhoneValidationResult[] {
		return phoneNumbers.map((phone) => this.validateAndFormat(phone));
	}

	/**
	 * Filter valid phone numbers from array
	 * @param phoneNumbers Array of phone numbers
	 * @returns Array of valid formatted phone numbers
	 */
	static filterValid(phoneNumbers: string[]): string[] {
		return phoneNumbers
			.map((phone) => this.validateAndFormat(phone))
			.filter((result) => result.isValid)
			.map((result) => result.formatted);
	}
}

/**
 * Express middleware for phone number validation
 */
export const validatePhoneNumberMiddleware = (req: any, res: any, next: any) => {
	const { phone } = req.body;

	if (!phone) {
		return res.status(400).json({
			message: "Phone number is required",
			error: "Missing phone field in request body"
		});
	}

	const validation = PhoneNumberUtils.validateAndFormat(phone);

	if (!validation.isValid) {
		return res.status(400).json({
			message: "Invalid phone number",
			error: validation.error
		});
	}

	// Add formatted phone number to request for use in controller
	req.formattedPhone = validation.formatted;
	next();
};

// Export utility functions for backward compatibility
export const formatPhoneNumber = PhoneNumberUtils.formatForMSG91;
export const isValidPhoneNumber = PhoneNumberUtils.isValid;
export const validatePhoneNumber = PhoneNumberUtils.validateAndFormat;
