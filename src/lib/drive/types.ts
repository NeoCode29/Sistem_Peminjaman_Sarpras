/**
 * Common types for drive modules
 */

export interface DriveUploadResult {
  url: string;
  fileId: string;
}

export interface DriveError extends Error {
  code?: string;
  details?: unknown;
} 