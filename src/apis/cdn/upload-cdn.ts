import { PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import { s3Client } from "./s3-client";

export const upload = async (params: PutObjectCommandInput) => {
  
  const command = new PutObjectCommand(params);

  let results = await s3Client.send(command);
  console.log(JSON.stringify(results));
}