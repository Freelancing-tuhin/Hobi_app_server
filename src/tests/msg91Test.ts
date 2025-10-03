import { msg91Service } from "../services/msg91Service";
import { generateOtp } from "../services/generateOtp";

/**
 * Test script to verify MSG91 integration
 * This script demonstrates how to use the MSG91 services
 */

async function testMSG91Integration() {
	console.log("🚀 Testing MSG91 Integration...\n");

	// Test phone number (replace with actual number for testing)
	const testPhoneNumber = "9999999999"; // Replace with actual phone number

	try {
		console.log("1. Testing Account Balance...");
		const balance = await msg91Service.getBalance();
		console.log("✅ Account Balance:", balance);
		console.log("");

		console.log("2. Testing Custom OTP Generation and Flow API...");
		const customOtpResponse = await generateOtp(testPhoneNumber);
		console.log("✅ Custom OTP Response:", customOtpResponse);
		console.log("");

		console.log("3. Testing MSG91 Built-in OTP Service...");
		const otpResponse = await msg91Service.sendOTP(testPhoneNumber);
		console.log("✅ MSG91 OTP Response:", otpResponse);
		console.log("");

		console.log("4. Testing Custom SMS...");
		const smsResponse = await msg91Service.sendSMS(
			testPhoneNumber,
			"Welcome to Hobi App! Your account has been created successfully.",
			"HOBAPP"
		);
		console.log("✅ SMS Response:", smsResponse);
		console.log("");

		console.log("5. Testing OTP Verification (will fail with dummy OTP)...");
		const verificationResult = await msg91Service.verifyOTP(testPhoneNumber, "1234");
		console.log("🔍 Verification Result (expected false):", verificationResult);
		console.log("");

		console.log("🎉 All MSG91 integration tests completed!");
	} catch (error: any) {
		console.error("❌ Error during testing:", error.message);
		console.error("Full error:", error);
	}
}

/**
 * Test phone number validation
 */
function testPhoneNumberValidation() {
	console.log("📱 Testing Phone Number Validation...\n");

	const testNumbers = [
		"9999999999", // Valid 10-digit
		"+919999999999", // Valid with +91
		"919999999999", // Valid with 91
		"99999 99999", // Valid with spaces
		"8888888888", // Valid different number
		"1234567890", // Invalid (doesn't start with 6-9)
		"99999999", // Invalid (too short)
		"999999999999", // Invalid (too long)
		"abc1234567" // Invalid (contains letters)
	];

	const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;

	testNumbers.forEach((number, index) => {
		const cleaned = number.replace(/\s+/g, "");
		const isValid = phoneRegex.test(cleaned);
		console.log(`${index + 1}. ${number} -> ${isValid ? "✅ Valid" : "❌ Invalid"}`);
	});

	console.log("");
}

/**
 * Example usage in controller context
 */
function showControllerExample() {
	console.log("💡 Example Controller Usage:\n");

	const exampleCode = `
// In your controller:
import { msg91Service } from '../../../services/msg91Service';

export const sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;
        
        // Send OTP
        const response = await msg91Service.sendOTP(phone);
        
        res.status(200).json({
            message: 'OTP sent successfully',
            request_id: response.request_id
        });
    } catch (error) {
        res.status(400).json({
            message: 'Failed to send OTP',
            error: error.message
        });
    }
};

export const verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;
        
        // Verify OTP
        const isValid = await msg91Service.verifyOTP(phone, otp);
        
        if (isValid) {
            res.status(200).json({ message: 'OTP verified successfully' });
        } else {
            res.status(400).json({ message: 'Invalid OTP' });
        }
    } catch (error) {
        res.status(400).json({
            message: 'Verification failed',
            error: error.message
        });
    }
};
    `;

	console.log(exampleCode);
}

// Main execution
if (require.main === module) {
	console.log("🔧 MSG91 Integration Test Suite\n");
	console.log("⚠️  Make sure to update the test phone number before running!\n");

	testPhoneNumberValidation();
	showControllerExample();

	// Uncomment the line below to run actual API tests
	// testMSG91Integration();
}

export { testMSG91Integration, testPhoneNumberValidation, showControllerExample };
