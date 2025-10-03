import { MSG91Service } from "../services/msg91Service";
import { generateOtp } from "../services/generateOtp";

/**
 * Test function to verify MSG91 template integration
 */
export const testSimpleTemplate = async (phoneNumber: string) => {
	try {
		console.log("🧪 Testing MSG91 Simple Template Integration...");

		// Generate a test OTP
		const { otp } = await generateOtp(phoneNumber);
		console.log(`📱 Generated OTP: ${otp}`);

		// Initialize MSG91 service
		const msg91Service = new MSG91Service();

		// Send OTP using the simple template
		const response = await msg91Service.sendOTPWithTemplate(phoneNumber, otp);

		console.log("✅ OTP sent successfully!");
		console.log("📋 Response:", response);

		return {
			success: true,
			otp,
			response
		};
	} catch (error: any) {
		console.error("❌ Template test failed:", error.message);
		return {
			success: false,
			error: error.message
		};
	}
};

/**
 * Test function to verify OTP verification
 */
export const testOTPVerification = async (phoneNumber: string, otp: string) => {
	try {
		console.log("🔍 Testing OTP Verification...");

		const msg91Service = new MSG91Service();
		const isValid = await msg91Service.verifyOTP(phoneNumber, otp);

		if (isValid) {
			console.log("✅ OTP verified successfully!");
		} else {
			console.log("❌ OTP verification failed!");
		}

		return isValid;
	} catch (error: any) {
		console.error("❌ OTP verification test failed:", error.message);
		return false;
	}
};

// Example usage (uncomment to test)
// testSimpleTemplate("+919876543210");
