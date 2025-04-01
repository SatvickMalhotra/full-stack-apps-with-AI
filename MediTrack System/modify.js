import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import {
getFirestore, collection, getDocs, query, limit, startAfter, where,
doc, updateDoc, getDoc
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
apiKey: "",
authDomain: "-inv..com",
projectId: "-inv",
storageBucket: "-inv..com",
messagingSenderId: "",
appId: "1::web:"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const partnerSelector = document.getElementById("partner-selector");
const clinicSelector = document.getElementById("clinic-selector");
const clinicSearch = document.getElementById("clinic-search");
const loadMoreButton = document.getElementById("load-more-clinics");
const backToTopButton = document.getElementById("back-to-top");
const updateAllButton = document.getElementById("update-all");
const downloadDataButton = document.getElementById("download-data");

// Variables to hold clinics and partners info
let allClinics = [];
let allPartners = [];
let clinicPartnerMap = {}; // Map clinic -> partner

// ----------------------------------------------------
// Date Conversion Functions
// ----------------------------------------------------

// Converts Firestore date string ("dd-mm-yyyy") to "yyyy-mm-dd" for input fields.
function formatDateToInput(dateStr) {
if (!dateStr) return "";
// Split on dash since dates are stored as "dd-mm-yyyy"
const parts = dateStr.split("-");
if (parts.length !== 3) return dateStr;
const [day, month, year] = parts;
// Return in ISO format for <input type="date">
return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

// Converts date from input ("yyyy-mm-dd") back to "dd-mm-yyyy" for storage in Firestore.
function formatDateToStorage(dateStr) {
if (!dateStr) return "";
const parts = dateStr.split("-");
if (parts.length !== 3) return dateStr;
const [year, month, day] = parts;
return `${day}-${month}-${year}`;
}

// Helper function for CSV download formatting: convert "yyyy-mm-dd" to "dd-mm-yyyy"
function formatDateFromInput(dateStr) {
if (!dateStr) return "";
const parts = dateStr.split("-");
if (parts.length !== 3) return dateStr;
const [year, month, day] = parts;
return `${day}-${month}-${year}`;
}

// Helper function to get current date in YYYY-MM-DD for filename
function getFormattedDate() {
const now = new Date();
const year = now.getFullYear();
const month = String(now.getMonth() + 1).padStart(2, "0");
const day = String(now.getDate()).padStart(2, "0");
return `${year}-${month}-${day}`;
}

// ----------------------------------------------------
// Load All Clinics and Partners (without caching)
// ----------------------------------------------------

// This function uses pagination in a loop to load every document in the
// "medicine_inventory" collection so that search and filtering work on the full dataset.
async function loadAllClinicsAndPartners() {
let lastDoc = null;
let hasMore = true;
const pageSize = 50;

// Clear arrays in case this is a refresh
allClinics = [];
allPartners = [];
clinicPartnerMap = {};

while (hasMore) {
let q;
if (lastDoc) {
q = query(collection(db, "medicine_inventory"), startAfter(lastDoc), limit(pageSize));
} else {
q = query(collection(db, "medicine_inventory"), limit(pageSize));
}

const querySnapshot = await getDocs(q);
querySnapshot.forEach((docSnap) => {
const data = docSnap.data();
const clinicName = data.name_of_clinic;
const partnerName = data.name_of_partner;

if (clinicName && !allClinics.includes(clinicName)) {
allClinics.push(clinicName);
}

if (partnerName && !allPartners.includes(partnerName)) {
allPartners.push(partnerName);
}

// Map the clinic to its partner
if (clinicName && partnerName) {
clinicPartnerMap[clinicName] = partnerName;
}
});

if (querySnapshot.docs.length < pageSize) {
hasMore = false;
} else {
lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
}
}

updatePartnerDropdown(allPartners);
updateDropdown(allClinics);
}

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
// Filter clinics by selected partner
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

// Further filter if a partner is selected
const selectedPartner = partnerSelector.value;
if (selectedPartner) {
filteredClinics = filteredClinics.filter(clinic =>
clinicPartnerMap[clinic] === selectedPartner
);
}

updateDropdown(filteredClinics);
});

// Remove or repurpose the "Load More" button as all clinics are loaded at once.
loadMoreButton.style.display = "none";

// ----------------------------------------------------
// Load Inventory for Selected Clinic
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
// Fallback for nurse name if missing.
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
<td><button class="update-btn" data-id="${docSnap.id}" data-index="${index}">Update</button></td>
`;
inventoryTable.appendChild(row);
});
});

// Scroll to inventory table
document.getElementById("inventory-table").scrollIntoView({ behavior: "smooth" });
});

// ----------------------------------------------------
// Update Inventory Data for Single Row
// ----------------------------------------------------
document.querySelector("#inventory-table tbody").addEventListener("click", async function(event) {
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
});

// ----------------------------------------------------
// Update All Inventory Data (Bulk Update)
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
// Back to Top Button
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

// Format dates from input ("yyyy-mm-dd") to "dd-mm-yyyy"
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

// Right-click (context menu) on the download button to choose JSON download
downloadDataButton.addEventListener("contextmenu", function(event) {
event.preventDefault();

if (confirm("Would you like to download the complete inventory data in JSON format? (Cancel for CSV format)")) {
downloadFullInventoryData();
} else {
downloadInventoryData();
}
});

// Download button click event for CSV format
downloadDataButton.addEventListener("click", downloadInventoryData);

// ----------------------------------------------------
// Initialize: Load all partners and clinics
// ----------------------------------------------------
loadAllClinicsAndPartners();
