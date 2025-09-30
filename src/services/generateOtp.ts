import axios from "axios";

export const generateOtp = async (phone_no: string): Promise<string> => {
	const otp = Math.floor(1000 + Math.random() * 9000).toString();
	// let formattedPhoneNo = phone_no;
	// if (phone_no.includes("+")) {
	// 	formattedPhoneNo = phone_no.replace("+", "");
	// }
	try {
		const options = {
			method: "POST",
			url: "https://control.msg91.com/api/v5/flow",
			headers: {
				authkey: "404360AuCkv4BTZfc64f718f3P1",
				accept: "application/json",
				"content-type": "application/JSON"
			},
			data: `{\n  "template_id": "6616cf19d6fc05549771acc2",\n \n  "recipients": [\n    {\n      "mobiles": ${phone_no},\n      "var": ${otp}\n      \n    }\n  ]\n}`
		};

		const response = await axios.request(options);
		console.log("===>response", response.data);
		if (response.status === 200) return otp;
		else throw new Error("OTP generation failed");
	} catch (error) {
		console.error("Error while sending OTP:", error);
		throw new Error("OTP generation failed");
	}
};
