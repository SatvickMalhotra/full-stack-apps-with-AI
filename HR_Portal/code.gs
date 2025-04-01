function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function processForm(empCode, empName, firstName, middleName, lastName, fatherName, gender, dob, doj, email, mobile, department, designation, role, location, reportingManager, pfApplicable, esicApplicable, esicAccount, bankName, bankAcctNo, ifscCode, presentAddress, presentCity, presentPin, permanentAddress, permanentCity, permanentPin, maritalStatus, personalEmail, bloodGroup, currentExperience, nationality, physicalStatus, adharBase64, adharName, panBase64, panName, pictureBase64, pictureName, passbookBase64, passbookName) {
  try {
    // Open Google Sheet using the provided Sheet ID
    var sheet = SpreadsheetApp.openById("google sheet id here will be in link of the sheet").getActiveSheet();
    
    // Append employee details to the sheet (adjust column order as needed)
    sheet.appendRow([
      empCode, empName, firstName, middleName, lastName, fatherName, gender, dob, doj, email, mobile,
      department, designation, role, location, reportingManager, pfApplicable, esicApplicable, esicAccount,
      bankName, bankAcctNo, ifscCode, presentAddress, presentCity, presentPin, permanentAddress, permanentCity, permanentPin,
      maritalStatus, personalEmail, bloodGroup, currentExperience, nationality, physicalStatus, new Date()
    ]);
    
    // Get the parent folder using the provided Drive Folder ID
    var parentFolder = DriveApp.getFolderById("drive folder id where this needs to be uploaded ");
    
    // Create a new folder for the employee (folder name includes Employee Name)
    var userFolder = parentFolder.createFolder(empName + "_" + empCode + "_Docs");

    // Helper function to save file from Base64 string
    function saveFile(base64, fileName, mimeType) {
      if (base64 && fileName) {
        var blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, fileName);
        return userFolder.createFile(blob);
      }
    }
    
    // Save files
    saveFile(adharBase64, adharName, MimeType.PDF);
    saveFile(panBase64, panName, MimeType.PDF);
    saveFile(pictureBase64, pictureName, MimeType.PNG);
    saveFile(passbookBase64, passbookName, MimeType.PDF); // Saving Passbook/Cancelled Cheque file

    return "Data and files saved successfully!";
  } catch (error) {
    return "Error: " + error.toString();
  }
}
