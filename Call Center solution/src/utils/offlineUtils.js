/**
 * Offline Utilities for M-Swasth
 * Handles offline storage, retry logic, image compression, and sync operations
 */

// IndexedDB database name and version
const DB_NAME = 'mswasth_offline_db';
const DB_VERSION = 1;

// Store names
const STORES = {
  PENDING_UPLOADS: 'pending_uploads',
  ACTIVE_TRIPS: 'active_trips',
  ACTIVE_PUNCHES: 'active_punches',
  PENDING_VISITS: 'pending_visits',
};

/**
 * Initialize IndexedDB
 */
export const initOfflineDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Pending uploads store (images waiting to be uploaded)
      if (!db.objectStoreNames.contains(STORES.PENDING_UPLOADS)) {
        const uploadStore = db.createObjectStore(STORES.PENDING_UPLOADS, { keyPath: 'id', autoIncrement: true });
        uploadStore.createIndex('status', 'status', { unique: false });
        uploadStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // Active trips store (trip data for persistence)
      if (!db.objectStoreNames.contains(STORES.ACTIVE_TRIPS)) {
        const tripStore = db.createObjectStore(STORES.ACTIVE_TRIPS, { keyPath: 'agentId' });
        tripStore.createIndex('status', 'status', { unique: false });
      }

      // Active punches store (punch data for persistence)
      if (!db.objectStoreNames.contains(STORES.ACTIVE_PUNCHES)) {
        const punchStore = db.createObjectStore(STORES.ACTIVE_PUNCHES, { keyPath: 'agentId' });
        punchStore.createIndex('status', 'status', { unique: false });
      }

      // Pending visits store (visits waiting to be synced)
      if (!db.objectStoreNames.contains(STORES.PENDING_VISITS)) {
        const visitStore = db.createObjectStore(STORES.PENDING_VISITS, { keyPath: 'id', autoIncrement: true });
        visitStore.createIndex('status', 'status', { unique: false });
        visitStore.createIndex('agentId', 'agentId', { unique: false });
      }
    };
  });
};

/**
 * Get IndexedDB instance
 */
const getDB = async () => {
  return initOfflineDB();
};

/**
 * Check if online
 */
export const isOnline = () => navigator.onLine;

/**
 * Add listener for online/offline status changes
 */
export const addNetworkListener = (onOnline, onOffline) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);

  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

/**
 * Compress image using canvas
 * @param {File} file - Original image file
 * @param {number} maxWidth - Maximum width (default 1200)
 * @param {number} quality - JPEG quality 0-1 (default 0.7)
 * @returns {Promise<Blob>} - Compressed image blob
 */
export const compressImage = (file, maxWidth = 1200, quality = 0.7) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;

      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              // Create a new File object with the compressed data
              const compressedFile = new File([blob], file.name, {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
  });
};

/**
 * Save pending upload to IndexedDB
 */
export const savePendingUpload = async (uploadData) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_UPLOADS], 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_UPLOADS);

    const data = {
      ...uploadData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      retryCount: 0,
    };

    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get all pending uploads
 */
export const getPendingUploads = async () => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_UPLOADS], 'readonly');
    const store = transaction.objectStore(STORES.PENDING_UPLOADS);
    const index = store.index('status');
    const request = index.getAll('pending');

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Update pending upload status
 */
export const updatePendingUpload = async (id, updates) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_UPLOADS], 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_UPLOADS);

    const getRequest = store.get(id);
    getRequest.onsuccess = () => {
      const data = { ...getRequest.result, ...updates };
      const putRequest = store.put(data);
      putRequest.onsuccess = () => resolve(data);
      putRequest.onerror = () => reject(putRequest.error);
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
};

/**
 * Delete pending upload
 */
export const deletePendingUpload = async (id) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_UPLOADS], 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_UPLOADS);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Save active trip to localStorage (for quick access) and IndexedDB (for persistence)
 */
export const saveActiveTrip = async (tripData) => {
  // Save to localStorage for quick access
  localStorage.setItem(`active_trip_${tripData.agentId}`, JSON.stringify(tripData));

  // Also save to IndexedDB for backup
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ACTIVE_TRIPS], 'readwrite');
    const store = transaction.objectStore(STORES.ACTIVE_TRIPS);
    const request = store.put(tripData);

    request.onsuccess = () => resolve(tripData);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get active trip from localStorage or IndexedDB
 */
export const getActiveTrip = async (agentId) => {
  // Try localStorage first (faster)
  const localData = localStorage.getItem(`active_trip_${agentId}`);
  if (localData) {
    return JSON.parse(localData);
  }

  // Fallback to IndexedDB
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ACTIVE_TRIPS], 'readonly');
    const store = transaction.objectStore(STORES.ACTIVE_TRIPS);
    const request = store.get(agentId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Clear active trip
 */
export const clearActiveTrip = async (agentId) => {
  localStorage.removeItem(`active_trip_${agentId}`);

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ACTIVE_TRIPS], 'readwrite');
    const store = transaction.objectStore(STORES.ACTIVE_TRIPS);
    const request = store.delete(agentId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Save active punch to localStorage
 */
export const saveActivePunch = async (punchData) => {
  localStorage.setItem(`active_punch_${punchData.agentId}`, JSON.stringify(punchData));

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ACTIVE_PUNCHES], 'readwrite');
    const store = transaction.objectStore(STORES.ACTIVE_PUNCHES);
    const request = store.put(punchData);

    request.onsuccess = () => resolve(punchData);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get active punch from localStorage or IndexedDB
 */
export const getActivePunch = async (agentId) => {
  const localData = localStorage.getItem(`active_punch_${agentId}`);
  if (localData) {
    return JSON.parse(localData);
  }

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ACTIVE_PUNCHES], 'readonly');
    const store = transaction.objectStore(STORES.ACTIVE_PUNCHES);
    const request = store.get(agentId);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Clear active punch
 */
export const clearActivePunch = async (agentId) => {
  localStorage.removeItem(`active_punch_${agentId}`);

  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.ACTIVE_PUNCHES], 'readwrite');
    const store = transaction.objectStore(STORES.ACTIVE_PUNCHES);
    const request = store.delete(agentId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

/**
 * Save pending visit record
 */
export const savePendingVisit = async (visitData) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_VISITS], 'readwrite');
    const store = transaction.objectStore(STORES.PENDING_VISITS);

    const data = {
      ...visitData,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const request = store.add(data);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Get pending visits for an agent
 */
export const getPendingVisits = async (agentId) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORES.PENDING_VISITS], 'readonly');
    const store = transaction.objectStore(STORES.PENDING_VISITS);
    const index = store.index('agentId');
    const request = index.getAll(agentId);

    request.onsuccess = () => {
      const pending = request.result.filter(v => v.status === 'pending');
      resolve(pending);
    };
    request.onerror = () => reject(request.error);
  });
};

/**
 * Retry with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {number} maxRetries - Maximum number of retries (default 3)
 * @param {number} baseDelay - Base delay in ms (default 1000)
 * @returns {Promise} - Result of the function
 */
export const retryWithBackoff = async (fn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      console.warn(`Attempt ${attempt + 1} failed:`, error.message);

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

/**
 * Get location with timeout and retry
 */
export const getLocationWithRetry = async (options = {}) => {
  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 15000, // Increased timeout
    maximumAge: 0,
  };

  const mergedOptions = { ...defaultOptions, ...options };

  const getPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          });
        },
        (error) => {
          let errorMessage = 'Unable to get your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location permission denied. Please enable location access.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable. Please check your GPS settings.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
            default:
              errorMessage = 'An unknown error occurred.';
          }
          reject(new Error(errorMessage));
        },
        mergedOptions
      );
    });
  };

  // Try with high accuracy first, then fallback to low accuracy
  try {
    return await retryWithBackoff(getPosition, 2, 500);
  } catch (error) {
    console.log('High accuracy failed, trying with low accuracy...');
    const lowAccuracyOptions = { ...mergedOptions, enableHighAccuracy: false, timeout: 10000 };

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
          });
        },
        reject,
        lowAccuracyOptions
      );
    });
  }
};

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if it's a new day (for midnight reset)
 */
export const isNewDay = (savedDate) => {
  if (!savedDate) return true;
  const saved = new Date(savedDate);
  const now = new Date();
  return saved.toDateString() !== now.toDateString();
};

/**
 * Get today's date string (YYYY-MM-DD)
 */
export const getTodayString = () => {
  return new Date().toISOString().split('T')[0];
};

export default {
  initOfflineDB,
  isOnline,
  addNetworkListener,
  compressImage,
  savePendingUpload,
  getPendingUploads,
  updatePendingUpload,
  deletePendingUpload,
  saveActiveTrip,
  getActiveTrip,
  clearActiveTrip,
  saveActivePunch,
  getActivePunch,
  clearActivePunch,
  savePendingVisit,
  getPendingVisits,
  retryWithBackoff,
  getLocationWithRetry,
  formatFileSize,
  isNewDay,
  getTodayString,
};
