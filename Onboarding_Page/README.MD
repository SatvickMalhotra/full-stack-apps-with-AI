# M-Swasth Doctor Registration Form - Google Apps Script

This project is a comprehensive, self-hosted web application for registering new doctors. Built entirely on Google Apps Script, it provides a user-friendly web form that captures detailed information and documents, then automatically organizes them into a Google Sheet and a structured Google Drive folder.

## Key Features

-   **Dynamic Web Form:** A modern, responsive HTML form styled with CSS for a clean user experience, including a dynamic particle background.
-   **Comprehensive Data Collection:** Gathers information across multiple categories:
    -   Basic & Personal Details (Name, DOB, Aadhar, PAN, etc.)
    -   Contact & Address Information
    -   Bank Details for payroll
    -   Employment Details (ID, Department, Job Type - all optional)
    -   Medical Qualifications & Certifications
-   **Conditional Logic:** The "Physical Status" field is a dropdown. Selecting "Person with Disability (PwD)" dynamically reveals a mandatory file upload field for the disability certificate.
-   **Secure File Uploads:** Supports uploading multiple required documents, including:
    -   Aadhaar Card, PAN Card, Photo, Bank Passbook
    -   Qualification Certificate
    -   Medical Registration Certificate
    -   Signature Copy
    -   Optional "Other Documents" (allows multiple files)
-   **Automated Data Storage:** All submitted form data is instantly appended as a new row to a designated Google Sheet. The script automatically creates the sheet and headers if they don't exist.
-   **Automated Document Management:** For each submission, a new folder is created in a parent Google Drive folder. The folder is uniquely named (`Doctor Name_Employee Code_Docs`), and all uploaded documents are saved inside it.
-   **Real-time User Feedback:** Provides "loading" indicators during submission and displays success or error messages as alerts.

## Technology Stack

-   **Backend:** Google Apps Script (`SpreadsheetApp`, `DriveApp`)
-   **Frontend:**
    -   HTML5
    -   CSS3 (Flexbox, animations, gradients)
    -   JavaScript (ES6 `async/await`, `FileReader` API for file handling)
-   **Libraries:** `particles.js` for the animated background.

## Setup and Deployment

Follow these steps to deploy your own instance of this registration form.

1.  **Create a Google Sheet:**
    -   Create a new, blank Google Sheet.
    -   Copy its **ID** from the URL. The ID is the long string of characters between `/d/` and `/edit`.
    -   Example: `https://docs.google.com/spreadsheets/d/THIS_IS_THE_ID/edit`

2.  **Create a Google Drive Folder:**
    -   Create a new folder in Google Drive where you want all doctor documents to be stored.
    -   Copy its **ID** from the URL. The ID is the string of characters after `folders/`.
    -   Example: `https://drive.google.com/drive/folders/THIS_IS_THE_ID`

3.  **Create an Apps Script Project:**
    -   Go to [script.google.com](https://script.google.com) and create a new project.

4.  **Add the Code:**
    -   Rename the default `Code.gs` file. Paste the entire contents of the `code.gs` file from this repository into it.
    -   Create a new HTML file (`File > New > HTML file`) and name it `Index` (case-sensitive). Paste the entire contents of the `index.html` file into it.

5.  **Update the IDs in `code.gs`:**
    -   In the `code.gs` file, find the following lines and replace the placeholder IDs with the actual IDs you copied in steps 1 and 2.

      ```javascript
      // Line 25
      var spreadsheet = SpreadsheetApp.openById("YOUR_SPREADSHEET_ID_HERE");

      // Line 51
      var parentFolder = DriveApp.getFolderById("YOUR_DRIVE_FOLDER_ID_HERE");
      ```

6.  **Deploy the Web App:**
    -   Click **Deploy > New deployment**.
    -   Click the gear icon next to "Select type" and choose **Web app**.
    -   In the "Configuration" settings:
        -   **Description:** `Doctor Registration Form`
        -   **Execute as:** `Me`
        -   **Who has access:** `Anyone` (This makes the form public. Choose `Anyone with Google Account` if you want to restrict it to signed-in users).
    -   Click **Deploy**.

7.  **Authorize Permissions:**
    -   Google will ask you to authorize the script's access to your Google Sheets and Drive.
    -   Click **Authorize access**.
    -   Choose your Google account.
    -   You may see a "Google hasn't verified this app" screen. Click **Advanced**, then click **Go to [Your Project Name] (unsafe)**.
    -   Click **Allow** on the final screen.

8.  **Get Your URL:**
    -   After a successful deployment, a URL will be provided. This is the link to your live registration form.

## Code Flow

1.  **Frontend (`Index.html`):** A user fills out the form and clicks "Submit".
2.  **JavaScript (`handleSubmit`):** The `handleSubmit` function is triggered. It prevents the default submission, shows a loading indicator, reads all files as Base64 strings, and gathers all form field values.
3.  **Bridge (`google.script.run`):** The collected data is sent securely to the backend `processForm` function.
4.  **Backend (`code.gs`):** The `processForm` function receives the data.
    -   It appends the textual data to the specified Google Sheet.
    -   It creates a new folder in Google Drive.
    -   It decodes the Base64 strings back into files and saves them in the new Drive folder.
5.  **Response:** The backend returns a success or error message, which is displayed as an alert to the user on the frontend.
