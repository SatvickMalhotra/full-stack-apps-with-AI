// Function to serve the HTML page
function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// Helper function to get MimeType
function getMimeTypeFromFilename(filename) {
  if (!filename) return null;
  var extension = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
  switch (extension) {
    case 'pdf': return MimeType.PDF;
    case 'png': return MimeType.PNG;
    case 'jpg':
    case 'jpeg': return MimeType.JPEG;
    case 'gif': return MimeType.GIF;
    default: return MimeType.OCTET_STREAM; // A generic fallback
  }
}

// --- MODIFIED: Function signature updated with all new fields ---
function processForm(
    // Basic Details
    empCode, empName, firstName, middleName, lastName, fatherName, gender, dob, doj,
    adharNo, panNo, languagesKnown, // <-- New Basic fields
    // Contact & Work
    email, mobile, department, designation, role, location, reportingManager,
    // Bank Details
    bankName, bankAcctNo, ifscCode,
    // Address Details
    presentAddress, presentCity, presentPin, permanentAddress, permanentCity, permanentPin,
    // Personal Details
    maritalStatus, bloodGroup, totalWorkExperience, nationality, physicalStatus,
    // NEW: Employment Details
    empIdNumber, empDepartment, empDesignation, shiftTimings, jobType, prevWorkExperience,
    // NEW: Qualification & Certification
    qualification, medRegCertNo, medCouncilBoard,
    // --- File data ---
    adharBase64, adharName, panBase64, panName, pictureBase64, pictureName, passbookBase64, passbookName,
    qualCertBase64, qualCertName, // <-- New file
    regCertBase64, regCertName,
    sigCopyBase64, sigCopyName, // <-- New file
    disabilityCertBase64, disabilityCertName, // <-- New conditional file
    otherDocsBase64, otherDocsNames
  ) {
  try {
    var spreadsheet = SpreadsheetApp.openById(""); // Your Spreadsheet ID
    var sheetName = "Registrations";
    var sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      sheet = spreadsheet.insertSheet(sheetName);
      // --- MODIFIED: Headers updated to include all new columns ---
      sheet.appendRow([
        "Timestamp", "Employee Code", "Doctor Name", "First Name", "Middle Name", "Last Name", "Father's Name",
        "Gender", "DOB", "DOJ", "Aadhar Number", "PAN Number", "Languages Known", "Email", "Mobile", "Department",
        "Designation", "Role", "Location", "Reporting Manager", "Bank Name", "Bank Acct No", "IFSC Code",
        "Present Address", "Present City", "Present PIN", "Permanent Address", "Permanent City", "Permanent PIN",
        "Marital Status", "Blood Group", "Total Work Experience", "Nationality", "Physical Status",
        "Employment ID Number", "Employment Department", "Employment Designation", "Shift Timings", "Job Type", "Previous Work Exp",
        "Qualification", "Perm. Medical Reg Cert No", "Medical Council Board Name"
      ]);
    }
    
    // --- MODIFIED: Row data updated to match the new headers and form structure ---
    sheet.appendRow([
      new Date(), empCode, empName, firstName, middleName, lastName, fatherName,
      gender, dob, doj, adharNo, panNo, languagesKnown, email, mobile, department,
      designation, role, location, reportingManager, bankName, bankAcctNo, ifscCode,
      presentAddress, presentCity, presentPin, permanentAddress, permanentCity, permanentPin,
      maritalStatus, bloodGroup, totalWorkExperience, nationality, physicalStatus,
      empIdNumber, empDepartment, empDesignation, shiftTimings, jobType, prevWorkExperience,
      qualification, medRegCertNo, medCouncilBoard
    ]);

    var parentFolder = DriveApp.getFolderById(""); // Your Parent Folder ID
    var userFolder = parentFolder.createFolder(empName + "_" + empCode + "_Docs");

    function saveFile(base64, fileName) {
      if (base64 && fileName) {
        try {
          var mimeType = getMimeTypeFromFilename(fileName);
          var blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, fileName);
          userFolder.createFile(blob);
        } catch (e) {
           Logger.log("Error creating file '" + fileName + "': " + e);
           // Don't throw error to allow form to succeed even if one file fails
        }
      }
    }

    // Save all files
    saveFile(adharBase64, adharName);
    saveFile(panBase64, panName);
    saveFile(pictureBase64, pictureName);
    saveFile(passbookBase64, passbookName);
    saveFile(qualCertBase64, qualCertName);          
    saveFile(regCertBase64, regCertName);
    saveFile(sigCopyBase64, sigCopyName);            
    saveFile(disabilityCertBase64, disabilityCertName); 

    if (otherDocsBase64 && otherDocsNames && otherDocsBase64.length > 0) {
      for (var i = 0; i < otherDocsBase64.length; i++) {
        saveFile(otherDocsBase64[i], otherDocsNames[i]);
      }
    }

    return "Doctor data and files saved successfully!";

  } catch (error) {
    Logger.log("Error in processForm: " + error.toString() + "\nStack: " + error.stack);
    return "Error: " + error.toString();
  }
}
