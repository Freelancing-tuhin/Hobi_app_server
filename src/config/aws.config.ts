import { S3Client } from "@aws-sdk/client-s3";

const credential = {
	accessKeyId: "AKIAXZ5NGBG43LQTXUZL",
	secretAccessKey: "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"
};

export const s3Client = new S3Client({
	region: "eu-north-1",
	credentials: credential
});

export const s3Url = "https://hobiapp.s3.eu-north-1.amazonaws.com";

export const bucketName = "hobiapp";
