"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  IconUpload,
  IconX,
  IconCheck,
  IconAlertCircle,
  IconLoader2,
  IconCamera,
  IconVideo,
  IconEye,
} from "@tabler/icons-react";
import Link from "next/link";

interface PreviewData {
  imageUrl: string;
  videoUrl: string;
  userDetails: {
    name: string;
    description: string;
  };
}

export default function UploadPage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [capturedImage, setCapturedImage] = useState<string>("");
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<
    "idle" | "uploading" | "generating" | "confirming" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [userDetails, setUserDetails] = useState({
    name: "",
    description: "",
  });
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
    setCapturedImage(""); // Clear captured image
    setErrorMessage("");

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setErrorMessage("Camera access denied. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        const imageDataUrl = canvas.toDataURL("image/jpeg");
        setCapturedImage(imageDataUrl);
        setPreviewUrl(imageDataUrl);
        setSelectedFile(null); // Clear uploaded file
        setShowCamera(false); // Hide camera interface

        stopCamera();
      }
    }
  };

  const generateVideo = async (): Promise<string> => {
    // Simulate video generation API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // For demo, we'll create a simple animation effect
        // In real implementation, send image to video generation API
        // For now, we'll use a placeholder that represents the video
        resolve("video-placeholder"); // This will trigger our custom video simulation
      }, 3000);
    });
  };

  const handleGenerateVideo = async () => {
    if (!previewUrl) {
      setErrorMessage("Please select or capture an image first");
      return;
    }

    setIsGeneratingVideo(true);
    setUploadStatus("generating");
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Generate video
      const videoUrl = await generateVideo();

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Create preview data
      const preview: PreviewData = {
        imageUrl: previewUrl,
        videoUrl,
        userDetails,
      };

      setPreviewData(preview);
      setUploadStatus("confirming");
      setShowPreview(true);
    } catch {
      setUploadStatus("error");
      setErrorMessage("Video generation failed. Please try again.");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleConfirmUpload = async () => {
    if (!previewData) return;

    setIsUploading(true);
    setUploadStatus("uploading");
    setUploadProgress(0);

    try {
      // Create form data for upload
      const formData = new FormData();

      // Convert data URL back to file for upload
      const response = await fetch(previewData.imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "uploaded-image.jpg", {
        type: "image/jpeg",
      });

      formData.append("file", file);
      formData.append("name", previewData.userDetails.name);
      formData.append("description", previewData.userDetails.description);
      formData.append("videoUrl", previewData.videoUrl);

      // Add upload source information
      const uploadSource = capturedImage ? "camera" : "file";
      formData.append("uploadSource", uploadSource);

      // Upload to MongoDB API
      const uploadResponse = await fetch("/api/upload-mongodb", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const uploadResult = await uploadResponse.json();

      if (uploadResult.success) {
        setUploadStatus("success");
        setUploadProgress(100);

        // Close preview modal
        setShowPreview(false);
        setPreviewData(null);

        // Reset form
        setSelectedFile(null);
        setCapturedImage("");
        setPreviewUrl("");
        setUserDetails({ name: "", description: "" });

        // Show success message
        setTimeout(() => {
          setUploadStatus("idle");
        }, 3000);
      } else {
        throw new Error(uploadResult.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setUploadStatus("error");
      setErrorMessage("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setShowPreview(false);
    setPreviewData(null);
    setUploadStatus("idle");
    setUploadProgress(0);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setCapturedImage("");
    setPreviewUrl("");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Share Your Art
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload or capture a photo to be part of our community mural. Your
            image will be transformed into a video and placed in our digital art
            wall.
          </p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleGenerateVideo();
            }}
            className="space-y-6"
          >
            {/* Image Input Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Add Your Photo
              </label>

              {/* Upload or Capture Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Upload Option */}
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                    isDragOver
                      ? "border-blue-400 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <IconUpload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="font-medium text-gray-900">Upload Photo</p>
                  <p className="text-sm text-gray-500">
                    Drag & drop or click to browse
                  </p>
                </div>

                {/* Capture Option */}
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => setShowCamera(true)}
                >
                  <IconCamera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="font-medium text-gray-900">Take Photo</p>
                  <p className="text-sm text-gray-500">Use your camera</p>
                </div>
              </div>

              {/* Camera Interface */}
              {showCamera && (
                <div className="space-y-4">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full max-w-md mx-auto rounded-lg"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                  <div className="flex justify-center space-x-4">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Start Camera
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Capture
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCamera(false);
                        stopCamera();
                      }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Image Preview */}
              {previewUrl && (
                <div className="space-y-4">
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="max-h-64 rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <IconX className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">
                    {selectedFile
                      ? `${selectedFile.name} (${(
                          selectedFile.size /
                          1024 /
                          1024
                        ).toFixed(2)} MB)`
                      : "Captured photo"}
                  </p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {errorMessage && (
                <div className="flex items-center space-x-2 text-red-600">
                  <IconAlertCircle className="h-4 w-4" />
                  <span className="text-sm">{errorMessage}</span>
                </div>
              )}
            </div>

            {/* User Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={userDetails.name}
                  onChange={(e) =>
                    setUserDetails((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={userDetails.description}
                  onChange={(e) =>
                    setUserDetails((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us about your art"
                />
              </div>
            </div>

            {/* Progress Bar */}
            {uploadStatus !== "idle" && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>
                    {uploadStatus === "uploading" && "Uploading to mural..."}
                    {uploadStatus === "generating" && "Generating video..."}
                    {uploadStatus === "confirming" && "Ready to upload"}
                    {uploadStatus === "success" && "Upload successful!"}
                    {uploadStatus === "error" && "Upload failed"}
                  </span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Link
                href="/mural"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View Mural Wall →
              </Link>

              <button
                type="submit"
                disabled={!previewUrl || isGeneratingVideo || isUploading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  !previewUrl || isGeneratingVideo || isUploading
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isGeneratingVideo ? (
                  <div className="flex items-center space-x-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" />
                    <span>Generating Video...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <IconVideo className="h-4 w-4" />
                    <span>Generate Video & Preview</span>
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Preview Modal */}
        {showPreview && previewData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Confirm Upload
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Image Preview */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">Your Photo</h4>
                  <img
                    src={previewData.imageUrl}
                    alt="Preview"
                    className="w-full rounded-lg shadow-md"
                  />
                </div>

                {/* Video Preview - Simulated Animation */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Generated Video (Simulated)
                  </h4>
                  <div className="relative w-full h-48 bg-gray-100 rounded-lg shadow-md overflow-hidden">
                    <img
                      src={previewData.imageUrl}
                      alt="Video Preview"
                      className="w-full h-full object-cover animate-pulse"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                      <div className="p-4 text-white">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-sm">Video Animation</span>
                        </div>
                        <p className="text-xs opacity-75 mt-1">
                          Simulated video generation effect
                        </p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                      DEMO
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    In production, this would show the actual generated video
                  </p>
                </div>
              </div>

              {/* User Details */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Details</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p>
                    <strong>Name:</strong>{" "}
                    {previewData.userDetails.name || "Anonymous"}
                  </p>
                  <p>
                    <strong>Description:</strong>{" "}
                    {previewData.userDetails.description || "No description"}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  onClick={handleCancelUpload}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpload}
                  disabled={isUploading}
                  className={`px-6 py-2 rounded-lg font-medium ${
                    isUploading
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-green-600 text-white hover:bg-green-700"
                  }`}
                >
                  {isUploading ? (
                    <div className="flex items-center space-x-2">
                      <IconLoader2 className="h-4 w-4 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <IconEye className="h-4 w-4" />
                      <span>Upload to Mural</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {uploadStatus === "success" && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <IconCheck className="h-5 w-5 text-green-600" />
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  Upload Successful!
                </h3>
                <p className="text-sm text-green-700">
                  Your image has been uploaded and is being processed. Check the
                  mural wall to see your art!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
