import sharp from 'sharp';

export interface ImageValidationOptions {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  aspectRatio?: {
    width: number;
    height: number;
  };
}

export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
}

const DEFAULT_OPTIONS: ImageValidationOptions = {
  maxSizeBytes: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
};

export async function validateImage(
  buffer: Buffer,
  options: ImageValidationOptions = DEFAULT_OPTIONS
): Promise<ImageValidationResult> {
  try {
    // Get image metadata
    const metadata = await sharp(buffer).metadata();

    // Validate file size
    if (options.maxSizeBytes && buffer.length > options.maxSizeBytes) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${options.maxSizeBytes / (1024 * 1024)}MB`,
      };
    }

    // Map sharp formats to mime types
    const formatToMime: { [key: string]: string } = {
      jpeg: 'image/jpeg',
      jpg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
    };

    const mimeType = metadata.format ? formatToMime[metadata.format] : undefined;

    // Validate mime type
    if (options.allowedMimeTypes && (!mimeType || !options.allowedMimeTypes.includes(mimeType))) {
      return {
        isValid: false,
        error: `Invalid file format. Allowed formats: ${options.allowedMimeTypes.map(mime => mime.split('/')[1]).join(', ')}`,
      };
    }

    // Validate aspect ratio if specified
    if (options.aspectRatio && metadata.width && metadata.height) {
      const actualRatio = metadata.width / metadata.height;
      const expectedRatio = options.aspectRatio.width / options.aspectRatio.height;
      
      // Allow for small rounding differences (within 1%)
      const ratioTolerance = 0.01;
      const isRatioValid = Math.abs(actualRatio - expectedRatio) <= ratioTolerance;

      if (!isRatioValid) {
        return {
          isValid: false,
          error: `Invalid aspect ratio. Expected ${options.aspectRatio.width}:${options.aspectRatio.height}`,
        };
      }
    }

    return { isValid: true };
  } catch {
    return { isValid: false, error: "Gagal memvalidasi gambar" };
  }
} 