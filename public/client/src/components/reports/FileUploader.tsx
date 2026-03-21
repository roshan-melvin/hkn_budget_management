import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image, File } from 'lucide-react';
import Button from '../common/Button';
import toast from 'react-hot-toast';

interface UploadedFile {
    id?: number;
    file?: File;
    name: string;
    size: number;
    type: string;
    preview?: string;
    uploaded?: boolean;
}

interface FileUploaderProps {
    fileType: 'pdf_report' | 'photo' | 'survey_doc' | 'receipt' | 'other';
    label: string;
    accept?: string;
    maxSize?: number;
    multiple?: boolean;
    files: UploadedFile[];
    onFilesChange: (files: UploadedFile[]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({
    fileType,
    label,
    accept = 'image/*,.pdf,.doc,.docx',
    maxSize = 10 * 1024 * 1024, // 10MB
    multiple = true,
    files,
    onFilesChange
}) => {
    const [uploading, setUploading] = useState(false);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
            uploaded: false
        }));

        onFilesChange([...files, ...newFiles]);
    }, [files, onFilesChange]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: accept.split(',').reduce((acc, curr) => ({ ...acc, [curr.trim()]: [] }), {}),
        maxSize,
        multiple
    });

    const removeFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        onFilesChange(newFiles);
    };

    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
        if (type.includes('pdf')) return <FileText className="w-5 h-5" />;
        return <File className="w-5 h-5" />;
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="space-y-4">
            <label className="block text-sm font-medium text-text-primary">
                {label}
            </label>

            {/* Dropzone */}
            <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
                        ? 'border-primary-blue bg-primary-blue/5'
                        : 'border-border hover:border-primary-blue/50'
                    }`}
            >
                <input {...getInputProps()} />
                <Upload className="w-12 h-12 mx-auto mb-4 text-text-muted" />
                {isDragActive ? (
                    <p className="text-text-primary">Drop the files here...</p>
                ) : (
                    <>
                        <p className="text-text-primary mb-2">
                            Drag & drop files here, or click to select
                        </p>
                        <p className="text-sm text-text-muted">
                            {accept.replace(/,/g, ', ')} (max {formatFileSize(maxSize)})
                        </p>
                    </>
                )}
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg border border-border"
                        >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                {file.preview ? (
                                    <img
                                        src={file.preview}
                                        alt={file.name}
                                        className="w-10 h-10 object-cover rounded"
                                    />
                                ) : (
                                    <div className="text-text-secondary">
                                        {getFileIcon(file.type)}
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-text-primary truncate">
                                        {file.name}
                                    </p>
                                    <p className="text-xs text-text-muted">
                                        {formatFileSize(file.size)}
                                        {file.uploaded && (
                                            <span className="ml-2 text-green-600">✓ Uploaded</span>
                                        )}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => removeFile(index)}
                                className="p-2 text-text-secondary hover:text-red-600 transition-colors"
                                title="Remove"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default FileUploader;
