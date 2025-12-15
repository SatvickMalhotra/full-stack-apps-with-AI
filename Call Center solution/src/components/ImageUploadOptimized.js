import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Alert,
  LinearProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Snackbar,
  Switch,
  FormControlLabel,
} from "@mui/material";
import {
  CloudUpload,
  Delete,
  Image as ImageIcon,
  CheckCircle,
  Warning,
  WifiOff,
  Wifi,
  Compress,
  Refresh,
  CloudDone,
  CloudOff,
} from "@mui/icons-material";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebaseConfig";
import {
  compressImage,
  savePendingUpload,
  getPendingUploads,
  deletePendingUpload,
  updatePendingUpload,
  isOnline,
  addNetworkListener,
  retryWithBackoff,
  formatFileSize,
} from "../utils/offlineUtils";

/**
 * Image Upload Component - OPTIMIZED VERSION
 * Features:
 * - Image compression for weak networks
 * - Offline queue with background sync
 * - Progressive upload with progress
 * - Retry failed uploads
 * - Works without internet (queues for later)
 */
function ImageUploadOptimized({
  agentId,
  storagePath = "offline_visits",
  maxImages = 3,
  maxFileSize = 20 * 1024 * 1024, // 20MB
  onImagesChange,
  required = true,
  compressionEnabled = true,
}) {
  const [images, setImages] = useState([]); // { file, preview, name, size, status, url }
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [online, setOnline] = useState(isOnline());
  const [compressImages, setCompressImages] = useState(compressionEnabled);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  // Network status listener
  useEffect(() => {
    const cleanup = addNetworkListener(
      () => {
        setOnline(true);
        // Auto-sync pending uploads when back online
        syncPendingUploads();
      },
      () => {
        setOnline(false);
        setSnackbar({
          open: true,
          message: "You are offline. Images will be queued for upload.",
          severity: "warning",
        });
      }
    );
    return cleanup;
  }, []);

  // Load pending uploads count on mount
  useEffect(() => {
    const loadPendingCount = async () => {
      try {
        const pending = await getPendingUploads();
        setPendingCount(pending.length);
      } catch (error) {
        console.error("Error loading pending uploads:", error);
      }
    };
    loadPendingCount();
  }, []);

  // Notify parent of image changes
  useEffect(() => {
    if (onImagesChange) {
      const uploadedImages = images
        .filter((img) => img.status === "uploaded" && img.url)
        .map((img) => ({
          url: img.url,
          fileName: img.name,
          size: img.originalSize || img.size,
          uploadedAt: new Date().toISOString(),
        }));
      onImagesChange(uploadedImages);
    }
  }, [images, onImagesChange]);

  // Sync pending uploads when online
  const syncPendingUploads = async () => {
    if (!online || syncing) return;

    try {
      setSyncing(true);
      const pending = await getPendingUploads();

      if (pending.length === 0) {
        setPendingCount(0);
        return;
      }

      setSnackbar({
        open: true,
        message: `Syncing ${pending.length} pending uploads...`,
        severity: "info",
      });

      let successCount = 0;
      for (const item of pending) {
        try {
          // Convert base64 back to blob
          const response = await fetch(item.dataUrl);
          const blob = await response.blob();
          const file = new File([blob], item.fileName, { type: item.fileType });

          // Upload to Firebase
          const fileName = `${storagePath}/${agentId}/${Date.now()}_${item.fileName}`;
          const storageRef = ref(storage, fileName);
          const snapshot = await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(snapshot.ref);

          // Update pending item as completed
          await deletePendingUpload(item.id);
          successCount++;

          // If this image is in our current images array, update it
          setImages((prev) =>
            prev.map((img) =>
              img.pendingId === item.id
                ? { ...img, status: "uploaded", url: downloadURL }
                : img
            )
          );
        } catch (uploadError) {
          console.error(`Failed to sync upload ${item.fileName}:`, uploadError);
          await updatePendingUpload(item.id, {
            retryCount: (item.retryCount || 0) + 1,
            lastError: uploadError.message,
          });
        }
      }

      const remaining = await getPendingUploads();
      setPendingCount(remaining.length);

      if (successCount > 0) {
        setSnackbar({
          open: true,
          message: `Synced ${successCount} images successfully!`,
          severity: "success",
        });
      }
    } catch (error) {
      console.error("Error syncing pending uploads:", error);
    } finally {
      setSyncing(false);
    }
  };

  // Handle image selection
  const handleImageSelect = async (event) => {
    const files = Array.from(event.target.files);
    setError("");

    // Validate number of images
    if (images.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images`);
      return;
    }

    const newImages = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError(`"${file.name}" is not an image`);
        continue;
      }

      // Validate file size
      if (file.size > maxFileSize) {
        setError(`"${file.name}" is too large (max ${formatFileSize(maxFileSize)})`);
        continue;
      }

      try {
        let processedFile = file;
        let compressionApplied = false;

        // Compress image if enabled and file is large
        if (compressImages && file.size > 1024 * 1024) {
          // > 1MB
          try {
            processedFile = await compressImage(file, 1200, 0.7);
            compressionApplied = true;
            console.log(
              `Compressed ${file.name}: ${formatFileSize(file.size)} → ${formatFileSize(processedFile.size)}`
            );
          } catch (compressError) {
            console.warn("Compression failed, using original:", compressError);
            processedFile = file;
          }
        }

        // Create preview
        const preview = await createPreview(processedFile);

        newImages.push({
          id: Date.now() + Math.random(),
          file: processedFile,
          preview,
          name: file.name,
          size: processedFile.size,
          originalSize: file.size,
          compressed: compressionApplied,
          status: "pending", // pending, uploading, uploaded, queued, error
          url: null,
        });
      } catch (err) {
        console.error(`Error processing ${file.name}:`, err);
        setError(`Failed to process "${file.name}"`);
      }
    }

    setImages((prev) => [...prev, ...newImages]);

    // Auto-upload if online
    if (online && newImages.length > 0) {
      uploadImages(newImages);
    } else if (!online && newImages.length > 0) {
      // Queue for later
      queueForLater(newImages);
    }

    // Reset input
    event.target.value = "";
  };

  // Create preview from file
  const createPreview = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  };

  // Upload images to Firebase
  const uploadImages = async (imagesToUpload) => {
    setUploading(true);
    setUploadProgress(0);

    const total = imagesToUpload.length;
    let completed = 0;

    for (const img of imagesToUpload) {
      // Update status to uploading
      setImages((prev) =>
        prev.map((i) => (i.id === img.id ? { ...i, status: "uploading" } : i))
      );

      try {
        const fileName = `${storagePath}/${agentId}/${Date.now()}_${img.name}`;
        const storageRef = ref(storage, fileName);

        // Upload with retry
        const snapshot = await retryWithBackoff(
          () => uploadBytes(storageRef, img.file),
          3,
          1000
        );
        const downloadURL = await getDownloadURL(snapshot.ref);

        // Update status to uploaded
        setImages((prev) =>
          prev.map((i) =>
            i.id === img.id ? { ...i, status: "uploaded", url: downloadURL } : i
          )
        );

        completed++;
        setUploadProgress((completed / total) * 100);
      } catch (error) {
        console.error(`Failed to upload ${img.name}:`, error);

        // If upload fails, queue for later
        if (!online) {
          await queueForLater([img]);
        } else {
          setImages((prev) =>
            prev.map((i) =>
              i.id === img.id ? { ...i, status: "error", error: error.message } : i
            )
          );
        }
      }
    }

    setUploading(false);

    if (completed === total) {
      setSnackbar({
        open: true,
        message: `${completed} image${completed > 1 ? "s" : ""} uploaded successfully!`,
        severity: "success",
      });
    }
  };

  // Queue images for later upload
  const queueForLater = async (imagesToQueue) => {
    for (const img of imagesToQueue) {
      try {
        // Convert file to data URL for storage
        const dataUrl = await createPreview(img.file);

        const pendingId = await savePendingUpload({
          fileName: img.name,
          fileType: img.file.type,
          fileSize: img.size,
          dataUrl,
          agentId,
          storagePath,
        });

        // Update status to queued
        setImages((prev) =>
          prev.map((i) =>
            i.id === img.id ? { ...i, status: "queued", pendingId } : i
          )
        );

        setPendingCount((prev) => prev + 1);
      } catch (error) {
        console.error(`Failed to queue ${img.name}:`, error);
      }
    }

    setSnackbar({
      open: true,
      message: `${imagesToQueue.length} image${imagesToQueue.length > 1 ? "s" : ""} queued for upload when online`,
      severity: "info",
    });
  };

  // Remove image
  const handleRemoveImage = async (img) => {
    setImages((prev) => prev.filter((i) => i.id !== img.id));

    // If queued, also remove from pending
    if (img.status === "queued" && img.pendingId) {
      try {
        await deletePendingUpload(img.pendingId);
        setPendingCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Error removing from queue:", error);
      }
    }
  };

  // Retry failed upload
  const handleRetryUpload = async (img) => {
    if (online) {
      await uploadImages([img]);
    } else {
      await queueForLater([img]);
    }
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case "uploaded":
        return <CheckCircle sx={{ color: "#22c55e" }} />;
      case "uploading":
        return <CircularProgress size={20} />;
      case "queued":
        return <CloudOff sx={{ color: "#f59e0b" }} />;
      case "error":
        return <Warning sx={{ color: "#ef4444" }} />;
      default:
        return null;
    }
  };

  // Get status label
  const getStatusLabel = (img) => {
    switch (img.status) {
      case "uploaded":
        return "Uploaded";
      case "uploading":
        return "Uploading...";
      case "queued":
        return "Queued";
      case "error":
        return "Failed";
      default:
        return "Pending";
    }
  };

  const uploadedCount = images.filter((img) => img.status === "uploaded").length;
  const hasErrors = images.some((img) => img.status === "error");

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ImageIcon sx={{ color: "#3b82f6" }} />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Upload Images
          </Typography>
          {required && (
            <Chip label="Required" size="small" color="error" variant="outlined" />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            icon={online ? <Wifi /> : <WifiOff />}
            label={online ? "Online" : "Offline"}
            size="small"
            sx={{
              bgcolor: online ? "#dcfce7" : "#fef3c7",
              color: online ? "#166534" : "#92400e",
            }}
          />
          {pendingCount > 0 && (
            <Chip
              icon={<CloudOff />}
              label={`${pendingCount} queued`}
              size="small"
              color="warning"
              onClick={syncPendingUploads}
              sx={{ cursor: "pointer" }}
            />
          )}
        </Box>
      </Box>

      {/* Compression toggle */}
      {compressionEnabled && (
        <FormControlLabel
          control={
            <Switch
              checked={compressImages}
              onChange={(e) => setCompressImages(e.target.checked)}
              size="small"
            />
          }
          label={
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Compress fontSize="small" />
              <Typography variant="body2">
                Compress images (recommended for slow networks)
              </Typography>
            </Box>
          }
          sx={{ mb: 2 }}
        />
      )}

      {/* Error alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Offline mode alert */}
      {!online && images.length > 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          You're offline. Images will be uploaded when you're back online.
        </Alert>
      )}

      {/* Upload progress */}
      {uploading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            Uploading... {Math.round(uploadProgress)}%
          </Typography>
        </Box>
      )}

      {/* Upload button */}
      <Box sx={{ mb: 2 }}>
        <input
          accept="image/*"
          style={{ display: "none" }}
          id="image-upload-input"
          type="file"
          multiple
          onChange={handleImageSelect}
          disabled={uploading || images.length >= maxImages}
        />
        <label htmlFor="image-upload-input">
          <Button
            variant="outlined"
            component="span"
            startIcon={<CloudUpload />}
            disabled={uploading || images.length >= maxImages}
            fullWidth
            sx={{
              py: 2,
              borderStyle: "dashed",
              borderWidth: 2,
              "&:hover": { borderStyle: "dashed", borderWidth: 2 },
            }}
          >
            {images.length >= maxImages
              ? `Maximum ${maxImages} images`
              : `Upload Images (${images.length}/${maxImages})`}
          </Button>
        </label>
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
          Max {formatFileSize(maxFileSize)} per image. {compressImages && "Images will be compressed automatically."}
        </Typography>
      </Box>

      {/* Image previews */}
      {images.length > 0 && (
        <ImageList cols={3} rowHeight={120} gap={8}>
          {images.map((img) => (
            <ImageListItem key={img.id} sx={{ position: "relative" }}>
              <img
                src={img.preview}
                alt={img.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 8,
                  opacity: img.status === "uploading" ? 0.6 : 1,
                }}
              />

              {/* Status overlay */}
              <Box
                sx={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                {getStatusIcon(img.status)}
                {img.compressed && (
                  <Chip
                    icon={<Compress />}
                    label="Compressed"
                    size="small"
                    sx={{ bgcolor: "rgba(255,255,255,0.9)", height: 20, fontSize: "0.65rem" }}
                  />
                )}
              </Box>

              {/* Actions */}
              <ImageListItemBar
                sx={{
                  background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
                  borderRadius: "0 0 8px 8px",
                }}
                subtitle={
                  <Box>
                    <Typography variant="caption" sx={{ display: "block" }}>
                      {formatFileSize(img.size)}
                      {img.compressed && img.originalSize && (
                        <> (was {formatFileSize(img.originalSize)})</>
                      )}
                    </Typography>
                    <Typography variant="caption" sx={{ color: img.status === "error" ? "#ef4444" : "inherit" }}>
                      {getStatusLabel(img)}
                    </Typography>
                  </Box>
                }
                actionIcon={
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    {img.status === "error" && (
                      <IconButton
                        size="small"
                        onClick={() => handleRetryUpload(img)}
                        sx={{ color: "white" }}
                      >
                        <Refresh fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveImage(img)}
                      sx={{ color: "white" }}
                      disabled={img.status === "uploading"}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                }
              />

              {/* Uploading overlay */}
              {img.status === "uploading" && (
                <Box
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "rgba(0,0,0,0.3)",
                    borderRadius: 2,
                  }}
                >
                  <CircularProgress size={40} sx={{ color: "white" }} />
                </Box>
              )}
            </ImageListItem>
          ))}
        </ImageList>
      )}

      {/* Status summary */}
      {images.length > 0 && (
        <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
          {uploadedCount > 0 && (
            <Chip
              icon={<CloudDone />}
              label={`${uploadedCount} uploaded`}
              size="small"
              color="success"
            />
          )}
          {images.filter((img) => img.status === "queued").length > 0 && (
            <Chip
              icon={<CloudOff />}
              label={`${images.filter((img) => img.status === "queued").length} queued`}
              size="small"
              color="warning"
            />
          )}
          {hasErrors && (
            <Chip
              icon={<Warning />}
              label={`${images.filter((img) => img.status === "error").length} failed`}
              size="small"
              color="error"
            />
          )}
        </Box>
      )}

      {/* Sync button */}
      {pendingCount > 0 && online && (
        <Button
          variant="outlined"
          startIcon={syncing ? <CircularProgress size={16} /> : <Refresh />}
          onClick={syncPendingUploads}
          disabled={syncing}
          sx={{ mt: 2 }}
          fullWidth
        >
          {syncing ? "Syncing..." : `Sync ${pendingCount} Pending Uploads`}
        </Button>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={5000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default ImageUploadOptimized;
