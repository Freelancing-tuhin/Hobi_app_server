# MSG91 Integration Guide

This guide explains how MSG91 has been integrated into the Hobi App Server for OTP and SMS functionality.

## Overview

MSG91 is integrated to provide:

-   OTP generation and sending
-   OTP verification
-   Custom SMS messaging
-   Account balance checking

## Configuration

### Environment Variables

Add the following to your `.env` file:

```env
# MSG91 Configuration
MSG91_AUTH_KEY=your_auth_key_here
MSG91_TEMPLATE_ID=your_template_id_here
MSG91_SENDER_ID=your_sender_id_here
```

### Config File

The configuration is loaded in `src/config/config.ts`:

```typescript
export const MSG91_CONFIG = {
	AUTH_KEY: process.env.MSG91_AUTH_KEY || "default_key",
	TEMPLATE_ID: process.env.MSG91_TEMPLATE_ID || "default_template",
	SENDER_ID: process.env.MSG91_SENDER_ID || "HOBIPL",
	BASE_URL: "https://control.msg91.com/api/v5"
};
```

## Services Available

### 1. MSG91Service Class (`src/services/msg91Service.ts`)

A comprehensive service class with the following methods:

-   `sendOTP(phoneNumber)` - Send OTP using MSG91's built-in service
-   `verifyOTP(phoneNumber, otp)` - Verify OTP
-   `sendOTPWithTemplate(phoneNumber, otp, templateId)` - Send OTP with custom template
-   `resendOTP(phoneNumber, retryType)` - Resend OTP via text or voice
-   `sendSMS(phoneNumber, message, senderId)` - Send custom SMS
-   `getBalance()` - Get account balance

### 2. Legacy Service (`src/services/generateOtp.ts`)

Updated legacy service with:

-   `generateOtp(phoneNumber)` - Generate and send OTP with custom template
-   `sendOtpViaMSG91(phoneNumber)` - Alternative OTP sending method
-   `verifyOtpViaMSG91(phoneNumber, otp)` - OTP verification

## API Endpoints

### Authentication Routes (`/api/v1/auth/`)

1. **POST `/get-otp`** - Original OTP generation (custom template)

    ```json
    {
    	"phone": "9999999999"
    }
    ```

2. **POST `/send-otp`** - New OTP service (MSG91 built-in)

    ```json
    {
    	"phone": "9999999999"
    }
    ```

3. **POST `/verify-otp`** - Verify OTP
    ```json
    {
    	"phone": "9999999999",
    	"otp": "1234"
    }
    ```

## Phone Number Format

The system accepts various phone number formats:

-   `9999999999` (10 digits)
-   `+919999999999` (with country code)
-   `919999999999` (without + but with country code)
-   `99999 99999` (with spaces)

All formats are automatically converted to MSG91's required format.

## Error Handling

The integration includes comprehensive error handling:

-   Network connectivity issues
-   MSG91 API errors
-   Invalid phone number formats
-   Rate limiting
-   Authentication failures

## Testing

Run the test suite:

```typescript
import { testMSG91Integration } from "./src/tests/msg91Test";

// Update test phone number first
await testMSG91Integration();
```

## Usage Examples

### In Controllers

```typescript
import { msg91Service } from "../../../services/msg91Service";

// Send OTP
const response = await msg91Service.sendOTP(phoneNumber);

// Verify OTP
const isValid = await msg91Service.verifyOTP(phoneNumber, otp);

// Send custom SMS
const smsResponse = await msg91Service.sendSMS(phoneNumber, "Welcome to Hobi App!", "HOBAPP");
```

### Phone Number Validation

```typescript
const phoneRegex = /^(\+91|91)?[6-9]\d{9}$/;
const isValidPhone = phoneRegex.test(phone.replace(/\s+/g, ""));
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to version control
2. **Rate Limiting**: Implement rate limiting for OTP endpoints
3. **Phone Validation**: Always validate phone numbers before sending
4. **Error Messages**: Don't expose sensitive information in error messages

## Monitoring

Monitor the following:

-   MSG91 account balance
-   API response times
-   Error rates
-   OTP delivery success rates

## Troubleshooting

### Common Issues

1. **Invalid Auth Key**: Check your MSG91 auth key in environment variables
2. **Template Not Found**: Verify your template ID is correct and approved
3. **Phone Number Format**: Ensure phone numbers follow Indian format
4. **Rate Limiting**: MSG91 has rate limits; implement queuing if needed

### Debug Mode

Enable debug logging by setting:

```typescript
console.log("MSG91 Response:", response.data);
```

## Future Enhancements

-   Add support for international phone numbers
-   Implement OTP retry logic with exponential backoff
-   Add delivery status webhooks
-   Implement SMS templates for different use cases
-   Add bulk SMS functionality

## Support

For MSG91 specific issues:

-   Check MSG91 documentation: https://docs.msg91.com/
-   Contact MSG91 support for API issues
-   Check account balance and limits

For integration issues:

-   Review error logs
-   Verify environment variables
-   Test with MSG91's test numbers first
