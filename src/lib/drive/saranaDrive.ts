import { google } from 'googleapis';
import { Readable } from 'stream';
import { env } from '@/env.mjs';
// import { validateImage } from '../utils/image-validation';
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
 * Uploads an image to the Sarana folder in Google Drive
 * @param file - The file to upload
 * @returns Promise<DriveUploadResult> - The public URL and ID of the uploaded file
 * @throws {DriveError} If upload fails
 */
export async function uploadImage(file: File): Promise<DriveUploadResult> {
  try {
    if (!file) {
      const error = new Error("No file provided") as DriveError;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      const error = new Error("File must be an image") as DriveError;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      const error = new Error("File size must be less than 5MB") as DriveError;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create readable stream from buffer
    const stream = new Readable();
    stream.push(buffer);
    stream.push(null);

    const fileMetadata = {
      name: `sarana_${Date.now()}_${file.name}`,
      parents: [env.GOOGLE_DRIVE_FOLDER_ID],
    };

    const media = {
      mimeType: file.type,
      body: stream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    if (!response.data.id) {
      const error = new Error("Failed to get file ID from Google Drive") as DriveError;
      error.code = 'UPLOAD_ERROR';
      throw error;
    }

    // Make the file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    });

    // Return the direct download link
    return {
      url: `https://drive.google.com/uc?id=${response.data.id}`,
      fileId: response.data.id,
    };
  } catch (error) {
    console.error("[uploadImage] Error:", error);
    const driveError = new Error(
      error instanceof Error ? error.message : "Failed to upload image"
    ) as DriveError;
    driveError.code = (error as DriveError).code || 'UNKNOWN_ERROR';
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
  try {
    if (!fileId) {
      const error = new Error("No file ID provided") as DriveError;
      error.code = 'VALIDATION_ERROR';
      throw error;
    }

    await drive.files.delete({
      fileId: fileId,
    });
  } catch (error) {
    console.error("[deleteFile] Error:", error);
    const driveError = new Error(
      error instanceof Error ? error.message : "Failed to delete file"
    ) as DriveError;
    driveError.code = (error as DriveError).code || 'UNKNOWN_ERROR';
    driveError.details = error;
    throw driveError;
  }
} 