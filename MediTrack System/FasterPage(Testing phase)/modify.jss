// Import Firebase modules from the CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
  getFirestore, collection, getDocs, query, limit, startAfter, where,
  doc, updateDoc, getDoc, getCountFromServer
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUU6K4zed1v0h_VXxntzGO6IAbi5MVNp8",
  authDomain: "medicine-inv.firebaseapp.com",
  projectId: "medicine-inv",
  storageBucket: "medicine-inv.appspot.com",
  messagingSenderId: "567115066968",
  appId: "1:567115066968:web:7a03e36c298bebbfaea42d"
};

// Initialize Firebase app and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Select DOM Elements
const partnerSelector = document.getElementById("partner-selector");
const clinicSelector = document.getElementById("clinic-selector");
const clinicSearch = document.getElementById("clinic-search");
const loadMoreButton = document.getElementById("load-more-clinics");
const backToTopButton = document.getElementById("back-to-top");
const updateAllButton = document.getElementById("update-all");
const downloadDataButton = document.getElementById("download-data");
const progressContainer = document.getElementById("progress-container");
const progressBar = document.getElementById("progress-bar");
const progressText = document.getElementById("progress-text");

// Global Variables to store clinic and partner data
let allClinics = [];
let allPartners = [];
let clinicPartnerMap = {}; // Maps each clinic to its partner

// ----------------------------------------------------
// Date Conversion Functions
// ----------------------------------------------------
function formatDateToInput(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function formatDateToStorage(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
}

function formatDateFromInput(dateStr) {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
}

function getFormattedDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// ----------------------------------------------------
// Load Only Clinic and Partner Names with Live Caching Progress
// ----------------------------------------------------
async function loadAllClinicsAndPartners() {
  // Check for cached data first
  const cachedData = localStorage.getItem("clinicDataCache");
  if (cachedData) {
    const parsedCache = JSON.parse(cachedData);
    allClinics = parsedCache.allClinics;
    allPartners = parsedCache.allPartners;
    clinicPartnerMap = parsedCache.clinicPartnerMap;

    updatePartnerDropdown(allPartners);
    updateDropdown(allClinics);

    updateProgress(100);
    setTimeout(() => progressContainer.classList.add("hidden"), 500);
    return;
  }

  // Get total document count
  const collRef = collection(db, "medicine_inventory");
  const snapshotCount = await getCountFromServer(collRef);
  const totalDocs = snapshotCount.data().count;
  let processedDocs = 0;

  // Clear arrays
  allClinics = [];
  allPartners = [];
  clinicPartnerMap = {};

  let lastDoc = null;
  let hasMore = true;
  const pageSize = 50;

  // Loop through documents in batches
  while (hasMore) {
    let q;
    if (lastDoc) {
      q = query(collRef, startAfter(lastDoc), limit(pageSize));
    } else {
      q = query(collRef, limit(pageSize));
    }
    const querySnapshot = await getDocs(q);

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      // Extract only the needed fields
      const clinicName = data.name_of_clinic;
      const partnerName = data.name_of_partner;

      if (clinicName && !allClinics.includes(clinicName)) {
        allClinics.push(clinicName);
      }
      if (partnerName && !allPartners.includes(partnerName)) {
        allPartners.push(partnerName);
      }
      if (clinicName && partnerName) {
        clinicPartnerMap[clinicName] = partnerName;
      }
    });

    processedDocs += querySnapshot.docs.length;
    const progressPercent = Math.min(100, Math.floor((processedDocs / totalDocs) * 100));
    updateProgress(progressPercent);

    if (querySnapshot.docs.length < pageSize) {
      hasMore = false;
    } else {
      lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
    }
  }

  // Cache the fetched data in localStorage
  const cacheData = { allClinics, allPartners, clinicPartnerMap };
  localStorage.setItem("clinicDataCache", JSON.stringify(cacheData));

  updatePartnerDropdown(allPartners);
  updateDropdown(allClinics);

  updateProgress(100);
  setTimeout(() => progressContainer.classList.add("hidden"), 500);
}

// Function to update progress bar UI
function updateProgress(percent) {
  progressBar.style.width = percent + "%";
  progressText.textContent = percent + "%";
}

// ----------------------------------------------------
// Dropdown Update Functions
// ----------------------------------------------------
function updatePartnerDropdown(partners) {
  partnerSelector.innerHTML = `<option value="">All Partners</option>`;
  partners.forEach((partner) => {
    const option = document.createElement("option");
    option.value = partner;
    option.textContent = partner;
    partnerSelector.appendChild(option);
  });
}

function updateDropdown(clinics) {
  clinicSelector.innerHTML = `<option value="">Select a Clinic</option>`;
  clinics.forEach((clinic) => {
    const option = document.createElement("option");
    option.value = clinic;
    option.textContent = clinic;
    clinicSelector.appendChild(option);
  });
}

// ----------------------------------------------------
// Event Listeners for Filtering Clinics
// ----------------------------------------------------
partnerSelector.addEventListener("change", function() {
  const selectedPartner = this.value;
  if (selectedPartner) {
    const filteredClinics = allClinics.filter(clinic =>
      clinicPartnerMap[clinic] === selectedPartner
    );
    updateDropdown(filteredClinics);
  } else {
    updateDropdown(allClinics);
  }
  clinicSearch.value = "";
});

clinicSearch.addEventListener("input", function () {
  const searchQuery = clinicSearch.value.toLowerCase();
  let filteredClinics = allClinics.filter(clinic =>
    clinic.toLowerCase().includes(searchQuery)
  );
  const selectedPartner = partnerSelector.value;
  if (selectedPartner) {
    filteredClinics = filteredClinics.filter(clinic =>
      clinicPartnerMap[clinic] === selectedPartner
    );
  }
  updateDropdown(filteredClinics);
});

// Hide the "Load More" button as all clinics are loaded at once
loadMoreButton.style.display = "none";

// ----------------------------------------------------
// Load Inventory for Selected Clinic (Full Data)
// ----------------------------------------------------
clinicSelector.addEventListener("change", async function () {
  const selectedClinic = this.value;
  if (!selectedClinic) return;

  const inventoryTable = document.querySelector("#inventory-table tbody");
  inventoryTable.innerHTML = "";

  const q = query(
    collection(db, "medicine_inventory"),
    where("name_of_clinic", "==", selectedClinic),
    limit(50)
  );
  const querySnapshot = await getDocs(q);

  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    data.name_of_nurse = data.name_of_nurse || "Unknown Nurse";

    data.medicines.forEach((med, index) => {
      const formattedExpiry = formatDateToInput(med.expiry_date);
      const formattedMfg = formatDateToInput(med.manufacturing_date);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${med.name}</td>
        <td><input type="text" value="${med.batch_name}" data-index="${index}" data-id="${docSnap.id}" class="edit-batch"></td>
        <td><input type="number" value="${med.quantity}" data-index="${index}" data-id="${docSnap.id}" class="edit-quantity"></td>
        <td><input type="date" value="${formattedExpiry}" data-index="${index}" data-id="${docSnap.id}" class="edit-expiry"></td>
        <td><input type="date" value="${formattedMfg}" data-index="${index}" data-id="${docSnap.id}" class="edit-mfg"></td>
        <td>
          <button class="update-btn" data-id="${docSnap.id}" data-index="${index}">Update</button>
          <button class="duplicate-btn" data-id="${docSnap.id}" data-index="${index}">Duplicate</button>
        </td>
      `;
      inventoryTable.appendChild(row);
    });
  });

  // Smooth scroll to the inventory table once loaded
  document.getElementById("inventory-table").scrollIntoView({ behavior: "smooth" });
});

// ----------------------------------------------------
// Update / Duplicate Inventory Data for Single Row
// ----------------------------------------------------
document.querySelector("#inventory-table tbody").addEventListener("click", async function(event) {
  // Update Single Row
  if (event.target.classList.contains("update-btn")) {
    const docId = event.target.getAttribute("data-id");
    const medIndex = event.target.getAttribute("data-index");
    const row = event.target.closest("tr");

    const newBatchName = row.querySelector(".edit-batch").value;
    const newQuantity = Number(row.querySelector(".edit-quantity").value);
    const newExpiryInput = row.querySelector(".edit-expiry").value;
    const newMfgInput = row.querySelector(".edit-mfg").value;

    const newExpiry = formatDateToStorage(newExpiryInput);
    const newMfg = formatDateToStorage(newMfgInput);

    const docRef = doc(db, "medicine_inventory", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      let medicines = data.medicines;
      medicines[medIndex] = {
        ...medicines[medIndex],
        batch_name: newBatchName,
        quantity: newQuantity,
        expiry_date: newExpiry,
        manufacturing_date: newMfg
      };
      await updateDoc(docRef, { medicines: medicines });
      alert("Inventory Updated!");
      clinicSelector.dispatchEvent(new Event('change'));
    } else {
      alert("Document not found!");
    }
  }
  // Duplicate Single Row
  else if (event.target.classList.contains("duplicate-btn")) {
    const docId = event.target.getAttribute("data-id");
    const medIndex = event.target.getAttribute("data-index");
    const row = event.target.closest("tr");

    // Get current (possibly edited) values from the row
    const newBatchName = row.querySelector(".edit-batch").value;
    const newQuantity = Number(row.querySelector(".edit-quantity").value);
    const newExpiryInput = row.querySelector(".edit-expiry").value;
    const newMfgInput = row.querySelector(".edit-mfg").value;

    // Convert dates back to dd-mm-yyyy for storage
    const newExpiry = formatDateToStorage(newExpiryInput);
    const newMfg = formatDateToStorage(newMfgInput);

    try {
      const docRef = doc(db, "medicine_inventory", docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        let medicines = data.medicines;

        // Create duplicated medicine entry with current values
        const duplicatedMed = {
          ...medicines[medIndex],
          batch_name: newBatchName,
          quantity: newQuantity,
          expiry_date: newExpiry,
          manufacturing_date: newMfg
        };

        // Append duplicated entry to the medicines array
        medicines.push(duplicatedMed);

        // Update Firestore with the new array
        await updateDoc(docRef, { medicines: medicines });

        alert("Medicine entry duplicated!");
        // Refresh the table to show the new entry
        clinicSelector.dispatchEvent(new Event('change'));
      } else {
        alert("Document not found!");
      }
    } catch (error) {
      console.error("Error duplicating entry:", error);
      alert("Error duplicating entry. Please try again.");
    }
  }
});

// ----------------------------------------------------
// Bulk Update All Inventory Data
// ----------------------------------------------------
updateAllButton.addEventListener("click", async () => {
  const rows = document.querySelectorAll("#inventory-table tbody tr");
  const docUpdates = {};

  rows.forEach(row => {
    const batchInput = row.querySelector(".edit-batch");
    const quantityInput = row.querySelector(".edit-quantity");
    const expiryInput = row.querySelector(".edit-expiry");
    const mfgInput = row.querySelector(".edit-mfg");

    const docId = quantityInput.getAttribute("data-id");
    const medIndex = quantityInput.getAttribute("data-index");
    const newBatchName = batchInput.value;
    const newQuantity = Number(quantityInput.value);
    const newExpiry = formatDateToStorage(expiryInput.value);
    const newMfg = formatDateToStorage(mfgInput.value);

    if (!docUpdates[docId]) {
      docUpdates[docId] = [];
    }
    docUpdates[docId].push({
      index: medIndex,
      batch: newBatchName,
      quantity: newQuantity,
      expiry: newExpiry,
      mfg: newMfg
    });
  });

  for (const docId in docUpdates) {
    const docRef = doc(db, "medicine_inventory", docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      let medicines = data.medicines;
      const updates = docUpdates[docId];

      updates.forEach(update => {
        medicines[update.index] = {
          ...medicines[update.index],
          batch_name: update.batch,
          quantity: update.quantity,
          expiry_date: update.expiry,
          manufacturing_date: update.mfg
        };
      });

      await updateDoc(docRef, { medicines: medicines });
    }
  }
  alert("All inventory updated!");
  clinicSelector.dispatchEvent(new Event('change'));
});

// ----------------------------------------------------
// Back to Top Button Functionality
// ----------------------------------------------------
backToTopButton.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

window.addEventListener("scroll", () => {
  if (window.scrollY > 200) {
    backToTopButton.style.display = "block";
  } else {
    backToTopButton.style.display = "none";
  }
});

// ----------------------------------------------------
// Download Inventory Data as CSV
// ----------------------------------------------------
function downloadInventoryData() {
  const selectedClinic = clinicSelector.value;
  if (!selectedClinic) {
    alert("Please select a clinic first");
    return;
  }

  const rows = document.querySelectorAll("#inventory-table tbody tr");
  if (rows.length === 0) {
    alert("No data available to download");
    return;
  }

  let csvContent = "Medicine Name,Batch Name,Quantity,Expiry Date,Manufacturing Date\n";

  rows.forEach(row => {
    const medicineName = row.cells[0].textContent;
    const batchName = row.querySelector(".edit-batch").value;
    const quantity = row.querySelector(".edit-quantity").value;
    const expiryDate = row.querySelector(".edit-expiry").value;
    const mfgDate = row.querySelector(".edit-mfg").value;

    const formattedExpiry = expiryDate ? formatDateFromInput(expiryDate) : "";
    const formattedMfg = mfgDate ? formatDateFromInput(mfgDate) : "";

    csvContent += `"${medicineName}","${batchName}",${quantity},"${formattedExpiry}","${formattedMfg}"\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", `${selectedClinic}_inventory_${getFormattedDate()}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ----------------------------------------------------
// Download Complete Inventory Data as JSON
// ----------------------------------------------------
async function downloadFullInventoryData() {
  const selectedClinic = clinicSelector.value;
  if (!selectedClinic) {
    alert("Please select a clinic first");
    return;
  }

  try {
    const q = query(
      collection(db, "medicine_inventory"),
      where("name_of_clinic", "==", selectedClinic)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("No data available to download");
      return;
    }

    const clinicData = [];
    querySnapshot.forEach((docSnap) => {
      clinicData.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    const dataStr = JSON.stringify(clinicData, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.setAttribute("href", url);
    link.setAttribute("download", `${selectedClinic}_full_data_${getFormattedDate()}.json`);
    link.style.visibility = "hidden";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading data:", error);
    alert("Error downloading data. Please try again.");
  }
}

// Right-click on the download button for JSON option
downloadDataButton.addEventListener("contextmenu", function(event) {
  event.preventDefault();
  if (confirm("Download complete inventory in JSON format? (Cancel for CSV)")) {
    downloadFullInventoryData();
  } else {
    downloadInventoryData();
  }
});

downloadDataButton.addEventListener("click", downloadInventoryData);

// ----------------------------------------------------
// Initialize: Load only clinic and partner names with caching and live progress
// ----------------------------------------------------
loadAllClinicsAndPartners();
