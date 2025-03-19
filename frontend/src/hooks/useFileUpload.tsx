import { useRef, useState } from "react";
import { uploadFilesAPI } from "../api/uploadService";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useImageContext } from "../context/ImageContext.tsx";

const useFileUpload = () => {
  const { setProcessedImages, processedImages } = useImageContext();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const navigate = useNavigate();

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files
      ? Array.from(event.target.files)
      : [];
    setFiles(selectedFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prevFiles) => [...prevFiles, ...droppedFiles]);
  };

  const deleteFile = (deletedFile: File) => {
    setFiles((prevFiles) => prevFiles.filter((file) => file !== deletedFile));
  };

  const mutation = useMutation({
    mutationFn: uploadFilesAPI,
    onSuccess: (data) => {
      setProcessedImages(data);
      setUploading(false);
      navigate("/drawing");
    },
    onError: (error) => {
      console.error("Upload failed:", error);
      setUploading(false);
    },
    onMutate: () => {
      setUploading(true);
    },
  });

  const uploadFiles = () => {
    if (files.length === 0) return alert("No files selected");
    mutation.mutate(files);
  };

  return {
    fileInputRef,
    uploadFiles,
    files,
    setFiles,
    uploading,
    isDragging,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    triggerFileInput,
    deleteFile,
    handleFileChange,
  };
};

export default useFileUpload;
