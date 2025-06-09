import { google } from 'googleapis';
import { Readable } from 'stream';
import { env } from '@/env.mjs';
import { validateImage } from '../utils/image-validation';
import { DriveUploadResult, DriveError } from './types';

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: env.GOOGLE_CLIENT_EMAIL,
    private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });

/**
 * Uploads an image to the Prasarana folder in Google Drive
 * @param file - The file to upload
 * @returns Promise<DriveUploadResult> - The public URL and ID of the uploaded file
 * @throws {DriveError} If upload fails
 */
export async function uploadImage(file: File): Promise<DriveUploadResult> {
  console.log("[prasaranaDrive] Starting image upload process for file:", {
    name: file.name,
    type: file.type,
    size: file.size,
  });

  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      console.error("[prasaranaDrive] Invalid file type:", file.type);
      const error = new Error("File must be an image") as DriveError;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error("[prasaranaDrive] File too large:", file.size);
      const error = new Error("File size must be less than 5MB") as DriveError;
      error.code = "VALIDATION_ERROR";
      throw error;
    }

    console.log("[prasaranaDrive] File validation passed");

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log("[prasaranaDrive] File converted to buffer, size:", buffer.length);

    // Create readable stream from buffer
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);
    console.log("[prasaranaDrive] Created readable stream");

    // Create file metadata
    const fileMetadata = {
      name: `prasarana_${Date.now()}_${file.name}`,
      parents: [env.GOOGLE_DRIVE_FOLDER_ID],
    };
    console.log("[prasaranaDrive] File metadata:", fileMetadata);

    // Create media
    const media = {
      mimeType: file.type,
      body: stream,
    };
    console.log("[prasaranaDrive] Media object created");

    // Upload file
    console.log("[prasaranaDrive] Starting file upload to Google Drive");
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });
    console.log("[prasaranaDrive] File upload response:", response.data);

    if (!response.data.id) {
      console.error("[prasaranaDrive] No file ID in response");
      const error = new Error("Failed to upload file: No ID returned") as DriveError;
      error.code = "UPLOAD_ERROR";
      throw error;
    }

    // Make file publicly accessible
    console.log("[prasaranaDrive] Setting file permissions");
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });
    console.log("[prasaranaDrive] File permissions set successfully");

    const result = {
      url: `https://drive.google.com/uc?id=${response.data.id}`,
      fileId: response.data.id,
    };
    console.log("[prasaranaDrive] Upload completed successfully:", result);

    return result;
  } catch (error: any) {
    console.error("[prasaranaDrive] Upload error details:", {
      error: error,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    // Check if error is from Google Drive API
    if (error.response) {
      console.error("[prasaranaDrive] Google Drive API error response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    }

    const driveError = new Error(
      error instanceof Error ? error.message : "Failed to upload image"
    ) as DriveError;
    driveError.code = error.code || "UNKNOWN_ERROR";
    driveError.details = error;
    throw driveError;
  }
}

/**
 * Deletes a file from Google Drive
 * @param fileId - The ID of the file to delete
 * @throws {DriveError} If deletion fails
 */
export async function deleteFile(fileId: string): Promise<void> {
  console.log("[prasaranaDrive] Starting file deletion for ID:", fileId);
  
  try {
    if (!fileId) {
      console.error("[prasaranaDrive] No file ID provided");
      throw new Error("File ID is required");
    }

    console.log("[prasaranaDrive] Attempting to delete file");
    await drive.files.delete({ fileId });
    console.log("[prasaranaDrive] File deleted successfully");
  } catch (error: any) {
    console.error("[prasaranaDrive] Delete error details:", {
      error: error,
      message: error.message,
      code: error.code,
      stack: error.stack,
    });

    // Check if error is from Google Drive API
    if (error.response) {
      console.error("[prasaranaDrive] Google Drive API error response:", {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      });
    }

    const driveError = new Error(`Failed to delete prasarana image: ${error.message}`) as DriveError;
    driveError.code = error.code || 'UNKNOWN_ERROR';
    driveError.details = error;
    throw driveError;
  }
} 