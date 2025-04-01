import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
// Import SheetJS for Excel handling
import * as XLSX from "https://cdn.jsdelivr.net/npm/xlsx@0.18.5/+esm";

// Firebase configuration for your project
const firebaseConfig = {
  apiKey: "",
  authDomain: "-..com",
  projectId: "-",
  storageBucket: "-..com",
  messagingSenderId: "",
  appId: "1::web:",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ----- Vendor Data Upload Section -----
const vendorForm = document.getElementById("vendor-form");
const addMedicineBtn = document.getElementById("add-medicine");
const excelFileInput = document.getElementById("excel-file-input");
const importExcelBtn = document.getElementById("import-excel-btn");

// Function to format dates from yyyy-mm-dd to dd/mm/yyyy for display
function formatDate(dateString) {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

// Function to calculate total price based on quantity and price
function calculateTotal(entry) {
  const quantity = Number(entry.querySelector(".quantity").value) || 0;
  const price = Number(entry.querySelector(".price").value) || 0;
  const totalField = entry.querySelector(".total-price");

  if (totalField) {
    totalField.value = (quantity * price).toFixed(2);
  }
}

// Set up event listeners for quantity and price changes
function setupPriceCalculation() {
  document.querySelectorAll(".medicine-entry").forEach((entry) => {
    const quantityInput = entry.querySelector(".quantity");
    const priceInput = entry.querySelector(".price");

    if (quantityInput && priceInput) {
      quantityInput.addEventListener("input", () => calculateTotal(entry));
      priceInput.addEventListener("input", () => calculateTotal(entry));
    }
  });
}

// Initial setup
setupPriceCalculation();

// Setup remove entry button functionality
function setupRemoveButtons() {
  const removeButtons = document.querySelectorAll(".remove-entry");
  removeButtons.forEach((button) => {
    button.addEventListener("click", function () {
      const entry = this.closest(".medicine-entry");
      entry.classList.add("fade-out");

      // Remove after animation completes
      setTimeout(() => {
        entry.remove();

        // If there's only one entry left, hide its remove button
        const remainingEntries = document.querySelectorAll(".medicine-entry");
        if (remainingEntries.length === 1) {
          remainingEntries[0]
            .querySelector(".remove-entry")
            .classList.add("d-none");
        }
      }, 300);
    });
  });
}

// Form submission
vendorForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Show loading state
  const submitBtn = vendorForm.querySelector("button[type='submit']");
  const originalBtnText = submitBtn.innerHTML;
  submitBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Uploading...';
  submitBtn.disabled = true;

  const clinicName = document.getElementById("clinic_name").value;
  const medicineEntries = document.querySelectorAll(".medicine-entry");
  const medicines = [];

  medicineEntries.forEach((entry) => {
    const medicine_name = entry.querySelector(".medicine_name").value.trim();
    const quantity = Number(entry.querySelector(".quantity").value);
    const price = parseFloat(entry.querySelector(".price").value);
    const batch_name = entry.querySelector(".batch_name").value.trim();
    const manufacturing_date = entry.querySelector(".manufacturing_date").value; // yyyy-mm-dd
    const expiry_date = entry.querySelector(".expiry_date").value; // yyyy-mm-dd

    medicines.push({
      medicine_name,
      quantity,
      price,
      batch_name,
      manufacturing_date,
      expiry_date,
    });
  });

  const vendorData = {
    clinic_name: clinicName.trim(),
    medicines: medicines,
    created_at: new Date().toISOString(),
  };

  try {
    const docRef = await addDoc(collection(db, "vendor_inventory"), vendorData);

    // Success notification
    const successAlert = document.createElement("div");
    successAlert.className =
      "alert alert-success alert-dismissible fade show mt-3";
    successAlert.innerHTML = `
      <strong>Success!</strong> Data uploaded successfully.
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    vendorForm.prepend(successAlert);

    // Reset the form
    vendorForm.reset();
    const medicineContainer = document.getElementById("medicine-container");
    // Revert to a single blank medicine entry
    medicineContainer.innerHTML = `
      <h5 class="fw-bold">Medicine Details</h5>
      <div class="medicine-entry border rounded p-3 mb-3">
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Medicine Name:</label>
            <input type="text" class="form-control medicine_name" placeholder="Medicine name" required />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Batch Name:</label>
            <input type="text" class="form-control batch_name" placeholder="Batch name" required />
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-4 mb-3">
            <label class="form-label">Quantity:</label>
            <input type="number" class="form-control quantity" placeholder="0" required />
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label">Price:</label>
            <div class="input-group">
              <span class="input-group-text">₹</span>
              <input type="number" step="0.01" class="form-control price" placeholder="0.00" required />
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <label class="form-label">Total:</label>
            <div class="input-group">
              <span class="input-group-text">₹</span>
              <input type="text" class="form-control total-price" readonly placeholder="0.00" />
            </div>
          </div>
        </div>
        
        <div class="row">
          <div class="col-md-6 mb-3">
            <label class="form-label">Manufacturing Date:</label>
            <input type="date" class="form-control manufacturing_date" required />
          </div>
          <div class="col-md-6 mb-3">
            <label class="form-label">Expiry Date:</label>
            <input type="date" class="form-control expiry_date" required />
          </div>
        </div>
        
        <!-- Remove button (hidden for first entry) -->
        <button type="button" class="btn btn-sm btn-outline-danger remove-entry d-none">
          <i class="fas fa-trash me-1"></i>Remove
        </button>
      </div>
    `;

    // Auto-dismiss the alert after 5 seconds
    setTimeout(() => {
      const alertElement = document.querySelector(".alert");
      if (alertElement) {
        const bsAlert = new bootstrap.Alert(alertElement);
        bsAlert.close();
      }
    }, 5000);

    // Re-initialize the event listeners
    setupPriceCalculation();
  } catch (error) {
    console.error("Error uploading vendor data: ", error);

    // Error notification
    const errorAlert = document.createElement("div");
    errorAlert.className =
      "alert alert-danger alert-dismissible fade show mt-3";
    errorAlert.innerHTML = `
      <strong>Error!</strong> ${error.message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    vendorForm.prepend(errorAlert);
  } finally {
    // Restore button state
    submitBtn.innerHTML = originalBtnText;
    submitBtn.disabled = false;
  }
});

// Add More Medicine - Clone the first medicine entry
addMedicineBtn.addEventListener("click", () => {
  const medicineContainer = document.getElementById("medicine-container");
  const entries = medicineContainer.querySelectorAll(".medicine-entry");

  if (entries.length > 0) {
    // Clone the last entry
    const lastEntry = entries[entries.length - 1];
    const clone = lastEntry.cloneNode(true);

    // Clear the values in the clone
    clone.querySelectorAll("input").forEach((input) => (input.value = ""));

    // Show remove button on all entries
    entries.forEach((entry) => {
      const removeBtn = entry.querySelector(".remove-entry");
      if (removeBtn) {
        removeBtn.classList.remove("d-none");
      }
    });

    // Show remove button on the clone too
    const cloneRemoveBtn = clone.querySelector(".remove-entry");
    if (cloneRemoveBtn) {
      cloneRemoveBtn.classList.remove("d-none");
    }

    medicineContainer.appendChild(clone);

    // Setup the new entry's event listeners
    setupPriceCalculation();
    setupRemoveButtons();
  }
});

// ----- Clinic View Section -----
const clinicSearchView = document.getElementById("clinic-search-view");
const clinicViewButton = document.getElementById("clinic-view-button");
const vendorDataTableBody = document.querySelector("#vendor-data-table tbody");

clinicViewButton.addEventListener("click", async () => {
  const searchValue = clinicSearchView.value.trim();
  if (!searchValue) {
    // Empty search notification
    vendorDataTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-3 text-danger">
          <i class="fas fa-exclamation-circle me-2"></i>Please enter a clinic name to search.
        </td>
      </tr>`;
    return;
  }

  // Show loading state
  vendorDataTableBody.innerHTML = `
    <tr>
      <td colspan="7" class="text-center py-4">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="mt-2 mb-0">Searching for "${searchValue}"...</p>
      </td>
    </tr>`;

  try {
    const q = query(
      collection(db, "vendor_inventory"),
      where("clinic_name", "==", searchValue)
    );
    const querySnapshot = await getDocs(q);

    let foundData = false;

    // Clear existing rows
    vendorDataTableBody.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Defensive check if 'medicines' array is missing or not an array
      if (!data.medicines || !Array.isArray(data.medicines)) {
        return;
      }
      data.medicines.forEach((med) => {
        foundData = true;
        const row = document.createElement("tr");

        // Check for expired medicines
        let isExpired = false;
        if (med.expiry_date) {
          const today = new Date();
          const expiryDate = new Date(med.expiry_date);
          isExpired = expiryDate < today;
        }

        // Add warning class for expired medicines
        if (isExpired) {
          row.classList.add("table-danger");
        }

        // Format dates for display
        const formattedManufDate = formatDate(med.manufacturing_date);
        const formattedExpiryDate = formatDate(med.expiry_date);

        row.innerHTML = `
          <td>${data.clinic_name}</td>
          <td>${med.medicine_name || ""}</td>
          <td>${med.quantity || 0}</td>
          <td>${med.price ? med.price.toFixed(2) : "0.00"}</td>
          <td>${med.batch_name || ""}</td>
          <td>${formattedManufDate}</td>
          <td class="${
            isExpired ? "text-danger fw-bold" : ""
          }">${formattedExpiryDate}${
          isExpired ? ' <i class="fas fa-exclamation-triangle ms-1"></i>' : ""
        }</td>
        `;
        vendorDataTableBody.appendChild(row);
      });
    });

    if (!foundData) {
      vendorDataTableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-3">
            <i class="fas fa-info-circle me-2 text-info"></i>
            No records found for "${searchValue}".
          </td>
        </tr>`;
    }
  } catch (error) {
    console.error("Error fetching vendor data: ", error);
    vendorDataTableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-3 text-danger">
          <i class="fas fa-exclamation-triangle me-2"></i>
          Error fetching data: ${error.message}
        </td>
      </tr>`;
  }
});

// Initialize event listeners for remove buttons
setupRemoveButtons();

// Add keypress event listener for the search input
clinicSearchView.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    clinicViewButton.click();
  }
});

// Add fade-out CSS for removing medicine entries
const style = document.createElement("style");
style.textContent = `
  .fade-out {
    opacity: 0;
    transform: translateY(-10px);
    transition: opacity 0.3s, transform 0.3s;
  }
`;
document.head.appendChild(style);

// ----- Excel Import Functionality -----

// Function to create a new medicine entry with data
function createMedicineEntryWithData(medicineData) {
  const medicineContainer = document.getElementById("medicine-container");
  const entries = medicineContainer.querySelectorAll(".medicine-entry");

  // Clone the last entry
  const lastEntry = entries[entries.length - 1];
  const clone = lastEntry.cloneNode(true);

  // Clear all values first
  clone.querySelectorAll("input").forEach((input) => (input.value = ""));

  // Fill in the data
  const medicineNameInput = clone.querySelector(".medicine_name");
  const batchNameInput = clone.querySelector(".batch_name");
  const quantityInput = clone.querySelector(".quantity");
  const priceInput = clone.querySelector(".price");
  const manufacturingDateInput = clone.querySelector(".manufacturing_date");
  const expiryDateInput = clone.querySelector(".expiry_date");

  if (medicineNameInput && medicineData.medicine_name)
    medicineNameInput.value = medicineData.medicine_name;

  if (batchNameInput && medicineData.batch_name)
    batchNameInput.value = medicineData.batch_name;

  if (quantityInput && medicineData.quantity)
    quantityInput.value = medicineData.quantity;

  if (priceInput && medicineData.price) priceInput.value = medicineData.price;

  if (manufacturingDateInput && medicineData.manufacturing_date)
    manufacturingDateInput.value = medicineData.manufacturing_date;

  if (expiryDateInput && medicineData.expiry_date)
    expiryDateInput.value = medicineData.expiry_date;

  // Show remove button
  const removeBtn = clone.querySelector(".remove-entry");
  if (removeBtn) {
    removeBtn.classList.remove("d-none");
  }

  // Show remove buttons on all previous entries
  entries.forEach((entry) => {
    const removeBtn = entry.querySelector(".remove-entry");
    if (removeBtn) {
      removeBtn.classList.remove("d-none");
    }
  });

  // Add to container
  medicineContainer.appendChild(clone);

  // Calculate total
  calculateTotal(clone);

  // Setup event listeners
  setupPriceCalculation();
  setupRemoveButtons();

  return clone;
}

// Function to handle Excel file import
async function handleExcelImport(event) {
  const file = excelFileInput.files[0];

  if (!file) {
    alert("Please select an Excel file first.");
    return;
  }

  // Validate file extension
  const fileExtension = file.name.split(".").pop().toLowerCase();
  if (!["xlsx", "xls"].includes(fileExtension)) {
    alert("Please upload a valid Excel file (.xlsx or .xls)");
    excelFileInput.value = "";
    return;
  }

  // Show loading state
  importExcelBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
  importExcelBtn.disabled = true;

  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    // Ensure the workbook has at least one sheet
    if (workbook.SheetNames.length === 0) {
      throw new Error("The Excel file doesn't contain any sheets.");
    }

    // Assume first sheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

    // Validate data structure
    if (jsonData.length <= 1) {
      throw new Error(
        "Excel file appears to be empty or contains only headers."
      );
    }

    // Check header row
    const headers = jsonData[0];
    if (headers.length < 7) {
      throw new Error(
        "Excel file is missing required columns. Please make sure your file has columns for Clinic Name, Medicine Name, Quantity, Price, Batch Name, Manufacturing Date, and Expiry Date."
      );
    }

    const headerMap = {
      clinic: -1,
      medicine: -1,
      quantity: -1,
      price: -1,
      batch: -1,
      manufacturing: -1,
      expiry: -1,
    };

    // Map column indices
    headers.forEach((header, index) => {
      if (!header) return; // Skip empty headers

      const headerStr = String(header).toLowerCase();
      if (headerStr.includes("clinic")) headerMap.clinic = index;
      else if (headerStr.includes("medicine")) headerMap.medicine = index;
      else if (headerStr.includes("quantity")) headerMap.quantity = index;
      else if (headerStr.includes("price")) headerMap.price = index;
      else if (headerStr.includes("batch")) headerMap.batch = index;
      else if (headerStr.includes("manufacturing"))
        headerMap.manufacturing = index;
      else if (headerStr.includes("expiry")) headerMap.expiry = index;
    });

    // Validate required column headers were found
    const missingColumns = [];
    if (headerMap.clinic === -1) missingColumns.push("Clinic Name");
    if (headerMap.medicine === -1) missingColumns.push("Medicine Name");
    if (headerMap.quantity === -1) missingColumns.push("Quantity");
    if (headerMap.price === -1) missingColumns.push("Price");
    if (headerMap.batch === -1) missingColumns.push("Batch Name");
    if (headerMap.manufacturing === -1)
      missingColumns.push("Manufacturing Date");
    if (headerMap.expiry === -1) missingColumns.push("Expiry Date");

    if (missingColumns.length > 0) {
      throw new Error(
        `Excel file is missing the following required columns: ${missingColumns.join(
          ", "
        )}. Please ensure your file follows the correct format.`
      );
    }

    // Group data by clinic
    const clinicData = {};
    const invalidRows = [];

    // Start from row 1 (skip headers)
    for (let i = 1; i < jsonData.length; i++) {
      const row = jsonData[i];

      // Skip empty rows
      if (
        !row ||
        row.length === 0 ||
        row.every((cell) => cell === undefined || cell === null || cell === "")
      ) {
        continue;
      }

      const clinicName = row[headerMap.clinic];
      const medicineName = row[headerMap.medicine];
      const quantity = row[headerMap.quantity];
      const price = row[headerMap.price];

      // Validate required fields
      if (
        !clinicName ||
        !medicineName ||
        quantity === undefined ||
        price === undefined
      ) {
        invalidRows.push(i + 1); // +1 for Excel row number (1-indexed)
        continue;
      }

      const medicineData = {
        medicine_name: medicineName,
        quantity: Number(quantity) || 0,
        price: Number(price) || 0,
        batch_name: row[headerMap.batch] || "",
        manufacturing_date: row[headerMap.manufacturing],
        expiry_date: row[headerMap.expiry],
      };

      // Validate and format dates
      if (medicineData.manufacturing_date) {
        if (typeof medicineData.manufacturing_date === "number") {
          // Excel date serial number
          const date = XLSX.SSF.parse_date_code(
            medicineData.manufacturing_date
          );
          medicineData.manufacturing_date = `${date.y
            .toString()
            .padStart(4, "0")}-${date.m.toString().padStart(2, "0")}-${date.d
            .toString()
            .padStart(2, "0")}`;
        } else if (typeof medicineData.manufacturing_date === "string") {
          if (medicineData.manufacturing_date.includes("/")) {
            // Convert DD/MM/YYYY to YYYY-MM-DD
            const parts = medicineData.manufacturing_date.split("/");
            if (parts.length === 3) {
              medicineData.manufacturing_date = `${parts[2].padStart(
                4,
                "0"
              )}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
            }
          } else if (!isValidDate(medicineData.manufacturing_date)) {
            // Invalid date format
            invalidRows.push(i + 1);
            continue;
          }
        }
      }

      if (medicineData.expiry_date) {
        if (typeof medicineData.expiry_date === "number") {
          // Excel date serial number
          const date = XLSX.SSF.parse_date_code(medicineData.expiry_date);
          medicineData.expiry_date = `${date.y
            .toString()
            .padStart(4, "0")}-${date.m.toString().padStart(2, "0")}-${date.d
            .toString()
            .padStart(2, "0")}`;
        } else if (typeof medicineData.expiry_date === "string") {
          if (medicineData.expiry_date.includes("/")) {
            // Convert DD/MM/YYYY to YYYY-MM-DD
            const parts = medicineData.expiry_date.split("/");
            if (parts.length === 3) {
              medicineData.expiry_date = `${parts[2].padStart(
                4,
                "0"
              )}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
            }
          } else if (!isValidDate(medicineData.expiry_date)) {
            // Invalid date format
            invalidRows.push(i + 1);
            continue;
          }
        }
      }

      // Add to clinic data
      if (!clinicData[clinicName]) {
        clinicData[clinicName] = [];
      }

      clinicData[clinicName].push(medicineData);
    }

    const clinicNames = Object.keys(clinicData);

    if (clinicNames.length === 0) {
      throw new Error(
        "No valid clinic data found in the Excel file. Please check your file format."
      );
    }

    // Show warning for invalid rows
    if (invalidRows.length > 0) {
      console.warn("Invalid rows detected:", invalidRows);
      const warningAlert = document.createElement("div");
      warningAlert.className =
        "alert alert-warning alert-dismissible fade show mt-3";
      warningAlert.innerHTML = `
        <strong>Warning!</strong> ${
          invalidRows.length
        } row(s) with invalid or missing data were skipped.
        <br>Problem rows: ${invalidRows.join(", ")}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      `;
      vendorForm.prepend(warningAlert);

      // Auto-dismiss the warning after 8 seconds
      setTimeout(() => {
        if (warningAlert.parentNode) {
          const bsAlert = new bootstrap.Alert(warningAlert);
          bsAlert.close();
        }
      }, 8000);
    }

    if (clinicNames.length === 1) {
      // If only one clinic, load it directly
      loadClinicData(clinicNames[0], clinicData[clinicNames[0]]);
    } else {
      // Multiple clinics - show selection modal
      showClinicSelectionModal(clinicData);
    }
  } catch (error) {
    console.error("Error importing Excel file:", error);

    // Error notification
    const errorAlert = document.createElement("div");
    errorAlert.className =
      "alert alert-danger alert-dismissible fade show mt-3";
    errorAlert.innerHTML = `
      <strong>Import Error!</strong> ${error.message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    vendorForm.prepend(errorAlert);
  } finally {
    // Reset file input
    excelFileInput.value = "";

    // Restore button state
    importExcelBtn.innerHTML = '<i class="fas fa-file-excel me-1"></i>Import';
    importExcelBtn.disabled = false;
  }
}

// Helper function to validate date format (YYYY-MM-DD)
function isValidDate(dateString) {
  if (!dateString) return false;

  // Check format
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;

  // Check valid date
  const parts = dateString.split("-");
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // Months are 0-11 in JavaScript
  const day = parseInt(parts[2], 10);

  const date = new Date(year, month, day);

  return (
    date.getFullYear() === year &&
    date.getMonth() === month &&
    date.getDate() === day
  );
}

// Function to show clinic selection modal
function showClinicSelectionModal(clinicData) {
  const clinicList = document.getElementById("clinic-list");
  clinicList.innerHTML = "";

  // Create the list of clinics
  Object.keys(clinicData).forEach((clinicName) => {
    const itemCount = clinicData[clinicName].length;
    const listItem = document.createElement("div");
    listItem.className =
      "list-group-item d-flex justify-content-between align-items-center";
    listItem.innerHTML = `
      <div>
        <span class="fw-bold">${clinicName}</span>
      </div>
      <span class="badge bg-primary rounded-pill">${itemCount} items</span>
    `;

    clinicList.appendChild(listItem);
  });

  // Setup the upload all button
  const uploadAllBtn = document.getElementById("upload-all-clinics-btn");

  // Remove any existing event listeners
  const newUploadAllBtn = uploadAllBtn.cloneNode(true);
  uploadAllBtn.parentNode.replaceChild(newUploadAllBtn, uploadAllBtn);

  // Add event listener for batch upload
  newUploadAllBtn.addEventListener("click", async () => {
    await uploadAllClinics(clinicData);
  });

  // Show the modal
  const multiClinicModal = new bootstrap.Modal(
    document.getElementById("multiClinicModal")
  );
  multiClinicModal.show();
}

// Function to upload all clinics data to Firebase
async function uploadAllClinics(clinicData) {
  // Show loading state
  const uploadAllBtn = document.getElementById("upload-all-clinics-btn");
  const originalBtnText = uploadAllBtn.innerHTML;
  uploadAllBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Uploading...';
  uploadAllBtn.disabled = true;

  try {
    const results = {
      success: 0,
      failed: 0,
      clinics: [],
    };

    // Process each clinic
    for (const clinicName in clinicData) {
      const medicines = clinicData[clinicName];

      const vendorData = {
        clinic_name: clinicName.trim(),
        medicines: medicines,
        created_at: new Date().toISOString(),
      };

      try {
        const docRef = await addDoc(
          collection(db, "vendor_inventory"),
          vendorData
        );
        results.success++;
        results.clinics.push({
          name: clinicName,
          status: "success",
          medicines: medicines.length,
        });
      } catch (error) {
        console.error(
          `Error uploading data for clinic "${clinicName}":`,
          error
        );
        results.failed++;
        results.clinics.push({
          name: clinicName,
          status: "failed",
          error: error.message,
        });
      }
    }

    // Close the modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("multiClinicModal")
    );
    modal.hide();

    // Show completion notification
    let resultMessage = `<strong>Upload Complete!</strong><br>`;
    resultMessage += `✅ ${results.success} clinic(s) uploaded successfully<br>`;

    if (results.failed > 0) {
      resultMessage += `❌ ${results.failed} clinic(s) failed<br><br>`;
      resultMessage += `<div class="mt-2"><strong>Details:</strong><ul>`;

      results.clinics.forEach((clinic) => {
        if (clinic.status === "success") {
          resultMessage += `<li>${clinic.name}: Uploaded ${clinic.medicines} medicine entries</li>`;
        } else {
          resultMessage += `<li>${clinic.name}: Failed - ${clinic.error}</li>`;
        }
      });

      resultMessage += `</ul></div>`;
    }

    const resultAlert = document.createElement("div");
    resultAlert.className = `alert ${
      results.failed > 0 ? "alert-warning" : "alert-success"
    } alert-dismissible fade show mt-3`;
    resultAlert.innerHTML = `
      ${resultMessage}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    vendorForm.prepend(resultAlert);

    // Auto-dismiss the alert after 10 seconds (longer for results summary)
    setTimeout(() => {
      const alertElement = document.querySelector(".alert");
      if (alertElement) {
        const bsAlert = new bootstrap.Alert(alertElement);
        bsAlert.close();
      }
    }, 10000);
  } catch (error) {
    console.error("Error in batch upload:", error);

    // Error notification
    const errorAlert = document.createElement("div");
    errorAlert.className =
      "alert alert-danger alert-dismissible fade show mt-3";
    errorAlert.innerHTML = `
      <strong>Batch Upload Error!</strong> ${error.message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    vendorForm.prepend(errorAlert);

    // Close the modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("multiClinicModal")
    );
    modal.hide();
  } finally {
    // Restore button state
    uploadAllBtn.innerHTML = originalBtnText;
    uploadAllBtn.disabled = false;
  }
}

// Function to load clinic data into the form
function loadClinicData(clinicName, medicineItems) {
  // Reset form first - keep one blank entry
  const medicineContainer = document.getElementById("medicine-container");

  // Set clinic name
  document.getElementById("clinic_name").value = clinicName;

  // Keep only the first medicine entry and clear its values
  const entries = medicineContainer.querySelectorAll(".medicine-entry");
  if (entries.length > 0) {
    const firstEntry = entries[0];
    firstEntry.querySelectorAll("input").forEach((input) => (input.value = ""));

    // Remove all other entries
    for (let i = 1; i < entries.length; i++) {
      entries[i].remove();
    }
  }

  if (medicineItems.length === 0) {
    return;
  }

  // Load the first item into the existing entry
  const firstEntry = medicineContainer.querySelector(".medicine-entry");
  if (firstEntry && medicineItems[0]) {
    const item = medicineItems[0];

    const medicineNameInput = firstEntry.querySelector(".medicine_name");
    const batchNameInput = firstEntry.querySelector(".batch_name");
    const quantityInput = firstEntry.querySelector(".quantity");
    const priceInput = firstEntry.querySelector(".price");
    const manufacturingDateInput = firstEntry.querySelector(
      ".manufacturing_date"
    );
    const expiryDateInput = firstEntry.querySelector(".expiry_date");

    if (medicineNameInput && item.medicine_name)
      medicineNameInput.value = item.medicine_name;

    if (batchNameInput && item.batch_name)
      batchNameInput.value = item.batch_name;

    if (quantityInput && item.quantity) quantityInput.value = item.quantity;

    if (priceInput && item.price) priceInput.value = item.price;

    if (manufacturingDateInput && item.manufacturing_date)
      manufacturingDateInput.value = item.manufacturing_date;

    if (expiryDateInput && item.expiry_date)
      expiryDateInput.value = item.expiry_date;

    calculateTotal(firstEntry);
  }

  // Create entries for the rest of the items
  for (let i = 1; i < medicineItems.length; i++) {
    createMedicineEntryWithData(medicineItems[i]);
  }

  // Show success message
  const successAlert = document.createElement("div");
  successAlert.className =
    "alert alert-success alert-dismissible fade show mt-3";
  successAlert.innerHTML = `
    <strong>Success!</strong> Imported ${medicineItems.length} medicine entries for clinic "${clinicName}".
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;
  vendorForm.prepend(successAlert);

  // Auto-dismiss the alert after 5 seconds
  setTimeout(() => {
    const alertElement = document.querySelector(".alert");
    if (alertElement) {
      const bsAlert = new bootstrap.Alert(alertElement);
      bsAlert.close();
    }
  }, 5000);
}

// Add event listener for the import button
importExcelBtn.addEventListener("click", handleExcelImport);

// Sample Excel template download functionality
document
  .getElementById("download-sample-excel")
  .addEventListener("click", function (e) {
    e.preventDefault();

    // Create a workbook
    const wb = XLSX.utils.book_new();

    // Sample data
    const data = [
      [
        "Clinic Name",
        "Medicine Name",
        "Quantity",
        "Price (₹)",
        "Batch Name",
        "Manufacturing Date",
        "Expiry Date",
      ],
      [
        "Apollo Clinic",
        "Paracetamol",
        100,
        5.5,
        "PARA2025",
        "2024-06-15",
        "2025-06-14",
      ],
      [
        "Apollo Clinic",
        "Amoxicillin",
        50,
        12.75,
        "AMOX2025",
        "2024-07-10",
        "2025-07-09",
      ],
      [
        "MediCare Center",
        "Ibuprofen",
        75,
        8.25,
        "IBU2025",
        "2024-05-20",
        "2025-05-19",
      ],
      [
        "MediCare Center",
        "Cetirizine",
        60,
        15.0,
        "CET2025",
        "2024-08-05",
        "2025-08-04",
      ],
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Medicine Inventory");

    // Create download
    XLSX.writeFile(wb, "MedicineInventoryTemplate.xlsx");
  });
