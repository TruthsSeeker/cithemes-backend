import { S3 } from "@aws-sdk/client-s3";

const s3Client = new S3({
  endpoint: process.env.SPACE_ENDPOINT,
  region: process.env.SPACE_REGION,
  credentials: {
    accessKeyId: process.env.CDN_KEY ?? "",
    secretAccessKey: process.env.CDN_SECRET ?? "",
  },
});

export { s3Client };