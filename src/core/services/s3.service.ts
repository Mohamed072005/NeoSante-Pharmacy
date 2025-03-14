import { BadRequestException, Injectable } from "@nestjs/common";
import * as process from "node:process";
import { s3Client } from "../config/aws.config";
import { Upload } from '@aws-sdk/lib-storage';
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

@Injectable()
export class S3Service {
  private readonly bucketName : string = process.env.AWS_BUCKET_NAME;

  async uploadFile(file: Express.Multer.File, key: string): Promise<string> {
    try {
      if (!file.buffer && !file.stream) {
        throw new BadRequestException('File buffer and stream are undefined');
      }

      const body = file.buffer || file.stream;
      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: this.bucketName,
          Key: key,
          Body: body,
          ContentType: file.mimetype,
        },
      });

      await upload.done();

      return `https://${this.bucketName}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;
    } catch (error) {
      console.log(error);
      throw new BadRequestException('Failed to upload file');
    }
  }

  getKeyFromUrl(url: string): string | null {
    try {
      // Example URL: https://neo-sante-app.s3.us-east-1.amazonaws.com/pharmacy/image/1741650046741-4d26bc86-94ad-442e-bc9b-6074e1bc6a37.jpeg
      // Extract everything after the bucket name in the URL
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split('/');

      // Remove the first empty string (from the leading slash)
      pathParts.shift();

      // If the first part is the bucket name, remove it too
      if (pathParts[0] === 'neo-sante-app') {
        pathParts.shift();
      }

      // Join the remaining parts to get the key
      return pathParts.join('/');
    } catch (error) {
      console.error('Failed to parse S3 URL:', error);
      return null;
    }
  }

  async deleteFile(key: string): Promise<void> {
    try {
      // Use the AWS SDK or your existing method to delete the file
      // Example with AWS SDK v3:
      await s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        })
      );
    } catch (error) {
      console.error(`Failed to delete file with key ${key}:`, error);
      throw error;
    }
  }
}