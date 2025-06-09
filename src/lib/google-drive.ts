import { google } from 'googleapis'
import { Readable } from 'stream'
import { env } from '@/env.mjs'

const SCOPES = ['https://www.googleapis.com/auth/drive.file']
const FOLDER_MIME = 'application/vnd.google-apps.folder'
const IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif'
]

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: env.GOOGLE_CLIENT_EMAIL,
    private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: SCOPES,
})

const drive = google.drive({ version: 'v3', auth })

export class GoogleDriveService {
  private static instance: GoogleDriveService
  private saranaFolderId: string | null = null
  private prasaranaFolderId: string | null = null

  private constructor() {}

  static async getInstance(): Promise<GoogleDriveService> {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService()
      await GoogleDriveService.instance.initFolders()
    }
    return GoogleDriveService.instance
  }

  private async initFolders() {
    // Check and create Sarpras folder
    const sarprasFolder = await this.findOrCreateFolder('Sarpras', 'root')
    
    // Create Sarana and Prasarana subfolders
    this.saranaFolderId = await this.findOrCreateFolder('Sarana', sarprasFolder)
    this.prasaranaFolderId = await this.findOrCreateFolder('Prasarana', sarprasFolder)
  }

  private async findOrCreateFolder(name: string, parentId: string): Promise<string> {
    try {
      // Search for existing folder
      const response = await drive.files.list({
        q: `name='${name}' and mimeType='${FOLDER_MIME}' and '${parentId}' in parents and trashed=false`,
        fields: 'files(id, name)',
      })

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0].id || ''
      }

      // Create new folder if not found
      const folderMetadata = {
        name,
        mimeType: FOLDER_MIME,
        parents: [parentId],
      }

      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: 'id, name',
      })

      return folder.data.id || ''
    } catch (error) {
      console.error('Error in findOrCreateFolder:', error)
      throw new Error('Failed to initialize folders')
    }
  }

  async uploadFile(file: File, type: 'sarana' | 'prasarana'): Promise<string> {
    try {
      const folderId = type === 'sarana' ? this.saranaFolderId : this.prasaranaFolderId
      if (!folderId) throw new Error('Folder not initialized')

      if (!IMAGE_MIME_TYPES.includes(file.type)) {
        throw new Error('Invalid file type. Only images are allowed.')
      }

      const buffer = await file.arrayBuffer()
      const stream = new Readable()
      stream.push(Buffer.from(buffer))
      stream.push(null)

      const response = await drive.files.create({
        requestBody: {
          name: `${Date.now()}-${file.name}`,
          parents: [folderId],
        },
        media: {
          mimeType: file.type,
          body: stream,
        },
        fields: 'id, webViewLink',
      })

      if (!response.data.id) throw new Error('Failed to upload file')

      // Make the file publicly accessible
      await drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      })

      // Get the direct download link
      const fileData = await drive.files.get({
        fileId: response.data.id,
        fields: 'webContentLink',
      })

      return fileData.data.webContentLink || ''
    } catch (error) {
      console.error('Error in uploadFile:', error)
      throw new Error('Failed to upload file')
    }
  }

  async deleteFile(fileUrl: string) {
    try {
      // Extract file ID from the URL
      const fileId = fileUrl.split('id=')[1]?.split('&')[0]
      if (!fileId) throw new Error('Invalid file URL')

      await drive.files.delete({
        fileId,
      })
    } catch (error) {
      console.error('Error in deleteFile:', error)
      throw new Error('Failed to delete file')
    }
  }
} 