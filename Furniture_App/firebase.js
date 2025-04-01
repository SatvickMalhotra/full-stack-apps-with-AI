import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.1/firebase-app.js";
import {userConfirmed} from "./script.js"
import {
  getDatabase,
  ref as dbRef,
  set,
  get,
  update,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-database.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.13.1/firebase-storage.js";
  const firebaseConfig = {
    apiKey: "",
    authDomain: "-..com",
    databaseURL: "https://-3b411--..com",
    projectId: "-3b411",
    storageBucket: "-3b411..com",
    messagingSenderId: "",
    appId: "1::web:",
    measurementId: "G-"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const storage = getStorage(app);

// Helper function to get element value
function getElementVal(id) {
  const element = document.getElementById(id);
  return element ? element.value : null;
}

// Helper function to get values from multiple input fields by class
function getMultipleValuesByClass(fieldClass) {
  const values = [];
  const inputs = document.querySelectorAll(`.${fieldClass}`);
  inputs.forEach((input) => {
    const parent = input.closest(".item");

    if (fieldClass === "itemSelect") {
      const itemInput = parent.querySelector(".itemInput");

      if (input.value === "other" && itemInput.value.trim()) {
        values.push(itemInput.value.trim());
      } else {
        values.push(input.value);
      }
    } else {
      values.push(input.value.trim());
    }
  });
  return values;
}

// Helper function to generate a custom key
function generateCustomKey() {
  const empIDInput = getElementVal("employeeIdSearch");
  const timestamp = Date.now();
  return `${timestamp}_${empIDInput}`;
}
let filesArray = [];

document
  .getElementById("fileInput")
  .addEventListener("change", function (event) {
    // Add selected files to the filesArray
    Array.from(event.target.files).forEach((file) => {
      filesArray.push(file);
    });

    // Clear the file input to allow re-selection
    event.target.value = "";

    // Update the file preview and file count
    updateFilePreview();
    updateFileCount();
  });

function updateFilePreview() {
  const previewContainer = document.getElementById("filePreviewContainer");
  previewContainer.innerHTML = ""; // Clear existing preview

  filesArray.forEach((file, index) => {
    const fileDiv = document.createElement("div");
    fileDiv.classList.add("file-preview");

    // Determine file type and create appropriate preview
    if (file.type.startsWith("image/")) {
      // Image preview
      const img = document.createElement("img");
      img.src = URL.createObjectURL(file);
      img.alt = file.name;
      img.style.maxWidth = "200px";
      img.style.maxHeight = "200px";
      fileDiv.appendChild(img);
    } else if (file.type.startsWith("video/")) {
      // Video preview
      const video = document.createElement("video");
      video.src = URL.createObjectURL(file);
      video.controls = true;
      video.style.maxWidth = "300px";
      video.style.maxHeight = "200px";
      fileDiv.appendChild(video);
    } else {
      // Default preview (e.g., for PDFs, documents)
      const fileName = document.createElement("span");
      fileName.textContent = `${index + 1}. ${file.name}`;
      fileDiv.appendChild(fileName);
    }

    // Add a remove button for each file preview
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", function () {
      removeFile(index);
    });

    fileDiv.appendChild(removeButton);
    previewContainer.appendChild(fileDiv);
  });
}

function updateFileCount() {
  const fileCountValue = document.getElementById("fileCountValue");
  fileCountValue.textContent = filesArray.length; // Update the file count
}

function removeFile(index) {
  filesArray.splice(index, 1);
  updateFilePreview();
  updateFileCount(); // Update the file count after removal
}

document.addEventListener("DOMContentLoaded", function () {
  document
    .getElementById("submit1")
    .addEventListener("click", async function (e) {
      e.preventDefault();

      const itemRows = document.querySelectorAll(".item");
      if (itemRows.length === 0) {
        return;
      }

      if (filesArray.length < 2) {
        return;
      }

      try {
        if (userConfirmed) {
          console.log(userConfirmed);
          console.log("Uploading data to Firebase...");
          const timestamp = Date.now();
          const customKey = generateCustomKey();
          const storageFolderLink = `https://console.firebase.google.com/u/1/project/mswasth-3b411/storage/mswasth-3b411.appspot.com/files/~2Ffiles~2F${customKey}`;

          const clinics = getMultipleValuesByClass("clinicCodeInput");
          const cells = getMultipleValuesByClass("itemSelect");
          const quantities = getMultipleValuesByClass("quantityInput");
          const prices = getMultipleValuesByClass("priceInput");

          const entry = {
            name: getElementVal("dcName"),
            empid_search: getElementVal("employeeIdSearch"),
            empid_name: getElementVal("employeeIdSearch"),
            partnername: getElementVal("partnerNameSearch"),
            clinic: clinics,
            cell: cells,
            quant: quantities,
            price: prices,
            username: getElementVal("username"),
            passwd: getElementVal("password"),
            timestamp: timestamp,
            fileUrls: [],
            folderLink: storageFolderLink,
          };

          // Upload files to Firebase Storage
          for (let i = 0; i < filesArray.length; i++) {
            const file = filesArray[i];
            const fileRef = storageRef(
              storage,
              `files/${customKey}/${file.name}`
            );
            await uploadBytes(fileRef, file);
            const downloadURL = await getDownloadURL(fileRef);
            entry.fileUrls.push(downloadURL);
            console.log(`File ${file.name} uploaded successfully`);
          }

          // Save the entry to Firebase using the custom key
          await set(dbRef(db, `user/${customKey}`), entry);
          console.log("Data saved successfully");
          Swal.fire({
            icon: "success",
            title: "Data Submitted Successfully.",
            text: "Thank You",
            confirmButtonText: "OK",
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
          });

          // Optionally, reset the form or redirect the user here
          document.getElementById("dataForm").reset();
          filesArray = []; // Clear the files array after submission
          updateFilePreview(); // Clear the file preview after submission
          updateFileCount(); // Reset the file count
          translatePage("en");
        }
      } catch (error) {
        console.error("Error submitting data:", error);
        alert(
          "Firebase: An error occurred while submitting the data. Please try again."
        );
        console.log(error);
      }
    });
});

// Function to add folder links to existing entries only if they don't have one
async function addFolderLinksToExistingEntries() {
  try {
    const snapshot = await get(dbRef(db, "user"));
    const data = snapshot.val();
    if (data) {
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const entry = data[key];
          if (!entry.folderLink) {
            const storageFolderLink = `https://console.firebase.google.com/u/1/project/mswasth-3b411/storage/mswasth-3b411.appspot.com/files/~2Ffiles~2F${key}`;
            await update(dbRef(db, `user/${key}`), {
              folderLink: storageFolderLink,
            });
            console.log(`Folder link added to entry with key: ${key}`);
          } else {
            // console.log(`Entry with key ${key} already has a folder link. Skipping.`);
          }
        }
      }
    } else {
      console.log("No existing entries found.");
    }
  } catch (error) {
    console.error("Error adding folder links:", error);
  }
}

// Call the function to add folder links to existing entries
addFolderLinksToExistingEntries();
export { firebaseConfig, app, db, storage,filesArray };
 
