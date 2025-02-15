import { S3Client } from "@aws-sdk/client-s3";

const credential = {
	accessKeyId: "AKIAWW2CZET5JKL6RMKC",
	secretAccessKey: "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",
};

export const s3Client = new S3Client({
	region: "ap-south-1",
	credentials: credential,
});

export const s3Url = "https://bazarpay.s3.ap-south-1.amazonaws.com";

export const bucketName = "bazarpay";
