"use server"

import { google } from "googleapis"
import { Readable } from "stream"
import path from "path"

// Initialize Google Drive API
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive.file"],
})

const drive = google.drive({ version: "v3", auth })

async function createFolderIfNotExists(folderName: string): Promise<string> {
  try {
    if (!process.env.GOOGLE_DRIVE_FOLDER_ID) {
      throw new Error("GOOGLE_DRIVE_FOLDER_ID is not configured")
    }

    // Check if folder exists
    const response = await drive.files.list({
      q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents and trashed=false`,
      fields: "files(id, name)",
    })

    if (response.data.files && response.data.files.length > 0) {
      return response.data.files[0].id!
    }

    // Create folder if it doesn't exist
    const folderMetadata = {
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
      parents: [process.env.GOOGLE_DRIVE_FOLDER_ID],
    }

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id",
    })

    if (!folder.data.id) {
      throw new Error("Failed to create folder: No ID returned")
    }

    return folder.data.id
  } catch (error: any) {
    console.error("Error creating/finding folder:", error)
    if (error.message.includes("invalid_grant")) {
      throw new Error("Google Drive authentication failed. Please check your credentials.")
    }
    throw new Error(`Failed to create/find folder in Google Drive: ${error.message}`)
  }
}

export async function uploadSaranaImage(file: File): Promise<string> {
  try {
    // Validate file
    if (!file) {
      throw new Error("No file provided")
    }

    if (!file.type.startsWith("image/")) {
      throw new Error("File must be an image")
    }

    // Get or create sarana folder
    const saranaFolderId = await createFolderIfNotExists("sarana")

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Create readable stream from buffer
    const stream = new Readable()
    stream.push(buffer)
    stream.push(null)

    // Get file extension
    const ext = path.extname(file.name)

    // Create file metadata
    const fileMetadata = {
      name: `sarana_${Date.now()}${ext}`,
      parents: [saranaFolderId],
    }

    // Create media
    const media = {
      mimeType: file.type,
      body: stream,
    }

    // Upload file
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    })

    if (!response.data.id) {
      throw new Error("Failed to upload file: No ID returned")
    }

    // Make file publicly accessible
    await drive.permissions.create({
      fileId: response.data.id,
      requestBody: {
        role: "reader",
        type: "anyone",
      },
    })

    // Return direct image URL
    return `https://drive.google.com/uc?id=${response.data.id}`
  } catch (error: any) {
    console.error("Error uploading sarana image:", error)
    if (error.message.includes("invalid_grant")) {
      throw new Error("Google Drive authentication failed. Please check your credentials.")
    }
    throw new Error(`Failed to upload sarana image: ${error.message}`)
  }
}

export async function deleteSaranaImage(fileUrl: string) {
  try {
    if (!fileUrl) {
      throw new Error("No file URL provided")
    }

    // Extract file ID from URL
    const matches = fileUrl.match(/id=([-\w]+)/) || fileUrl.match(/[-\w]{25,}/)
    if (!matches) {
      throw new Error("Invalid Google Drive URL")
    }
    const fileId = matches[1] || matches[0]

    // Delete file
    await drive.files.delete({
      fileId,
    })

    return true
  } catch (error: any) {
    console.error("Error deleting sarana image:", error)
    if (error.message.includes("invalid_grant")) {
      throw new Error("Google Drive authentication failed. Please check your credentials.")
    }
    throw new Error(`Failed to delete sarana image: ${error.message}`)
  }
} 