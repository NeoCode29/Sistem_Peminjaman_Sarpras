"use server";

import { google } from 'googleapis';
import { Readable } from 'stream';
import { env } from '@/env.mjs';
import { DriveError } from './types';

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: env.GOOGLE_CLIENT_EMAIL,
    private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const drive = google.drive({ version: 'v3', auth });
const PENGAJUAN_FOLDER_NAME = 'pengajuan';
// const PDF_MIME_TYPE = 'application/pdf';

/**
 * Gets or creates the pengajuan folder
 * @returns folder ID
 * @throws {DriveError} If folder creation fails
 */
const getPengajuanFolderId = async (): Promise<string> => {
  console.log("[peminjamanDrive] Getting or creating pengajuan folder");
  
  try {
    if (!env.GOOGLE_DRIVE_FOLDER_ID) {
      console.error("[peminjamanDrive] Parent folder ID not configured");
      const error = new Error('Parent folder ID not configured') as DriveError;
      error.code = 'CONFIG_ERROR';
      throw error;
    }

    // Check if folder exists
    console.log("[peminjamanDrive] Checking if pengajuan folder exists");
    const folderQuery = await drive.files.list({
      q: `name='${PENGAJUAN_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and '${env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id, name)',
    });

    // If folder exists, return its ID
    if (folderQuery.data.files && folderQuery.data.files.length > 0) {
      console.log("[peminjamanDrive] Found existing pengajuan folder:", folderQuery.data.files[0].id);
      return folderQuery.data.files[0].id!;
    }

    // Create new folder if it doesn't exist
    console.log("[peminjamanDrive] Creating new pengajuan folder");
    const folder = await drive.files.create({
      fields: 'id',
      requestBody: {
        name: PENGAJUAN_FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
        parents: [env.GOOGLE_DRIVE_FOLDER_ID],
      },
    });

    if (!folder.data.id) {
      console.error("[peminjamanDrive] Failed to create pengajuan folder");
      const error = new Error('Failed to create pengajuan folder') as DriveError;
      error.code = 'FOLDER_CREATE_ERROR';
      throw error;
    }

    console.log("[peminjamanDrive] Created new pengajuan folder:", folder.data.id);
    return folder.data.id;
  } catch (error: unknown) {
    console.error("[peminjamanDrive] Error in getPengajuanFolderId:", error);
    const driveError = new Error(
      error instanceof Error ? error.message : "Failed to get pengajuan folder"
    ) as DriveError;
    driveError.code = (error as { code?: string }).code || 'UNKNOWN_ERROR';
    driveError.details = error;
    throw driveError;
  }
};

/**
 * Uploads a loan request letter (PDF only) to Google Drive
 * @param file - PDF file buffer
 * @param fileName - Original file name
 * @returns Promise<DriveUploadResult> - The public URL and ID of the uploaded file
 * @throws {DriveError} If upload fails
 */
export async function uploadSuratPeminjaman(file: Buffer, fileName: string): Promise<{ fileId: string; url: string }> {
  console.log("[peminjamanDrive] Starting upload process for file:", fileName);
  
  try {
    // Validate inputs
    if (!file || !fileName) {
      console.error("[peminjamanDrive] Missing file or filename");
      throw new Error('File and filename are required') as DriveError;
    }

    // Validate file is PDF
    const isPDF = fileName.toLowerCase().endsWith('.pdf');
    if (!isPDF) {
      console.error("[peminjamanDrive] Invalid file type, not PDF");
      throw new Error('File must be PDF') as DriveError;
    }

    // Create folder if not exists
    const folderId = await getPengajuanFolderId();
    if (!folderId) {
      throw new Error('Failed to create or get folder') as DriveError;
    }

    // Convert Buffer to Readable stream
    const stream = new Readable();
    stream.push(file);
    stream.push(null); // End of stream

    // Upload file
    const response = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType: 'application/pdf',
        parents: [folderId],
      },
      media: {
        mimeType: 'application/pdf',
        body: stream,
      },
      fields: 'id, webViewLink',
    });

    if (!response.data.id || !response.data.webViewLink) {
      throw new Error('Failed to get file ID or URL') as DriveError;
    }

    console.log("[peminjamanDrive] File uploaded successfully:", response.data.id);
    return {
      fileId: response.data.id,
      url: response.data.webViewLink,
    };
  } catch (error) {
    console.error("[peminjamanDrive] Upload error details:", {
      error,
      message: error instanceof Error ? error.message : "Unknown error",
      code: error instanceof Error ? (error as { code?: string }).code : undefined,
      stack: error instanceof Error ? error.stack : undefined,
    });

    const driveError = new Error(
      error instanceof Error ? error.message : "Failed to upload surat peminjaman"
    ) as DriveError;
    driveError.code = error instanceof Error ? (error as { code?: string }).code || 'UNKNOWN_ERROR' : 'UNKNOWN_ERROR';
    throw driveError;
  }
}

/**
 * Deletes a loan request letter from Google Drive
 * @param fileId - Google Drive file ID to delete
 * @throws {DriveError} If deletion fails
 */
export const deleteSuratPeminjaman = async (fileId: string): Promise<void> => {
  console.log("[peminjamanDrive] Starting file deletion for ID:", fileId);
  
  try {
    if (!fileId) {
      console.error("[peminjamanDrive] No file ID provided");
      throw new Error("File ID is required");
    }

    console.log("[peminjamanDrive] Attempting to delete file");
    await drive.files.delete({ fileId });
    console.log("[peminjamanDrive] File deleted successfully");
  } catch (error: unknown) {
    console.error("[peminjamanDrive] Delete error details:", {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      code: (error as { code?: string }).code,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Check if error is from Google Drive API
    if (error && typeof error === 'object' && 'response' in error) {
      const apiError = error as { response: { status: number; statusText: string; data: unknown } };
      console.error("[peminjamanDrive] Google Drive API error response:", {
        status: apiError.response.status,
        statusText: apiError.response.statusText,
        data: apiError.response.data,
      });
    }

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const driveError = new Error(`Failed to delete surat peminjaman: ${errorMessage}`) as DriveError;
    driveError.code = (error as { code?: string }).code || 'UNKNOWN_ERROR';
    driveError.details = error;
    throw driveError;
  }
};
