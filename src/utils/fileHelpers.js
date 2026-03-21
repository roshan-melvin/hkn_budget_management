const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

/**
 * Delete a file from the filesystem
 */
const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

/**
 * Create a ZIP archive of multiple files
 */
const createZipArchive = (files, outputPath) => {
    return new Promise((resolve, reject) => {
        const output = fs.createWriteStream(outputPath);
        const archive = archiver('zip', {
            zlib: { level: 9 } // Maximum compression
        });

        output.on('close', () => {
            resolve(archive.pointer());
        });

        archive.on('error', (err) => {
            reject(err);
        });

        archive.pipe(output);

        // Add files to archive
        files.forEach(file => {
            if (fs.existsSync(file.path)) {
                archive.file(file.path, { name: file.name });
            }
        });

        archive.finalize();
    });
};

/**
 * Get file size in bytes
 */
const getFileSize = (filePath) => {
    try {
        const stats = fs.statSync(filePath);
        return stats.size;
    } catch (err) {
        console.error('Error getting file size:', err);
        return 0;
    }
};

/**
 * Format file size for display
 */
const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Ensure directory exists
 */
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
};

module.exports = {
    deleteFile,
    createZipArchive,
    getFileSize,
    formatFileSize,
    ensureDirectoryExists
};
