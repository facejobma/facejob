"use client";
import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Trash, UploadCloud, Loader2 } from "lucide-react";
import Image from "next/image";
import { IMG_MAX_LIMIT } from "./forms/product-form";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

type UploadFileResponse = {
    url: string;
    key: string;
    name: string;
    size: number;
    fileUrl?: string;
};

interface ImageUploadProps {
    onChange: (newFiles: UploadFileResponse[]) => void;
    onRemove: (value: UploadFileResponse[]) => void;
    value: UploadFileResponse[];
}

export default function FileUpload({
    onChange,
    onRemove,
    value,
}: ImageUploadProps) {
    const { toast } = useToast();
    const [isUploading, setIsUploading] = useState(false);

    const onDeleteFile = (key: string) => {
        let filteredFiles = value.filter((item) => item.key !== key);
        onRemove(filteredFiles);
    };

    const onUpdateFile = (newFiles: UploadFileResponse[]) => {
        onChange([...value, ...newFiles]);
    };

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (!acceptedFiles || acceptedFiles.length === 0) return;
        
        setIsUploading(true);
        const newUploadedFiles: UploadFileResponse[] = [];

        for (const file of acceptedFiles) {
            try {
                // 1. Get presigned URL
                const response = await fetch('/local-api/s3/presign', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        filename: file.name,
                        contentType: file.type,
                    }),
                });

                if (!response.ok) {
                    const errorText = await response.text().catch(() => "No response body");
                    let errorData: any = {};
                    try {
                        errorData = JSON.parse(errorText);
                    } catch (e) {
                        // not json
                    }
                    const message = errorData?.error || `Failed to get upload URL (Status: ${response.status}). Body: ${errorText.substring(0, 100)}`;
                    throw new Error(message);
                }
                
                const { presignedUrl, fileUrl, key } = await response.json();

                // 2. Upload file directly to S3
                const uploadResponse = await fetch(presignedUrl, {
                    method: 'PUT',
                    headers: { 'Content-Type': file.type },
                    body: file,
                });

                if (!uploadResponse.ok) throw new Error("Failed to upload to S3");

                newUploadedFiles.push({
                    url: fileUrl,
                    fileUrl: fileUrl,
                    key: key,
                    name: file.name,
                    size: file.size,
                });
                
            } catch (error: any) {
                toast({
                    title: "Upload Error",
                    variant: "destructive",
                    description: error.message,
                });
            }
        }

        if (newUploadedFiles.length > 0) {
            onUpdateFile(newUploadedFiles);
        }
        setIsUploading(false);
    }, [value, onChange, toast]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div>
            <div className="mb-4 flex flex-wrap items-center gap-4">
                {!!value.length &&
                    value?.map((item) => (
                        <div
                            key={item.key}
                            className="relative w-[200px] h-[200px] rounded-md overflow-hidden border border-gray-200"
                        >
                            <div className="z-10 absolute top-2 right-2">
                                <Button
                                    type="button"
                                    onClick={() => onDeleteFile(item.key)}
                                    variant="destructive"
                                    size="sm"
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                            <div>
                              {item.fileUrl && <Image
                                fill
                                className="object-cover"
                                alt="Uploaded File"
                                src={item.fileUrl}
                              />}
                            </div>
                        </div>
                    ))}
            </div>
            <div>
                {value.length < IMG_MAX_LIMIT && (
                    <div 
                        {...getRootProps()} 
                        className={`border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer transition-colors
                            ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900'}
                            ${isUploading ? 'opacity-50 pointer-events-none' : ''}
                        `}
                    >
                        <input {...getInputProps()} />
                        {isUploading ? (
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-10 w-10 text-primary animate-spin" />
                                <p className="text-sm text-slate-500 font-medium animate-pulse">Uploading...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <UploadCloud className="h-10 w-10 text-gray-400" />
                                <p className="text-sm text-slate-600 dark:text-slate-400 text-center">
                                    <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
