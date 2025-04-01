import { firebaseConfig, app, db, storage, filesArray } from "./firebase.js";

export { userConfirmed };
let userConfirmed = false;
document.getElementById("submit1").addEventListener("click", submitData);

var dataemployeeIds = JSON.parse(localStorage.getItem("dataemployeeids"));
console.log("Employee IDs fetched:");
console.log(dataemployeeIds);
const select = document.getElementById("employeeId");
dataemployeeIds.forEach((id) => {
  console.log(id);
  console.log("hi");
  const option = document.createElement("option");
  option.value = id;
  option.textContent = id;
  select.appendChild(option);
});

var dataPartnerNames = JSON.parse(localStorage.getItem("datapartnernames"));
console.log("Partner Names fetched:");
console.log(dataPartnerNames);
const select1 = document.getElementById("partnerName");
dataPartnerNames.forEach((partner) => {
  console.log(partner);
  console.log("hi");
  const option = document.createElement("option");
  option.value = partner;
  option.textContent = partner;
  select1.appendChild(option);
});

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("addItemButton").addEventListener("click", addItem);

  document.getElementById("employeeId").addEventListener("change", function () {
    const empIDSelect = document.getElementById("employeeId");
    const empIDInput = document.getElementById("empIDInput");
    if (empIDSelect.value === "other") {
      empIDInput.style.display = "block";
    } else {
      empIDInput.style.display = "none";
    }
  });
});

function addItem() {
  const container = document.getElementById("itemsContainer");
  const itemDiv = document.createElement("div");
  itemDiv.className = "item";
  itemDiv.innerHTML = `
    <input type="text" placeholder="Clinic Code" class="clinicCodeInput" required maxlength="10"/> 
    <select class="itemSelect">
      <option value="cells">Cells</option>
      <option value="shelf">Shelf</option>
      <option value="chair">Chair</option>
      <option value="tablet charger">Tablet Charger</option>
      <option value="bm machine charger cable">BM Machine Charger Cable</option>
      <option value="tablet charging cable">Tablet Charging Cable</option>
      <option value="stationary item">Stationary Item</option>
      <option value="first-aid kit item">First-Aid Kit Item</option>
      <option value="bp kit">BP Kit</option>
      <option value="power bank">Power Bank</option>
      <option value="earphone">Earphone</option>
      <option value="stand">Stand</option>
      <option value="certificate">Certificate</option>
      <option value="first-aid kit">First-Aid KIT</option>
      <option value="bags">Bags</option>
      <option value="tube light">Tube Light</option>
      <option value="extension">Extension</option>
      <option value="sanitizer">Sanitizer</option>
      <option value="doctor certificate">Doctor Certificate</option>
      <option value="fan">Fan</option>
      <option value="curtain">Curtain</option>
      <option value="counter-table">Counter-Table</option>
      <option value="labourCost">labourCost</option>
      <option value="Branding">Branding</option>
      <option value="Cleanliness">Cleanliness</option>
      <option value="Infrassets">Infrassets</option>
      <option value="medical-instruments">Medical Instruments</option>
      <option value="live-consultation">Live Consultation</option>
      <option value="medicines">Medicines</option>
      <option value="establishment-compliance">Establishment Compliance</option>
      <option value="field-ops">Field Operations</option>
      <option value="nurses-check">Nurses Check</option>
      <option value="repairing-charges">Repairing Charges</option>




      
      <option value="TransportCost">TransportCost</option>
      <option value="other">Other</option>
    </select>
    <input type="text" placeholder="If other, specify" class="itemInput" style="display: none;" />
    <input type="number" placeholder="Quantity" class="quantityInput" required />
    <input type="number" step="0.01" placeholder="Price" class="priceInput" required />
    <input type="text" class="sumInput" placeholder="Sum" readonly />
    <button class="deleteItem">Delete Item</button>
    <button class="duplicateItem submitBtn">Duplicate</button>
  `;
  container.appendChild(itemDiv);

  // Attach event listeners to the select element for the custom input toggle
  itemDiv.querySelector(".itemSelect").addEventListener("change", function () {
    toggleCustomItemInput(this);
  });

  // Attach event listeners to the buttons and inputs within the new item
  itemDiv.querySelector(".deleteItem").addEventListener("click", deleteItem);
  itemDiv
    .querySelector(".duplicateItem")
    .addEventListener("click", duplicateItem);
  itemDiv
    .querySelector(".quantityInput")
    .addEventListener("input", () => calculateSum(itemDiv));
  itemDiv
    .querySelector(".priceInput")
    .addEventListener("input", () => calculateSum(itemDiv));

  // Calculate sum for the newly added item
  calculateSum(itemDiv);
  updateTotalSum();
  let selectedLanguage = document.querySelector(
    'input[name="language"]:checked'
  ).value;
  translatePage(selectedLanguage);
}

// Function to calculate the sum based on quantity and price inputs
function calculateSum(itemDiv) {
  const quantityInput = itemDiv.querySelector(".quantityInput");
  const priceInput = itemDiv.querySelector(".priceInput");
  const sumInput = itemDiv.querySelector(".sumInput");

  const quantity = parseFloat(quantityInput.value) || 0;
  const price = parseFloat(priceInput.value) || 0;

  const sum = quantity * price;
  sumInput.value = sum.toFixed(2);
  updateTotalSum();
}

function toggleCustomItemInput(selectElement) {
  const itemDiv = selectElement.closest(".item");
  const itemInput = itemDiv.querySelector(".itemInput");
  const selectedValue = selectElement.value;

  if (selectedValue === "other") {
    itemInput.style.display = "inline-block";
    itemInput.required = true;
  } else {
    itemInput.style.display = "none";
    itemInput.required = false;
    itemInput.value = ""; // Clear the input value
  }

  // Validate the "other" input field
  if (selectedValue === "other" && itemInput.value.trim() === "") {
    itemInput.setCustomValidity("Please specify the item name.");
  } else {
    itemInput.setCustomValidity("");
  }
}

// Function to delete an item row
function deleteItem(event) {
  if (confirm("Are you sure you want to delete this item?")) {
    event.target.parentNode.remove();
    updateTotalSum();
  }
}

function filterEmployeeIds() {
  const input = document.querySelector("#employeeIdSearch");
  const filter = input.value.trim().toUpperCase();
  const select = document.querySelector("#employeeId");
  const options = select.getElementsByTagName("option");
  const placeholderOption = document.querySelector("#placeholderOption");

  let foundCount = 0;

  for (let i = 0; i < options.length; i++) {
    const txtValue = (
      options[i].textContent || options[i].innerText
    ).toUpperCase();
    if (filter === "" || txtValue.indexOf(filter) > -1) {
      options[i].style.display = "";
      foundCount++;
    } else {
      options[i].style.display = "none";
    }
  }

  if (foundCount === 0) {
    placeholderOption.text = "Other";
    select.size = 0;
    select.selectedIndex = 0;
  } else {
    placeholderOption.text = "Select Employee ID";
    const maxSize = 5; // Adjust this value as needed
    select.size = foundCount > maxSize ? maxSize : foundCount;

    if (foundCount === 1) {
      select.size = 2;
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const select = document.querySelector("#employeeId");

  select.addEventListener("change", function () {
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption) {
      document.querySelector("#employeeIdSearch").value = selectedOption.text;
      select.size = 0; // Reset the size to close the dropdown
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("employeeIdSearch");
  searchInput.addEventListener("input", filterEmployeeIds);
});

function updateEmployeeSearchField() {
  const select = document.querySelector("#employeeId");
  const selectedEmployeeId = select.value;
  document.getElementById("employeeIdSearch").value = selectedEmployeeId;
  select.size = 0; // Reset the size to close the dropdown
}

function filterPartnerNames() {
  const input = document.querySelector("#partnerNameSearch");
  const filter = input.value.trim().toLowerCase();
  const select = document.querySelector("#partnerName");
  const options = select.getElementsByTagName("option");
  const placeholderOption = document.querySelector("#partnerPlaceholderOption");

  let foundCount = 0;

  for (let i = 0; i < options.length; i++) {
    const txtValue = (
      options[i].textContent || options[i].innerText
    ).toLowerCase();
    if (filter === "" || txtValue.indexOf(filter) > -1) {
      options[i].style.display = "";
      foundCount++;
    } else {
      options[i].style.display = "none";
    }
  }

  if (foundCount === 0) {
    placeholderOption.text = "Other";
    select.size = 0;
    select.selectedIndex = 0;
  } else {
    placeholderOption.text = "Select Partner Name";
    // Set a maximum size for the dropdown
    const maxSize = 5; // Adjust this value as needed
    select.size = foundCount > maxSize ? maxSize : foundCount;

    if (foundCount === 1) {
      // If only one match is found, display it in the dropdown and set the size to 2
      select.size = 2;
    }
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const select = document.querySelector("#partnerName");

  select.addEventListener("change", function () {
    const selectedOption = select.options[select.selectedIndex];
    if (selectedOption) {
      document.querySelector("#partnerNameSearch").value = selectedOption.text;
      select.size = 0; // Reset the size to close the dropdown
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("partnerNameSearch");
  searchInput.addEventListener("input", filterPartnerNames);
});

function updatePartnerSearchField() {
  const select = document.querySelector("#partnerName");
  const selectedPartnerName = select.value;
  document.getElementById("partnerNameSearch").value = selectedPartnerName;
  select.size = 0; // Reset the size to close the dropdown
}

function validateFormData() {
  const dcName = document.getElementById("dcName").value.trim();
  const partnerName = document.getElementById("partnerNameSearch").value.trim();
  const empid = document.getElementById("employeeIdSearch").value.trim();

  if (dcName === "" || empid === "" || partnerName === "") {
    alert(
      "Please fill the required fields(DC Name, Employee ID, and Partner Name)."
    );
    return false;
  }

  const items = Array.from(document.querySelectorAll(".item"));
  for (const item of items) {
    const clinicCodeInput = item.querySelector(".clinicCodeInput").value.trim();
    const itemSelect = item.querySelector(".itemSelect").value;
    const itemInput =
      item.querySelector(".itemInput").style.display !== "none"
        ? item.querySelector(".itemInput").value.trim()
        : null;
    const itemName = itemSelect !== "other" ? itemSelect : itemInput;
    const quantityInput = item.querySelector(".quantityInput").value.trim();
    const priceInput = item.querySelector(".priceInput").value.trim();

    if (
      clinicCodeInput === "" ||
      itemName === "" ||
      itemName === null ||
      quantityInput === "" ||
      priceInput === ""
    ) {
      alert(
        "Please fill in all fields for each item, including the Clinic Code."
      );
      return false;
    }
  }

  return true;
}

function submitData() {
  userConfirmed = false;
  // Get all the item rows
  const itemRows = document.querySelectorAll(".item");

  // Check if there are any items added
  if (itemRows.length === 0) {
    alert("Please add at least one item before submitting the data.");
    return;
  }
  if (filesArray.length < 2) {
    alert("Please add at leat 2files");
    return;
  }

  // Check if the form data is valid
  if (!validateFormData()) {
    // Handle invalid form data
    return;
  }
  userConfirmed = confirm("Are you sure you want to submit the data?");

  // Check if the user clicked "OK"
  if (!userConfirmed) {
    return;
  }

  try {
    // Retrieve DC Name, Partner Name, and empID values
    const dcName = document.getElementById("dcName").value;

    let empID = document.getElementById("employeeIdSearch").value;
    const empIDInput = document.getElementById("employeeIdSearch").value;
    if (empID === "Other") {
      empID = empIDInput;
    }

    let partnerInput = document.getElementById("partnerNameSearch").value;
    const partnerName = document.getElementById("partnerNameSearch").value;
    if (partnerInput === "Other") {
      partnerInput = partnerName;
    }

    // Map items data including the empID
    const items = Array.from(itemRows).map((item) => {
      const clinicCodeInput = item
        .querySelector(".clinicCodeInput")
        .value.trim();
      const itemSelect = item.querySelector(".itemSelect").value;
      const itemInput =
        item.querySelector(".itemInput").style.display !== "none"
          ? item.querySelector(".itemInput").value
          : null;
      const itemName = itemSelect !== "other" ? itemSelect : itemInput;
      return {
        "DC Name": dcName,
        "emp ID": empID,
        "Clinic Code": clinicCodeInput,
        "Partner Name": partnerName,
        Item: itemName,
        Quantity: item.querySelector(".quantityInput").value,
        Total_Price: item.querySelector(".priceInput").value,
        Sum: item.querySelector(".sumInput").value,
      };
    });

    // Create the Excel file with the items data
    const headers = [
      "DC Name",
      "emp ID",
      "Clinic Code",
      "Partner Name",
      "Item",
      "Quantity",
      "Total_Price",
      "Sum",
    ];
    const wb = XLSX.utils.book_new();
    const wsName = "ItemsData";
    const ws = XLSX.utils.json_to_sheet(items, { header: headers });
    XLSX.utils.book_append_sheet(wb, ws, wsName);
    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    // Save the Excel file
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "ItemsData.xlsx");
    const submitButton = document.getElementById("submit1");
    // Disable the submit button
    submitButton.disabled = true;

    setTimeout(() => {
      submitButton.disabled = false;
    }, 300000);
  } catch (error) {
    // Handle any errors that occurred during data processing or file generation
    console.error("Error:", error);
    alert(
      "submit An error occurred while processing the data. Please try again."
    );
  }
}

function duplicateItem(event) {
  const itemToDuplicate = event.target.closest(".item");
  const newItem = itemToDuplicate.cloneNode(true);

  // Clear clinicCodeInput for the new item
  newItem.querySelector(".clinicCodeInput").value = "";
  const originalSelect = itemToDuplicate.querySelector(".itemSelect");
  const newSelect = newItem.querySelector(".itemSelect");
  newSelect.value = originalSelect.value;

  // Copy other inputs from the previous item
  const originalInputs = itemToDuplicate.querySelectorAll(
    ".quantityInput, .priceInput"
  );
  const newInputs = newItem.querySelectorAll(".quantityInput, .priceInput");

  originalInputs.forEach((input, index) => {
    if (input.classList.contains("itemInput")) {
      // Handle dropdown (select) element differently
      const originalSelect = input.querySelector("select"); // Assuming select is directly within itemInput
      const newSelect = newInputs[index].querySelector("select"); // Assuming select is directly within itemInput
      if (originalSelect && newSelect) {
        newSelect.value = originalSelect.value;
      }
    } else {
      // For other input types (text, number)
      newInputs[index].value = input.value;
    }
  });

  const newItemInput = newItem.querySelector(".itemInput");
  if (newSelect.value === "other") {
    newItemInput.style.display = "inline-block";
    newItemInput.value = itemToDuplicate.querySelector(".itemInput").value;
  } else {
    newItemInput.style.display = "none";
    newItemInput.value = "";
  }

  // Insert the new item after the original
  itemToDuplicate.parentNode.insertBefore(newItem, itemToDuplicate.nextSibling);

  // Attach event listeners to the new item
  newItem.querySelector(".deleteItem").addEventListener("click", deleteItem);
  newItem
    .querySelector(".duplicateItem")
    .addEventListener("click", duplicateItem);
  newSelect.addEventListener("change", function () {
    toggleCustomItemInput(newSelect);
  });
  newItem
    .querySelector(".quantityInput")
    .addEventListener("input", function (e) {
      calculateSum(e.target.closest(".item"));
    });
  newItem.querySelector(".priceInput").addEventListener("input", function (e) {
    calculateSum(e.target.closest(".item"));
  });

  // Calculate sum for the duplicated item
  calculateSum(newItem);
}

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("addItemButton").addEventListener("click", addItem);
  // Attach initial delete button listeners

  // Event listener for EMP ID select (existing functionality)
  document.getElementById("employeeId").addEventListener("change", function () {
    const empIDSelect = document.getElementById("employeeId");
    const empIDInput = document.getElementById("empIDInput");
    if (empIDSelect.value === "other") {
      empIDInput.style.display = "block";
    } else {
      empIDInput.style.display = "none";
    }
  });

  // Function to filter dropdown options (new functionality)
  function filterEmpIDOptions() {
    const searchText = document
      .getElementById("employeeIdSearch")
      .value.toLowerCase();
    const options = document.querySelectorAll("#empID option");

    options.forEach((option) => {
      const optionText = option.text.toLowerCase(); // Convert to lowercase for case-insensitive search
      option.style.display = optionText.includes(searchText) ? "block" : "none";
    });
  }

  // Event listener for search input (new functionality)
  document
    .getElementById("employeeIdSearch")
    .addEventListener("input", filterEmpIDOptions);
});

document.addEventListener("DOMContentLoaded", function () {
  const toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
  };

  // Create Toggle Dark Mode button
  const darkModeButton = document.createElement("button");
  darkModeButton.innerText = "Toggle Dark Mode";
  darkModeButton.className = "dark-mode-button";
  darkModeButton.id = "toggle-button";
  darkModeButton.addEventListener("click", toggleDarkMode);

  // Create Instructions button
  const instructionsButton = document.createElement("button");
  instructionsButton.innerText = "Instructions";
  instructionsButton.className = "instructions-button";
  instructionsButton.id = "instructionsButton";
  instructionsButton.addEventListener("click", showInstructions);
  const buttosidebar = document.querySelector(".button-sidebar");
  buttosidebar.appendChild(darkModeButton);
  buttosidebar.appendChild(instructionsButton);

  // Append both buttons to the sidebar
  const buttonList = document.querySelector(".button-list");
  buttonList.appendChild(darkModeButton);
  buttonList.appendChild(instructionsButton);

  // Create the modal for instructions
  const instructionsModal = document.createElement("div");
  instructionsModal.id = "instructionsModal";
  instructionsModal.className = "modal";
  instructionsModal.innerHTML = `
      <div class="modal-content">
          <span class="close-button">&times;</span>
          <h2 id="instruction" style="background-color: #e5e5e5; margin-top:40px;color: black; padding: 5px; text-align: center; font-size:15px;">INSTRUCTIONS</h2>
          <ul>
              <li id="a">Click on "Add Another Item" to add items.</li>
              <li id="b">Click on "Any type of file can be uploaded here but make sure 1 file is selected</li>
              <li id="c">In "Price", enter the per quantity, per unit price.</li>
              <li id="d">Click on "For any Doubt Pin me on the group or connect with your manager</li>
              <li id="e">Click on "If your EMP_ID is missing you can select the other option there it will auto add the new one for you/</li>
              <li id="f" >In "Item", specify the quantity purchased it will auto capture the sum amount.</li>
              <li id="g">In "EMP ID", select from the available IDs. If not available, it will automatically select "Other".</li>
          </ul>
      </div>
  `;

  // Append the instructions modal to the body
  document.body.appendChild(instructionsModal);

  // Function to show instructions modal
  function showInstructions() {
    instructionsModal.style.display = "block";
  }

  // Function to hide instructions modal
  function hideInstructions() {
    instructionsModal.style.display = "none";
  }

  // Close the modal when the user clicks on the close button
  instructionsModal
    .querySelector(".close-button")
    .addEventListener("click", hideInstructions);

  // Close the modal when the user clicks anywhere outside of the modal content
  window.addEventListener("click", function (event) {
    if (event.target === instructionsModal) {
      hideInstructions();
    }
  });
});

// document.addEventListener("DOMContentLoaded", function () {
//   const users = {
//     v: "1",
//     SATVICK: "123456",
//     SIDDHARTH: "123456",
//     PRAKASH: "123456",
//     HIMANSHU: "123456",
//     RAVI: "123456",
//     DEBAL: "123456",
//     AMBIKA: "123456",
//     NAVNEET: "123456",
//     SAURAB: "123456",
//     ABHISHEK: "123456",
//     SHAIRA: "123456",
//     Gauranga: "123456",
//     suryakant: "123456",
//     // Add more users here in the format "USERNAME": "PASSWORD"
//   };

//   const admins = {
//         q: "1",
//         ADMIN1: "adminpass1",
//         ADMIN2: "adminpass2",
//         ADMIN3: "adminpass3",
//         // Add more admins here in the format "USERNAME": "PASSWORD"
//       };

//   const loginForm = document.createElement("form");
//   loginForm.id = "loginForm";
//   loginForm.innerHTML = `
//   <div class="login-container">
//       <h2>Login</h2>
//       <input type="text" id="username" placeholder="Username" required>
//       <input type="password" id="password" placeholder="Password" required>
//       <p>
//       <button type="submit">Login</button>
//       <div id="loginError" style="color: red; display: none;">Incorrect username or password</div>
//   </div>
//   `;
//   document.body.appendChild(loginForm);

//   loginForm.addEventListener("submit", function (event) {
//     event.preventDefault();
//     const username = document.getElementById("username").value;
//     const password = document.getElementById("password").value;

//     if (users[username] && users[username] === password) {
//       document.getElementById("loginForm").style.display = "none";
//       document.querySelector(".main-header").style.display = "block";

//       document.querySelector(".container").style.display = "block";
//       document.getElementById("instructionsButton").style.display = "block";
//       document.getElementById("toggle-button").style.display = "block";
//       document.getElementById("clearFormButton").style.display = "block";
//     }
//     else if(admins[username] && admins[username] === password) {
//       document.getElementById("loginForm").style.display = "none";
//       document.querySelector(".admin-container").style.display = "block";

//     }
//     else {
//       document.getElementById("loginError").style.display = "block";

//     }
//   });

//   // Initially hide the main content until login is successful
//   document.querySelector(".main-header").style.display = "none";

//   document.querySelector(".container").style.display = "block";
//   document.getElementById("instructionsButton").style.display = "none";
//   document.getElementById("toggle-button").style.display = "none";
//   document.getElementById("clearFormButton").style.display = "none";

// });

function clearForm() {
  document.getElementById("dataForm").reset();
  const container = document.getElementById("itemsContainer");
  container.innerHTML = ""; // Clear items
  const totalSumDisplay = document.getElementById("totalSumDisplay");
  if (totalSumDisplay) {
    totalSumDisplay.remove(); // Remove total sum display if exists
  }
}

document.getElementById("clearFormButton").addEventListener("click", clearForm);

function logout() {
  window.location.href = "index.html";
}
document.getElementById("logoutButton").addEventListener("click", logout);

// Function to calculate the total sum of all items
function calculateTotalSum() {
  const sumInputs = document.querySelectorAll(".sumInput");
  let totalSum = 0;
  sumInputs.forEach((input) => {
    totalSum += parseFloat(input.value) || 0;
  });
  return totalSum.toFixed(2);
}

// Function to update the displayed total sum
function updateTotalSum() {
  const totalSum = calculateTotalSum();
  let totalSumDisplay = document.getElementById("totalSumDisplay");

  if (!totalSumDisplay) {
    totalSumDisplay = document.createElement("div");
    totalSumDisplay.id = "totalSumDisplay";
    totalSumDisplay.style.fontWeight = "bold";
    totalSumDisplay.style.marginTop = "20px";
    document.querySelector(".container").appendChild(totalSumDisplay);
  }

  totalSumDisplay.textContent = `Total Sum: ₹${totalSum}`;
}
