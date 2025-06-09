import { google } from 'googleapis';
import { Readable } from 'stream';

// Initialize Google Drive API client
const initializeGoogleDrive = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  return google.drive({ version: 'v3', auth });
};

interface UploadPeminjamanOptions {
  file: Buffer;
  fileName: string;
}

const PARENT_FOLDER_ID = process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;
const PDF_MIME_TYPE = 'application/pdf';
const SURAT_PENGAJUAN_FOLDER_NAME = 'surat pengajuan';

/**
 * Gets or creates the surat pengajuan folder
 * @returns folder ID
 */
const getSuratPengajuanFolderId = async (): Promise<string> => {
  const drive = initializeGoogleDrive();

  if (!PARENT_FOLDER_ID) {
    throw new Error('Parent folder ID belum dikonfigurasi di environment variables');
  }

  // Check if folder exists
  const folderQuery = await drive.files.list({
    q: `name='${SURAT_PENGAJUAN_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and '${PARENT_FOLDER_ID}' in parents and trashed=false`,
    fields: 'files(id, name)',
  });

  // If folder exists, return its ID
  if (folderQuery.data.files && folderQuery.data.files.length > 0) {
    return folderQuery.data.files[0].id!;
  }

  // Create new folder if it doesn't exist
  const folder = await drive.files.create({
    fields: 'id',
    requestBody: {
      name: SURAT_PENGAJUAN_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      parents: [PARENT_FOLDER_ID],
    },
  });

  if (!folder.data.id) {
    throw new Error('Gagal membuat folder surat pengajuan');
  }

  return folder.data.id;
};

/**
 * Uploads a loan request letter (PDF only) to Google Drive
 * @param file - PDF file buffer
 * @param fileName - Original file name
 * @returns Object containing file ID and web view link
 * @throws Error if file is not PDF or upload fails
 */
export const uploadSuratPeminjaman = async ({
  file,
  fileName,
}: UploadPeminjamanOptions): Promise<{ fileId: string; webViewLink: string }> => {
  try {
    // Validate file is PDF
    const isPDF = fileName.toLowerCase().endsWith('.pdf');
    if (!isPDF) {
      throw new Error('File harus berformat PDF');
    }

    const drive = initializeGoogleDrive();
    
    // Get or create surat pengajuan folder
    const folderId = await getSuratPengajuanFolderId();
    
    // Generate timestamp for file name
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalFileName = `${timestamp}-${fileName}`;

    // Upload file
    const uploadedFile = await drive.files.create({
      fields: 'id, webViewLink',
      requestBody: {
        name: finalFileName,
        parents: [folderId],
      },
      media: {
        mimeType: PDF_MIME_TYPE,
        body: Readable.from(file),
      },
    });

    if (!uploadedFile.data.id || !uploadedFile.data.webViewLink) {
      throw new Error('Gagal mengupload file');
    }

    // Set file permissions to anyone with link can view
    await drive.permissions.create({
      fileId: uploadedFile.data.id,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return {
      fileId: uploadedFile.data.id,
      webViewLink: uploadedFile.data.webViewLink,
    };
  } catch (error) {
    console.error('Error uploading file to Google Drive:', error);
    throw new Error('Gagal mengupload surat peminjaman');
  }
};

/**
 * Deletes a loan request letter from Google Drive
 * @param fileId - Google Drive file ID to delete
 */
export const deleteSuratPeminjaman = async (fileId: string): Promise<void> => {
  try {
    const drive = initializeGoogleDrive();
    await drive.files.delete({ fileId });
  } catch (error) {
    console.error('Error deleting file from Google Drive:', error);
    throw new Error('Gagal menghapus surat peminjaman');
  }
};
