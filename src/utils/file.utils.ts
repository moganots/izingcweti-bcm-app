import { Filesystem, Directory, Encoding } from '@capacitor/filesystem'

/**
 * File Utility Functions
 * Handles file operations, validation, and conversion
 */

/**
 * Supported file types with their MIME types and extensions
 */
const FILE_TYPE_MAP: Record<string, { mime: string; icon: string; color: string }> = {
  pdf: { mime: 'application/pdf', icon: 'picture_as_pdf', color: 'red' },
  doc: { mime: 'application/msword', icon: 'description', color: 'blue' },
  docx: {
    mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    icon: 'description',
    color: 'blue',
  },
  xls: { mime: 'application/vnd.ms-excel', icon: 'table_chart', color: 'green' },
  xlsx: {
    mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    icon: 'table_chart',
    color: 'green',
  },
  ppt: { mime: 'application/vnd.ms-powerpoint', icon: 'slideshow', color: 'orange' },
  pptx: {
    mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    icon: 'slideshow',
    color: 'orange',
  },
  jpg: { mime: 'image/jpeg', icon: 'image', color: 'purple' },
  jpeg: { mime: 'image/jpeg', icon: 'image', color: 'purple' },
  png: { mime: 'image/png', icon: 'image', color: 'purple' },
  gif: { mime: 'image/gif', icon: 'gif', color: 'purple' },
  txt: { mime: 'text/plain', icon: 'text_snippet', color: 'grey' },
  csv: { mime: 'text/csv', icon: 'table_chart', color: 'green' },
  zip: { mime: 'application/zip', icon: 'folder_zip', color: 'brown' },
  json: { mime: 'application/json', icon: 'code', color: 'teal' },
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

/**
 * Get file MIME type from extension
 */
export function getFileMimeType(filename: string): string {
  const ext = getFileExtension(filename)
  return FILE_TYPE_MAP[ext]?.mime || 'application/octet-stream'
}

/**
 * Get file icon based on filename
 */
export function getFileIcon(filename: string): string {
  const ext = getFileExtension(filename)
  return FILE_TYPE_MAP[ext]?.icon || 'insert_drive_file'
}

/**
 * Get file color based on filename
 */
export function getFileColor(filename: string): string {
  const ext = getFileExtension(filename)
  return FILE_TYPE_MAP[ext]?.color || 'grey'
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'

  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))

  if (i === 0) return `${bytes} ${sizes[i]}`
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Validate file size
 */
export function validateFileSize(
  file: File,
  maxSize: number = 50 * 1024 * 1024
): { valid: boolean; message?: string } {
  if (file.size > maxSize) {
    return {
      valid: false,
      message: `File size exceeds maximum allowed size of ${formatFileSize(maxSize)}`,
    }
  }
  return { valid: true }
}

/**
 * Validate file type
 */
export function validateFileType(
  file: File,
  allowedTypes?: string[]
): { valid: boolean; message?: string } {
  if (!allowedTypes || allowedTypes.length === 0) {
    return { valid: true }
  }

  const ext = getFileExtension(file.name)
  const isAllowed = allowedTypes.some((type) => {
    if (type.startsWith('.')) {
      return type.substring(1).toLowerCase() === ext
    }
    return type === file.type
  })

  if (!isAllowed) {
    return {
      valid: false,
      message: `File type "${ext.toUpperCase()}" is not allowed. Accepted: ${allowedTypes.join(
        ', '
      )}`,
    }
  }

  return { valid: true }
}

/**
 * Convert File to Base64 string
 */
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Convert Base64 to Blob
 */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64.split(',')[1] || base64)
  const byteNumbers = new Array(byteCharacters.length)

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }

  const byteArray = new Uint8Array(byteNumbers)
  return new Blob([byteArray], { type: mimeType })
}

/**
 * Download a file from URL
 */
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

/**
 * Download a Blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  downloadFile(url, filename)
  URL.revokeObjectURL(url)
}

/**
 * Save file to device filesystem using Capacitor
 */
export async function saveToDevice(
  data: string,
  filename: string,
  directory: Directory = Directory.Documents
): Promise<string> {
  try {
    const result = await Filesystem.writeFile({
      path: filename,
      data,
      directory,
      encoding: Encoding.UTF8,
    })
    return result.uri
  } catch (error) {
    console.error('Failed to save file:', error)
    throw new Error('Failed to save file to device')
  }
}

/**
 * Read file from device filesystem
 */
export async function readFromDevice(
  filename: string,
  directory: Directory = Directory.Documents
): Promise<string> {
  try {
    const result = await Filesystem.readFile({
      path: filename,
      directory,
      encoding: Encoding.UTF8,
    })
    return result.data as string
  } catch (error) {
    console.error('Failed to read file:', error)
    throw new Error('Failed to read file from device')
  }
}

/**
 * Delete file from device filesystem
 */
export async function deleteFromDevice(
  filename: string,
  directory: Directory = Directory.Documents
): Promise<void> {
  try {
    await Filesystem.deleteFile({
      path: filename,
      directory,
    })
  } catch (error) {
    console.error('Failed to delete file:', error)
    throw new Error('Failed to delete file from device')
  }
}

/**
 * Generate a unique filename
 */
export function generateUniqueFilename(originalName: string): string {
  const ext = getFileExtension(originalName)
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const baseName = originalName
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50)

  return `${baseName}_${timestamp}_${random}.${ext}`
}

/**
 * Get human-readable file type description
 */
export function getFileTypeDescription(filename: string): string {
  const ext = getFileExtension(filename)
  const descriptions: Record<string, string> = {
    pdf: 'PDF Document',
    doc: 'Word Document',
    docx: 'Word Document',
    xls: 'Excel Spreadsheet',
    xlsx: 'Excel Spreadsheet',
    ppt: 'PowerPoint Presentation',
    pptx: 'PowerPoint Presentation',
    jpg: 'JPEG Image',
    jpeg: 'JPEG Image',
    png: 'PNG Image',
    gif: 'GIF Image',
    txt: 'Text File',
    csv: 'CSV File',
    zip: 'ZIP Archive',
    json: 'JSON File',
  }

  return descriptions[ext] || `${ext.toUpperCase()} File`
}
