const SECRET_KEY = 7; // You can use any number here as a shift key

export const encryptData = (text: string): string => {
	let encrypted = "";
	for (let i = 0; i < text.length; i++) {
		encrypted += String.fromCharCode(text.charCodeAt(i) + SECRET_KEY);
	}
	return Buffer.from(encrypted).toString("base64");
};

export const decryptData = (encoded: string): string => {
	const decoded = Buffer.from(encoded, "base64").toString("utf-8");
	let decrypted = "";
	for (let i = 0; i < decoded.length; i++) {
		decrypted += String.fromCharCode(decoded.charCodeAt(i) - SECRET_KEY);
	}
	return decrypted;
};
