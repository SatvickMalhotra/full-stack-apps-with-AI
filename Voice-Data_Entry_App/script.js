// --- Global Variables & Constants ---
window.SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition; // OK
let recognition; // OK
let currentTargetInput = null; // OK
let collectedData = []; // OK
let partnerConfig = {}; // OK
const LS_DATA_KEY = "customerEntriesData_v5"; // Incremented version
const LS_PARTNER_KEY = "customerPartnerConfig_v3"; // OK
const LS_THEME_KEY = "customerAppTheme"; // OK
const LS_UI_LANG_KEY = "customerAppUiLang_v2"; // OK
let genderChartInstance, branchChartInstance, partnerChartInstance; // OK
let currentChartSlide = 0; // OK
let uploadedImages = []; // OK
let currentImageIndex = 0; // OK
const MAX_IMAGE_UPLOADS = 50; // OK

// --- IMPORTANT: Customize these arrays to match YOUR form fields ---
// Field Keys (Ensure these match the 'id' attributes of your form elements)
// MODIFICATION: Added Nominee Fields
const customerFieldKeys = [
  "branchName",
  "customerName",
  "customerID",
  "gender",
  "mobileNumber",
  "enrolmentDate",
  "dob",
  "savingsAccountNumber",
  "csbCode",
  "entryType",
  "partnerId",
  // Nominee Fields
  "nomineeName",
  "nomineeDob",
  "nomineeMobileNumber",
  "nomineeGender",
];
// Fields that are text-based inputs (used for clean button logic etc.)
// MODIFICATION: Added nominee text/tel fields
const textInputIds = customerFieldKeys.filter(
  (k) =>
    k !== "gender" &&
    k !== "entryType" &&
    k !== "partnerId" &&
    k !== "nomineeGender" && // Exclude nominee gender
    k !== "enrolmentDate" && // Exclude date fields
    k !== "dob" &&
    k !== "nomineeDob"
);
// Fields that are NOT mandatory
// MODIFICATION: Added nominee fields as optional
const optionalFields = [
  "dob",
  "savingsAccountNumber",
  "enrolmentDate", // Make sure enrolmentDate is optional if not required
  "nomineeName",
  "nomineeDob",
  "nomineeMobileNumber",
  "nomineeGender",
]; // Adjust as needed
// Fields used to detect potential duplicates
const duplicateCheckFields = ["customerName", "mobileNumber", "dob"]; // Adjust as needed (nominee fields usually not used for main duplicates)
// --- End Customization ---

// Derived constants
const requiredFields = customerFieldKeys.filter(
  (f) => !optionalFields.includes(f)
); // OK
const criticalFieldsForBlanks = [...requiredFields]; // Fields highlighted if blank in table // OK

// Admin Credentials (Replace with secure method in production)
const ADMIN_USERNAME = "satvick"; // OK
const ADMIN_PASSWORD = "satvickisbest"; // OK - As requested, keep hardcoded for local use

// --- i18n Translations (Ensure all keys like 'tblCol...' exist) ---
const translations = {
  en: {
    // Toasts
    toastSpeechUnsupp: "Speech recognition not supported by this browser.",
    toastPartnerLoadErr: "Error loading partner configuration.",
    toastPartnerSaveErr: "Error saving partner configuration.",
    toastCustSaveErr: "Error saving customer data.",
    toastLoadErr: "Error loading previous data. Starting fresh.",
    toastDataCleared: "All customer data cleared.",
    toastHeard: "Heard:",
    toastMicDenied:
      "Microphone access denied. Please allow microphone access in browser settings.",
    toastNoSpeech: "No speech detected. Please try again.",
    toastAudioErr: "Audio capture error. Check microphone connection.",
    toastSpeechErr: "Speech recognition error:",
    toastListening: "Listening...",
    toastGenericErr: "An unexpected error occurred.",
    toastInputCleaned: "Input cleaned.",
    toastImageUploadLimit: "Cannot upload more than {limit} images.",
    toastImageUploadSuccess: "Images uploaded. Total: {count}",
    toastImageUploadErr: "Error uploading image: {name}",
    toastNoImages: "No images uploaded yet.",
    toastReqFieldsWarning: "Please fill all required fields: {fields}",
    toastEntryUpdated: "Entry for {name} updated.",
    toastEntryAdded: "Entry for {name} added.",
    toastEditing: "Editing entry for {name}.",
    DeleteEntry: "Are you sure you want to delete the entry for", // Used in confirm()
    toastEntryDeleted: "Entry for {name} deleted.",
    toastExcelSuccess: "Data saved to Excel and local storage cleared.",
    toastExcelErr: "Error exporting to Excel. Ensure XLSX library is loaded.",
    toastCsvSuccess: "Data saved to CSV.",
    toastCsvErr: "Error exporting to CSV.",
    toastPdfSuccess: "Data saved to PDF.",
    toastPdfErr:
      "Error exporting to PDF. Ensure jsPDF & autoTable libraries are loaded.",
    toastDashErr:
      "Error generating dashboard. Ensure Chart.js library is loaded.",
    toastFullscreenErr: "Fullscreen request failed: {message}",
    toastLoginSuccess: "Admin login successful.",
    toastLoginFail: "Invalid username or password.",
    toastAdminSaveValidation:
      "Partner name cannot be empty and amount must be a non-negative number.",
    toastAdminSaveSuccess: "Partner configuration saved successfully.",
    toastAdminSaveNoChange: "No changes detected in partner configuration.",
    toastLibNotLoaded: "{libraryName} library not loaded. Feature disabled.",
    // Buttons & Labels
    btnThemeLight: "Light",
    btnThemeDark: "Dark",
    btnEnterDataEntryMode: "Enter Data Entry Mode",
    lblEnterDataEntryMode: "Focus Mode",
    btnExitDataEntryMode: "Exit Data Entry Mode",
    lblExitDataEntryMode: "View All",
    optSelectPartnerTypeFirst: "Select Entry Type First",
    optSelectPartner: "-- Select Partner --",
    btnAddEntry: "Add Entry",
    btnUpdateEntry: "Update Entry",
    btnClearForm: "Clear Form",
    btnSaveExcel: "Save & Clear (Excel)",
    btnSaveCsv: "Save as CSV",
    btnSavePdf: "Save as PDF",
    btnDashboard: "Dashboard",
    btnClose: "Close",
    btnAdminLogin: "Admin Login",
    btnAdminSaveChanges: "Save Changes",
    btnFullscreen: "Fullscreen",
    btnExitFullscreen: "Exit Fullscreen",
    btnPrev: "Previous",
    btnNext: "Next",
    btnUploadImage: "Upload Images",
    btnToggleImageViewer: "View Images",
    // Form Fields (Main)
    lblBranchName: "Branch Name:",
    lblCustomerName: "Customer Name:",
    lblCustomerID: "Customer ID:",
    lblGender: "Gender:",
    optGenderMale: "Male",
    optGenderFemale: "Female",
    optGenderOther: "Other",
    optGenderUnknown: "Unknown",
    lblMobileNumber: "Mobile Number:",
    lblEnrolmentDate: "Enrolment Date:",
    lblDob: "Date of Birth:",
    lblSavingsAccNum: "Savings A/C No.:",
    lblCsbCode: "CSB Code:",
    lblEntryType: "Entry Type:",
    optEntryTypeTele_health: "Tele Health 365",
    optEntryTypeCombo: "Combo",
    lblPartner: "Partner:",
    // Form Fields (Nominee) - MODIFICATION: Added
    nomineeSectionTitle: "Nominee Details",
    lblNomineeName: "Nominee Name:",
    phNomineeName: "Enter Nominee Name",
    lblNomineeDob: "Nominee Date of Birth:",
    lblNomineeMobile: "Nominee Mobile Number:",
    phNomineeMobile: "Enter 10-digit mobile number",
    lblNomineeGender: "Nominee Gender:",
    // Table Headers (CRITICAL: Must match renderTable/getExportData order)
    tblColBranch: "Branch",
    tblColName: "Customer Name",
    tblColCustID: "Customer ID",
    tblColGender: "Gender",
    tblColMobile: "Mobile",
    tblColEnrolDate: "Enrol. Date",
    tblColDOB: "DOB",
    tblColSavingsAcc: "Savings A/C",
    tblColCSB: "CSB Code",
    tblColPartner: "Partner",
    tblColSubscrAmt: "Subscr. Amt.",
    // Nominee Columns for Export - MODIFICATION: Added
    tblColNomName: "Nominee Name",
    tblColNomDOB: "Nominee DOB",
    tblColNomMobile: "Nominee Mobile",
    tblColNomGender: "Nominee Gender",
    // End Nominee Columns
    tblColActions: "Actions", // Actions column likely last in display table
    tblNoEntries: "No customer entries yet.",
    // Other UI
    mainHeading: "Mswasth Entry Portal", // MODIFICATION: Updated Heading
    tblHeading: "Table", // MODIFICATION: Updated Table Heading
    lblLanguage: "Language:",
    lblTheme: "Theme:",
    lblAdminLoginTitle: "Admin Login",
    lblUsername: "Username:",
    lblPassword: "Password:",
    lblAdminEditTitle: "Edit Partner Configuration",
    lblImageUpload: "Image Upload:",
    lblImageCount: "Uploaded Images:",
    ImageViewerTitle: "Image Viewer",
    ImageViewerStatus: "Image {current} of {total}",
    DashboardTitle: "Data Dashboard",
    // Dashboard Stats Placeholders
    dashTotalEntries: "Total Entries",
    dashFemaleRatio: "Female Ratio",
    dashBlankEntries: "Entries w/ Blanks",
    // Dashboard Chart Titles
    DashboardGenderTitle: "Gender Distribution",
    DashboardBranchTitle: "Top 5 Branches by Entries",
    DashboardPartnerTitle: "Entries per Partner",
    // Placeholders (Main)
    phBranchName: "Enter branch name",
    phCustomerName: "Enter customer name",
    phCustomerID: "Enter customer ID",
    phMobileNumber: "Enter 10-digit mobile number",
    phSavingsAccNum: "Enter savings account number",
    phCsbCode: "Enter CSB code",
    phAdminUsername: "Enter admin username",
    phAdminPassword: "Enter admin password",
    // Titles (Tooltips)
    titleMicButton: "Record {fieldName}",
    titleCleanButton: "Clean {fieldName} Input",
    titleEditButton: "Edit Entry",
    titleDeleteButton: "Delete Entry",
    titleAdminPartnerName: "Partner Name",
    titleAdminPartnerAmount: "Subscription Amount (INR)",
    titleSaveAdminChanges: "Save All Partner Changes",
    titleCloseModal: "Close",
    titleSpeechLangSelect: "Select Speech Language",
  },
  hi: {
    // Toasts (Keep existing, translate new ones if needed)
    toastSpeechUnsupp: "यह ब्राउज़र स्पीच रिकग्निशन का समर्थन नहीं करता है।",
    toastPartnerLoadErr: "पार्टनर कॉन्फ़िगरेशन लोड करने में त्रुटि।",
    toastPartnerSaveErr: "पार्टनर कॉन्फ़िगरेशन सहेजने में त्रुटि।",
    toastCustSaveErr: "ग्राहक डेटा सहेजने में त्रुटि।",
    toastLoadErr: "पिछला डेटा लोड करने में त्रुटि। नए सिरे से शुरू कर रहे हैं।",
    toastDataCleared: "सभी ग्राहक डेटा साफ़ कर दिए गए हैं।",
    toastHeard: "सुना गया:",
    toastMicDenied:
      "माइक्रोफ़ोन एक्सेस अस्वीकृत। कृपया ब्राउज़र सेटिंग्स में माइक्रोफ़ोन एक्सेस की अनुमति दें।",
    toastNoSpeech: "कोई आवाज़ नहीं मिली। कृपया पुनः प्रयास करें।",
    toastAudioErr: "ऑडियो कैप्चर त्रुटि। माइक्रोफ़ोन कनेक्शन जांचें।",
    toastSpeechErr: "स्पीच रिकग्निशन त्रुटि:",
    toastListening: "सुन रहा हूँ...",
    toastGenericErr: "एक अप्रत्याशित त्रुटि हुई।",
    toastInputCleaned: "इनपुट साफ़ किया गया।",
    toastImageUploadLimit: "{limit} से अधिक चित्र अपलोड नहीं कर सकते।",
    toastImageUploadSuccess: "चित्र अपलोड किए गए। कुल: {count}",
    toastImageUploadErr: "चित्र अपलोड करने में त्रुटि: {name}",
    toastNoImages: "अभी तक कोई चित्र अपलोड नहीं किया गया है।",
    toastReqFieldsWarning: "कृपया सभी आवश्यक फ़ील्ड भरें: {fields}",
    toastEntryUpdated: "{name} के लिए प्रविष्टि अपडेट की गई।",
    toastEntryAdded: "{name} के लिए प्रविष्टि जोड़ी गई।",
    toastEditing: "{name} के लिए प्रविष्टि संपादित कर रहे हैं।",
    DeleteEntry: "क्या आप वाकई {name} के लिए प्रविष्टि हटाना चाहते हैं?",
    toastEntryDeleted: "{name} के लिए प्रविष्टि हटा दी गई।",
    toastExcelSuccess:
      "डेटा एक्सेल में सहेजा गया और स्थानीय संग्रहण साफ़ किया गया।",
    toastExcelErr:
      "एक्सेल में निर्यात करने में त्रुटि। सुनिश्चित करें कि XLSX लाइब्रेरी लोड हो गई है।",
    toastCsvSuccess: "डेटा CSV में सहेजा गया।",
    toastCsvErr: "CSV में निर्यात करने में त्रुटि।",
    toastPdfSuccess: "डेटा PDF में सहेजा गया।",
    toastPdfErr:
      "PDF में निर्यात करने में त्रुटि। सुनिश्चित करें कि jsPDF और autoTable लाइब्रेरी लोड हो गई हैं।",
    toastDashErr:
      "डैशबोर्ड बनाने में त्रुटि। सुनिश्चित करें कि Chart.js लाइब्रेरी लोड हो गई है।",
    toastFullscreenErr: "फ़ुलस्क्रीन अनुरोध विफल: {message}",
    toastLoginSuccess: "एडमिन लॉगिन सफल।",
    toastLoginFail: "अमान्य उपयोगकर्ता नाम या पासवर्ड।",
    toastAdminSaveValidation:
      "पार्टनर का नाम खाली नहीं हो सकता और राशि गैर-नकारात्मक संख्या होनी चाहिए।",
    toastAdminSaveSuccess: "पार्टनर कॉन्फ़िगरेशन सफलतापूर्वक सहेजा गया।",
    toastAdminSaveNoChange: "पार्टनर कॉन्फ़िगरेशन में कोई बदलाव नहीं पाया गया।",
    toastLibNotLoaded:
      "{libraryName} लाइब्रेरी लोड नहीं हुई है। सुविधा अक्षम है।",
    // Buttons & Labels
    btnThemeLight: "लाइट",
    btnThemeDark: "डार्क",
    btnEnterDataEntryMode: "डेटा एंट्री मोड दर्ज करें",
    lblEnterDataEntryMode: "फोकस मोड",
    btnExitDataEntryMode: "डेटा एंट्री मोड से बाहर निकलें",
    lblExitDataEntryMode: "सभी देखें",
    optSelectPartnerTypeFirst: "पहले एंट्री प्रकार चुनें",
    optSelectPartner: "-- पार्टनर चुनें --",
    btnAddEntry: "प्रविष्टि जोड़ें",
    btnUpdateEntry: "प्रविष्टि अपडेट करें",
    btnClearForm: "फ़ॉर्म साफ़ करें",
    btnSaveExcel: "सहेजें और साफ़ करें (एक्सेल)",
    btnSaveCsv: "CSV के रूप में सहेजें",
    btnSavePdf: "PDF के रूप में सहेजें",
    btnDashboard: "डैशबोर्ड",
    btnClose: "बंद करें",
    btnAdminLogin: "एडमिन लॉगिन",
    btnAdminSaveChanges: "बदलाव सहेजें",
    btnFullscreen: "फ़ुलस्क्रीन",
    btnExitFullscreen: "फ़ुलस्क्रीन से बाहर निकलें",
    btnPrev: "पिछला",
    btnNext: "अगला",
    btnUploadImage: "चित्र अपलोड करें",
    btnToggleImageViewer: "चित्र देखें",
    // Form Fields (Main)
    lblBranchName: "शाखा का नाम:",
    lblCustomerName: "ग्राहक का नाम:",
    lblCustomerID: "ग्राहक आईडी:",
    lblGender: "लिंग:",
    optGenderMale: "पुरुष",
    optGenderFemale: "महिला",
    optGenderOther: "अन्य",
    optGenderUnknown: "अज्ञात",
    lblMobileNumber: "मोबाइल नंबर:",
    lblEnrolmentDate: "नामांकन तिथि:",
    lblDob: "जन्म तिथि:",
    lblSavingsAccNum: "बचत खाता संख्या:",
    lblCsbCode: "सीएसबी कोड:",
    lblEntryType: "प्रविष्टि प्रकार:",
    optEntryTypeTele_health: "टेली हेल्थ 365",
    optEntryTypeCombo: "कॉम्बो",
    lblPartner: "पार्टनर:",
    // Form Fields (Nominee) - MODIFICATION: Added
    nomineeSectionTitle: "नामित व्यक्ति का विवरण",
    lblNomineeName: "नामित व्यक्ति का नाम:",
    phNomineeName: "नामित व्यक्ति का नाम दर्ज करें",
    lblNomineeDob: "नामित व्यक्ति की जन्म तिथि:",
    lblNomineeMobile: "नामित व्यक्ति का मोबाइल नंबर:",
    phNomineeMobile: "10 अंकों का मोबाइल नंबर दर्ज करें",
    lblNomineeGender: "नामित व्यक्ति का लिंग:",
    // Table Headers (CRITICAL)
    tblColBranch: "शाखा",
    tblColName: "ग्राहक का नाम",
    tblColCustID: "ग्राहक आईडी",
    tblColGender: "लिंग",
    tblColMobile: "मोबाइल",
    tblColEnrolDate: "नामांकन तिथि",
    tblColDOB: "जन्म तिथि",
    tblColSavingsAcc: "बचत खाता",
    tblColCSB: "सीएसबी कोड",
    tblColPartner: "पार्टनर",
    tblColSubscrAmt: "सदस्यता राशि",
    // Nominee Columns for Export - MODIFICATION: Added
    tblColNomName: "नामित व्यक्ति का नाम",
    tblColNomDOB: "नामित व्यक्ति की जन्मतिथि",
    tblColNomMobile: "नामित व्यक्ति का मोबाइल",
    tblColNomGender: "नामित व्यक्ति का लिंग",
    // End Nominee Columns
    tblColActions: "कार्रवाइयाँ",
    tblNoEntries: "अभी तक कोई ग्राहक प्रविष्टि नहीं है।",
    // Other UI
    mainHeading: "एमस्वस्थ एंट्री पोर्टल", // MODIFICATION: Updated Heading
    tblHeading: "तालिका", // MODIFICATION: Updated Table Heading
    lblLanguage: "भाषा:",
    lblTheme: "थीम:",
    lblAdminLoginTitle: "एडमिन लॉगिन",
    lblUsername: "उपयोगकर्ता नाम:",
    lblPassword: "पासवर्ड:",
    lblAdminEditTitle: "पार्टनर कॉन्फ़िगरेशन संपादित करें",
    lblImageUpload: "छवि अपलोड:",
    lblImageCount: "अपलोड की गई छवियाँ:",
    ImageViewerTitle: "छवि दर्शक",
    ImageViewerStatus: "छवि {current} / {total}",
    DashboardTitle: "डेटा डैशबोर्ड",
    // Dashboard Stats Placeholders
    dashTotalEntries: "कुल प्रविष्टियाँ",
    dashFemaleRatio: "महिला अनुपात",
    dashBlankEntries: "रिक्तियों वाली प्रविष्टियाँ",
    // Dashboard Chart Titles
    DashboardGenderTitle: "लिंग वितरण",
    DashboardBranchTitle: "शीर्ष 5 शाखाएँ (प्रविष्टियों के आधार पर)",
    DashboardPartnerTitle: "प्रति पार्टनर प्रविष्टियाँ",
    // Placeholders (Main)
    phBranchName: "शाखा का नाम दर्ज करें",
    phCustomerName: "ग्राहक का नाम दर्ज करें",
    phCustomerID: "ग्राहक आईडी दर्ज करें",
    phMobileNumber: "10 अंकों का मोबाइल नंबर दर्ज करें",
    phSavingsAccNum: "बचत खाता संख्या दर्ज करें",
    phCsbCode: "सीएसबी कोड दर्ज करें",
    phAdminUsername: "एडमिन उपयोगकर्ता नाम दर्ज करें",
    phAdminPassword: "एडमिन पासवर्ड दर्ज करें",
    // Titles (Tooltips)
    titleMicButton: "{fieldName} रिकॉर्ड करें",
    titleCleanButton: "{fieldName} इनपुट साफ़ करें",
    titleEditButton: "प्रविष्टि संपादित करें",
    titleDeleteButton: "प्रविष्टि हटाएं",
    titleAdminPartnerName: "पार्टनर का नाम",
    titleAdminPartnerAmount: "सदस्यता राशि (INR)",
    titleSaveAdminChanges: "सभी पार्टनर परिवर्तन सहेजें",
    titleCloseModal: "बंद करें",
    titleSpeechLangSelect: "बोलने की भाषा चुनें",
  },
};
let currentLang = "en"; // OK

// --- DOM Element Selectors (Cached for performance) ---
let domElements = {};
function cacheDomElements() {
  domElements = {
    form: document.getElementById("customerForm"),
    tableBody: document.getElementById("dataTableBody"),
    entryTypeSelect: document.getElementById("entryType"),
    partnerSelect: document.getElementById("partnerId"),
    editingIdInput: document.getElementById("editingId"),
    addEntryButton: document.getElementById("addEntryButton"),
    clearFormButton: document.getElementById("clearFormButton"),
    saveExcelButton: document.getElementById("saveExcelButton"),
    saveCsvButton: document.getElementById("saveCsvButton"),
    savePdfButton: document.getElementById("savePdfButton"),
    languageSwitcher: document.getElementById("languageSwitcher"),
    themeToggleButton: document.getElementById("themeToggleButton"),
    languageSelect: document.getElementById("speechLangSelect"),
    loadingIndicator: document.getElementById("loadingIndicator"),
    dashboardButton: document.getElementById("dashboardButton"),
    dashboardModal: document.getElementById("dashboardModal"),
    closeDashboardButton: document.getElementById("closeDashboardButton"),
    dashboardCarouselSlides: document.getElementById("dashboardCarouselSlides"),
    prevChartButton: document.getElementById("prevChartButton"),
    nextChartButton: document.getElementById("nextChartButton"),
    adminButton: document.getElementById("adminButton"),
    adminLoginModal: document.getElementById("adminLoginModal"),
    closeAdminLoginButton: document.getElementById("closeAdminLoginButton"),
    adminLoginForm: document.getElementById("adminLoginForm"),
    adminUsernameInput: document.getElementById("adminUsername"),
    adminPasswordInput: document.getElementById("adminPassword"),
    adminEditModal: document.getElementById("adminEditModal"),
    closeAdminEditButton: document.getElementById("closeAdminEditButton"),
    adminEditForm: document.getElementById("adminEditForm"),
    adminEditGrid: document.getElementById("adminEditGrid"),
    fullscreenButton: document.getElementById("fullscreenButton"),
    tableContainer: document.getElementById("tableContainer"),
    uploadImageButton: document.getElementById("uploadImageButton"),
    imageUploadInput: document.getElementById("imageUploadInput"),
    imageCountSpan: document.getElementById("imageCount"),
    toggleImageViewerButton: document.getElementById("toggleImageViewerButton"),
    imageViewerSection: document.getElementById("imageViewerSection"),
    currentImageView: document.getElementById("currentImageView"),
    imageViewerStatus: document.getElementById("imageViewerStatus"),
    prevImageButton: document.getElementById("prevImageButton"),
    nextImageButton: document.getElementById("nextImageButton"),
    toggleDataEntryModeButton: document.getElementById(
      "toggleDataEntryModeButton"
    ),
    dataTableHead: document.querySelector("#dataTable thead"), // Used for colspan/sorting
    // Nominee fields could be cached if used very frequently, but getElementById is fast enough for occasional use
    // nomineeNameInput: document.getElementById("nomineeName"),
    // nomineeDobInput: document.getElementById("nomineeDob"),
    // nomineeMobileInput: document.getElementById("nomineeMobileNumber"),
  };
  // Add checks for crucial elements
  if (!domElements.form)
    console.error("Form element with ID 'customerForm' not found!");
  if (!domElements.tableBody)
    console.error("Table body element with ID 'dataTableBody' not found!");
}

// --- Initialization ---
document.addEventListener("DOMContentLoaded", () => {
  cacheDomElements(); // Find all DOM elements first
  showLoader();
  initializeTheme();
  initializeLanguage(); // Translates UI, must run after caching DOM
  loadPartnerData();
  loadDataFromLocalStorage();
  populatePartnerDropdown(
    domElements.entryTypeSelect ? domElements.entryTypeSelect.value : ""
  );

  if (!window.SpeechRecognition) {
    showToast(translate("toastSpeechUnsupp"), "error", 5000);
    disableSpeechFunctionality();
  } else {
    initializeSpeechRecognition();
  }

  setupEventListeners(); // Add listeners after elements are cached
  updateDataEntryModeButton();
  applyRequiredAttributes(); // Apply required based on initial state
  renderTable();
  hideLoader();
});

// --- Apply Required Attributes ---
function applyRequiredAttributes() {
  if (!domElements.form) return;
  // Remove all existing required attributes first
  domElements.form
    .querySelectorAll("[required]")
    .forEach((el) => el.removeAttribute("required"));

  requiredFields.forEach((key) => {
    let element;
    if (key === "entryType") {
      element = domElements.entryTypeSelect;
    } else if (key === "partnerId") {
      element = domElements.partnerSelect;
      if (
        !element ||
        !domElements.entryTypeSelect ||
        !domElements.entryTypeSelect.value ||
        element.disabled
      ) {
        return; // Don't make partner required if no type selected or dropdown disabled
      }
    } else if (key === "gender" || key === "nomineeGender") {
      // Gender uses custom validation, not 'required' attribute
      return;
    } else {
      element = document.getElementById(key);
    }

    if (element) {
      element.setAttribute("required", "");
    } else {
      console.warn(
        `Required field element with ID '${key}' not found in the DOM.`
      );
    }
  });
}

// --- Internationalization (i18n) ---
function translate(key, replacements = {}) {
  const langTranslations = translations[currentLang] || translations.en;
  let translation = langTranslations[key];

  if (translation === undefined) {
    translation = translations.en[key];
  }
  if (translation === undefined) {
    // console.warn(`Translation key "${key}" not found in en or ${currentLang}.`);
    return key; // Return the key itself as fallback
  }

  for (const placeholder in replacements) {
    const regex = new RegExp(`\\{${placeholder}\\}`, "g");
    translation = translation.replace(regex, replacements[placeholder]);
  }
  return translation;
}

function setLanguage(lang) {
  if (!translations[lang]) {
    lang = "en";
  }
  currentLang = lang;
  document.documentElement.lang = lang;
  localStorage.setItem(LS_UI_LANG_KEY, lang);

  document.querySelectorAll("[data-translate-key]").forEach((element) => {
    const key = element.dataset.translateKey;
    let text = translate(key);

    // Placeholders
    if (
      element.placeholder !== undefined &&
      element.dataset.translatePlaceholderKey !== "false"
    ) {
      const placeholderKey =
        element.dataset.translatePlaceholderKey || `ph${key.substring(3)}`; // Simple convention ph<FieldName>
      element.placeholder = translate(placeholderKey, {}, key); // Pass original key as fallback
    }

    // Titles (Tooltips)
    if (
      element.title !== undefined &&
      element.dataset.translateTitleKey !== "false"
    ) {
      const titleKey = element.dataset.translateTitleKey || key;
      let titleReplacements = {};
      if (titleKey === "titleMicButton" || titleKey === "titleCleanButton") {
        const targetId = element.dataset.target;
        // Attempt to find the label more robustly
        const label = domElements.form?.querySelector(
          `label[for='${targetId}']`
        );
        let fieldName = targetId || "field";
        if (label) {
          // Clone to avoid modifying original, remove star/sr-only spans
          const labelClone = label.cloneNode(true);
          labelClone
            .querySelectorAll(".required-star, .sr-only")
            .forEach((s) => s.remove());
          fieldName = labelClone.textContent.replace(/[:*]/g, "").trim(); // Remove colon/star more carefully
        } else {
          // Fallback using the key itself if label not found
          const labelKey = `lbl${
            targetId.charAt(0).toUpperCase() + targetId.slice(1)
          }`;
          fieldName = translate(labelKey).replace(/[:*]/g, "").trim();
        }
        titleReplacements = { fieldName: fieldName || targetId }; // Ensure fieldName is not empty
      }
      element.title = translate(titleKey, titleReplacements);
    }

    // Text Content (handle carefully to avoid overwriting icons/nested spans)
    let targetElementForText = element;
    // Find a specific text span *unless* it's a special case like stat-card or gender-group label span
    const specificTextSpan = element.querySelector(
      "span:not(.sr-only):not(.sort-icon):not(.required-star)"
    );
    if (
      specificTextSpan &&
      !element.matches(".stat-card, .gender-group label, .control-button")
    ) {
      targetElementForText = specificTextSpan;
    }

    if (!["INPUT", "SELECT", "TEXTAREA", "IMG"].includes(element.tagName)) {
      if (element.tagName === "OPTION" && element.value === "") {
        // Set text for placeholder options
        element.textContent = text;
      } else if (
        targetElementForText === element &&
        element.children.length > 0 &&
        element.firstChild?.nodeType === Node.TEXT_NODE
      ) {
        // If element has children BUT the first child is text (like buttons with icon + text)
        element.firstChild.textContent = text + " "; // Add space for safety after text
      } else if (
        targetElementForText.childNodes.length === 1 &&
        targetElementForText.firstChild?.nodeType === Node.TEXT_NODE
      ) {
        // If the target (element or specific span) only contains text
        targetElementForText.textContent = text;
      } else if (targetElementForText !== element) {
        // If we found a specific span earlier, set its text
        targetElementForText.textContent = text;
      } else if (targetElementForText.childNodes.length === 0) {
        // If element has no children, set textContent directly
        targetElementForText.textContent = text;
      }
    }
  });

  // Re-apply theme/buttons/dropdowns etc. that might depend on language
  applyTheme(localStorage.getItem(LS_THEME_KEY) || "light-theme");
  updateFullscreenButtonText();
  updateDataEntryModeButton();
  if (domElements.languageSwitcher) domElements.languageSwitcher.value = lang;
  if (domElements.languageSelect) {
    // Set speech lang based on UI lang if available, else default
    let speechLang = lang === "hi" ? "hi-IN" : "en-US";
    if (
      Array.from(domElements.languageSelect.options).some(
        (opt) => opt.value === speechLang
      )
    ) {
      domElements.languageSelect.value = speechLang;
    } else {
      domElements.languageSelect.value = "en-US"; // Fallback
    }
  }
  populatePartnerDropdown(
    domElements.entryTypeSelect ? domElements.entryTypeSelect.value : ""
  );
  applyRequiredAttributes(); // Re-check required fields
  renderTable(); // Re-render table for translated headers/gender/no-entries text
}

function initializeLanguage() {
  const savedLang =
    localStorage.getItem(LS_UI_LANG_KEY) ||
    (navigator.language || "en").split("-")[0] ||
    "en";
  setLanguage(savedLang);
}

// --- Theme Management ---
function initializeTheme() {
  const theme = localStorage.getItem(LS_THEME_KEY) || "light-theme";
  applyTheme(theme);
}
function applyTheme(theme) {
  document.body.classList.remove("light-theme", "dark-theme");
  document.body.classList.add(theme);
  localStorage.setItem(LS_THEME_KEY, theme);
  if (!domElements.themeToggleButton) return;
  const icon = domElements.themeToggleButton.querySelector("i");
  const textSpan = domElements.themeToggleButton.querySelector("span");
  if (icon && textSpan) {
    if (theme === "dark-theme") {
      icon.className = "fas fa-moon"; // Set class directly
      textSpan.textContent = translate("btnThemeDark");
    } else {
      icon.className = "fas fa-sun"; // Set class directly
      textSpan.textContent = translate("btnThemeLight");
    }
  }
}
function toggleTheme() {
  const currentTheme = document.body.classList.contains("dark-theme")
    ? "dark-theme"
    : "light-theme";
  const newTheme = currentTheme === "dark-theme" ? "light-theme" : "dark-theme";
  applyTheme(newTheme);
  showToast(`Theme changed to ${newTheme.replace("-theme", "")}`, "info");
}

// --- Data Entry Mode ---
function toggleDataEntryMode() {
  document.body.classList.toggle("data-entry-mode");
  updateDataEntryModeButton();
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function updateDataEntryModeButton() {
  if (!domElements.toggleDataEntryModeButton) return;
  const isInEntryMode = document.body.classList.contains("data-entry-mode");
  const button = domElements.toggleDataEntryModeButton;
  const icon = button.querySelector("i");
  const span = button.querySelector("span");

  if (isInEntryMode) {
    button.setAttribute("data-translate-key", "btnExitDataEntryMode"); // Key for re-translation
    button.title = translate("btnExitDataEntryMode");
    if (span) span.textContent = translate("lblExitDataEntryMode");
    if (icon) icon.className = "fas fa-table"; // Set class directly
  } else {
    button.setAttribute("data-translate-key", "btnEnterDataEntryMode"); // Key for re-translation
    button.title = translate("btnEnterDataEntryMode");
    if (span) span.textContent = translate("lblEnterDataEntryMode");
    if (icon) icon.className = "fas fa-columns"; // Set class directly
  }
}

// --- Partner Data Management ---
function initializeDefaultPartnerData() {
  return {
    tele_health: [
      { id: "th_p1", name: "Partner 1 (TH)", subscriptionAmount: 100 },
      { id: "th_p2", name: "Partner 2 (TH)", subscriptionAmount: 200 },
    ],
    combo: [
      { id: "co_p1", name: "Partner 1 (Co)", subscriptionAmount: 500 },
      { id: "co_p2", name: "Partner 2 (Co)", subscriptionAmount: 650 },
    ],
  };
}
function loadPartnerData() {
  const storedData = localStorage.getItem(LS_PARTNER_KEY);
  if (storedData) {
    try {
      partnerConfig = JSON.parse(storedData);
      // Basic validation
      if (
        typeof partnerConfig !== "object" ||
        partnerConfig === null ||
        !partnerConfig.tele_health ||
        !partnerConfig.combo ||
        !Array.isArray(partnerConfig.tele_health) ||
        !Array.isArray(partnerConfig.combo)
      ) {
        console.warn("Stored partner data invalid, resetting.");
        partnerConfig = initializeDefaultPartnerData();
        savePartnerData();
      }
    } catch (e) {
      console.error("Error parsing partner data:", e);
      partnerConfig = initializeDefaultPartnerData();
      savePartnerData();
      showToast(translate("toastPartnerLoadErr"), "error");
    }
  } else {
    partnerConfig = initializeDefaultPartnerData();
    savePartnerData();
  }
}
function savePartnerData() {
  try {
    localStorage.setItem(LS_PARTNER_KEY, JSON.stringify(partnerConfig));
  } catch (e) {
    console.error("Error saving partner data:", e);
    showToast(translate("toastPartnerSaveErr"), "error");
  }
}
function populatePartnerDropdown(selectedType) {
  if (!domElements.partnerSelect || !domElements.entryTypeSelect) return;
  const partnerSelect = domElements.partnerSelect;
  const currentSelection = partnerSelect.value; // Preserve selection if possible
  partnerSelect.innerHTML = ""; // Clear existing options

  if (!selectedType || !partnerConfig[selectedType]) {
    // No type selected or invalid type
    const placeholderOption = document.createElement("option");
    placeholderOption.value = "";
    placeholderOption.textContent = translate("optSelectPartnerTypeFirst");
    placeholderOption.disabled = true; // Disable the placeholder
    partnerSelect.appendChild(placeholderOption);
    partnerSelect.disabled = true;
    partnerSelect.removeAttribute("required"); // Not required if disabled
    partnerSelect.value = ""; // Ensure value is reset
  } else {
    partnerSelect.disabled = false;
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = translate("optSelectPartner"); // Default "-- Select Partner --"
    partnerSelect.appendChild(defaultOption);

    const partners = partnerConfig[selectedType];
    partners.forEach((partner) => {
      const option = document.createElement("option");
      option.value = partner.id;
      const amount = Number(partner.subscriptionAmount);
      // Format amount or show N/A
      const formattedAmount = !isNaN(amount) ? formatCurrency(amount) : "N/A";
      option.textContent = `${partner.name} (${formattedAmount})`;
      partnerSelect.appendChild(option);
    });

    // Re-apply required status ONLY if partnerId is in the requiredFields array
    if (requiredFields.includes("partnerId")) {
      partnerSelect.setAttribute("required", "");
    } else {
      partnerSelect.removeAttribute("required");
    }

    // Try to restore previous selection if it's valid for the new type
    if (partners.some((p) => p.id === currentSelection)) {
      partnerSelect.value = currentSelection;
    } else {
      partnerSelect.value = ""; // Reset if previous selection is invalid
    }
  }
}
function formatCurrency(amount) {
  // Simple INR formatting
  return Number(amount).toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// --- Customer Data Persistence ---
function saveDataToLocalStorage() {
  try {
    localStorage.setItem(LS_DATA_KEY, JSON.stringify(collectedData));
  } catch (e) {
    console.error("Error saving customer data to localStorage:", e);
    showToast(translate("toastCustSaveErr"), "error");
    // Consider more robust error handling / informing the user storage might be full
  }
}
function loadDataFromLocalStorage() {
  const storedData = localStorage.getItem(LS_DATA_KEY);
  if (storedData) {
    try {
      const parsedData = JSON.parse(storedData);
      // Basic validation: ensure it's an array
      if (Array.isArray(parsedData)) {
        collectedData = parsedData;
      } else {
        console.warn("Invalid data format in localStorage, resetting.");
        collectedData = [];
        localStorage.removeItem(LS_DATA_KEY); // Clear invalid data
      }
    } catch (e) {
      console.error("Error parsing customer data from localStorage:", e);
      collectedData = [];
      localStorage.removeItem(LS_DATA_KEY); // Clear corrupted data
      showToast(translate("toastLoadErr"), "warning");
    }
  } else {
    collectedData = []; // No data found, start fresh
  }
}
function clearLocalStorageAndCustomerData() {
  localStorage.removeItem(LS_DATA_KEY);
  collectedData = [];
  renderTable(); // Update the table to show it's empty
  showToast(translate("toastDataCleared"), "success");
}

// --- UI Feedback ---
function showToast(message, type = "info", duration = 3000) {
  if (typeof Toastify === "undefined") {
    console.warn("Toastify library not loaded. Message:", message);
    alert(`${type.toUpperCase()}: ${message}`); // Fallback
    return;
  }
  let background;
  switch (type) {
    case "success":
      background = "linear-gradient(to right, #00b09b, #96c93d)";
      break;
    case "error":
      background = "linear-gradient(to right, #ff5f6d, #ffc371)";
      break;
    case "warning":
      background = "linear-gradient(to right, #f7b733, #fc4a1a)";
      break;
    default:
      background = "linear-gradient(to right, #007bff, #0056b3)"; // Info
  }
  Toastify({
    text: message,
    duration: duration,
    close: true,
    gravity: "top",
    position: "right",
    stopOnFocus: true,
    style: { background: background, borderRadius: "5px", zIndex: 10000 }, // Ensure high z-index
  }).showToast();
}
function showLoader() {
  if (domElements.loadingIndicator)
    domElements.loadingIndicator.style.display = "flex";
}
function hideLoader() {
  if (domElements.loadingIndicator)
    domElements.loadingIndicator.style.display = "none";
}

// --- Speech Recognition ---
function initializeSpeechRecognition() {
  try {
    recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop after one utterance
    recognition.interimResults = false; // We only want final results
    recognition.maxAlternatives = 1; // Only need the top result
    recognition.onstart = handleRecognitionStart;
    recognition.onresult = handleRecognitionResult;
    recognition.onspeechend = () => recognition.stop(); // Stop when speech ends
    recognition.onend = handleRecognitionEnd; // Cleanup after stopping
    recognition.onerror = handleRecognitionError;
    console.log("Speech recognition initialized successfully.");
  } catch (e) {
    console.error("Speech Recognition initialization failed:", e);
    showToast(translate("toastSpeechUnsupp"), "error", 5000);
    disableSpeechFunctionality();
  }
}
function disableSpeechFunctionality() {
  document
    .querySelectorAll(".mic-button")
    .forEach((btn) => (btn.disabled = true));
  if (domElements.languageSelect) domElements.languageSelect.disabled = true;
}
function handleRecognitionStart() {
  console.log("Speech recognition started.");
  // Visual feedback on the specific button that was clicked
  const btn = document.querySelector(
    `.mic-button[data-target="${currentTargetInput?.id}"]`
  );
  if (btn) {
    btn.classList.add("listening");
    btn.disabled = true; // Disable the active button
  }
}
function handleRecognitionResult(event) {
  const transcript = event.results[0][0].transcript.trim();
  console.log("Transcript received:", transcript);
  showToast(`${translate("toastHeard")} "${transcript}"`, "info");
  if (currentTargetInput) {
    currentTargetInput.value = transcript;
    // Trigger events to ensure any framework/listeners react
    currentTargetInput.dispatchEvent(new Event("input", { bubbles: true }));
    currentTargetInput.dispatchEvent(new Event("change", { bubbles: true }));
  }
}
function handleRecognitionEnd() {
  console.log("Speech recognition ended.");
  enableAllMicButtons(); // Re-enable all mic buttons
  currentTargetInput = null; // Reset target
}
function handleRecognitionError(event) {
  console.error("Speech Recognition Error:", event.error, event.message);
  let toastKey = "toastSpeechErr"; // Generic error key
  let errorDetail = event.error;

  switch (event.error) {
    case "not-allowed":
    case "service-not-allowed":
      toastKey = "toastMicDenied";
      break;
    case "no-speech":
      toastKey = "toastNoSpeech";
      break;
    case "audio-capture":
      toastKey = "toastAudioErr";
      break;
    case "aborted":
      // Often happens if stopped manually or by another start(), usually safe to ignore visually
      console.log("Speech recognition aborted.");
      handleRecognitionEnd(); // Ensure cleanup happens
      return; // Don't show toast for manual abort
    case "network":
      errorDetail = "Network error";
      break;
    case "bad-grammar":
      errorDetail = "Grammar error";
      break;
    case "language-not-supported":
      errorDetail = "Language not supported";
      break;
  }
  // Show translated error message with detail
  showToast(`${translate(toastKey)} (${errorDetail})`, "error");
  handleRecognitionEnd(); // Ensure cleanup happens on error
}
function handleMicButtonClick(event) {
  const targetId = event.currentTarget.dataset.target;
  currentTargetInput = document.getElementById(targetId);

  if (!currentTargetInput) {
    console.error(`Target input element with ID '${targetId}' not found.`);
    return;
  }
  if (!recognition) {
    showToast(translate("toastSpeechUnsupp"), "error");
    return;
  }

  // Ensure recognition isn't already running (safety check)
  try {
    recognition.stop();
  } catch (e) {
    // Ignore if it wasn't running
  }

  // Set language just before starting
  recognition.lang = domElements.languageSelect?.value || "en-US";
  console.log(
    `Starting recognition for ${targetId} with lang ${recognition.lang}`
  );

  try {
    disableAllMicButtons(); // Disable all buttons to prevent conflicts
    recognition.start();
    showToast(translate("toastListening"), "info", 1500);
  } catch (error) {
    console.error("Error starting speech recognition:", error);
    // Provide a more specific error message if possible
    let startErrorKey = "toastGenericErr";
    if (error.name === "InvalidStateError") {
      startErrorKey = "Speech recognition is already active."; // More specific
    } else {
      startErrorKey += " Could not start listening.";
    }
    showToast(translate(startErrorKey), "error");
    handleRecognitionEnd(); // Cleanup if start fails
  }
}

// --- Input Cleaning ---
function handleCleanButtonClick(event) {
  const targetId = event.currentTarget.dataset.target;
  const input = document.getElementById(targetId);
  if (input) {
    handleCleanInput(input);
    showToast(translate("toastInputCleaned"), "success", 1500);
  } else {
    console.warn(`Clean button target '${targetId}' not found.`);
  }
}
function handleCleanInput(inputElement) {
  if (!inputElement || typeof inputElement.value !== "string") return;
  // Trim, lowercase, remove extra internal whitespace (replace multiple spaces with single, then remove all)
  // Modify this logic if specific cleaning rules are needed (e.g., remove only leading/trailing)
  inputElement.value = inputElement.value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
  // Dispatch events so frameworks/listeners can react
  inputElement.dispatchEvent(new Event("input", { bubbles: true }));
  inputElement.dispatchEvent(new Event("change", { bubbles: true }));
}

// --- Image Handling ---
function handleImageUploadTrigger() {
  if (domElements.imageUploadInput) {
    domElements.imageUploadInput.click(); // Trigger file input click
  } else {
    console.error("Image upload input element not found.");
  }
}
function handleImageFiles(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;
  if (!domElements.imageUploadInput) return;

  const currentCount = uploadedImages.length;
  const remainingSlots = MAX_IMAGE_UPLOADS - currentCount;

  if (remainingSlots <= 0) {
    showToast(
      translate("toastImageUploadLimit", { limit: MAX_IMAGE_UPLOADS }),
      "warning"
    );
    domElements.imageUploadInput.value = ""; // Clear selection
    return;
  }

  // Take only as many files as there are slots remaining
  const filesToProcess = Array.from(files).slice(0, remainingSlots);

  if (files.length > remainingSlots) {
    showToast(
      translate("toastImageUploadLimit", { limit: MAX_IMAGE_UPLOADS }),
      "warning"
    );
  }

  let processedCount = 0;
  let successfulUploads = 0;
  const totalToProcess = filesToProcess.length;
  showLoader(); // Show loader while processing

  filesToProcess.forEach((file) => {
    // Check if it's an image file
    if (!file.type.startsWith("image/")) {
      console.warn(`Skipping non-image file: ${file.name}`);
      processedCount++;
      if (processedCount === totalToProcess) hideLoader(); // Hide loader if this was the last file
      return; // Skip non-image files
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      // Successfully read file
      uploadedImages.push({ name: file.name, dataUrl: e.target.result });
      processedCount++;
      successfulUploads++;
      if (processedCount === totalToProcess) {
        // All files processed
        hideLoader();
        updateImageViewerState(); // Update count, buttons
        showToast(
          translate("toastImageUploadSuccess", { count: successfulUploads }), // Show success count
          "success"
        );
        // Optionally open viewer if it was closed and images were added
        if (
          domElements.imageViewerSection?.style.display === "none" &&
          uploadedImages.length > 0
        ) {
          toggleImageViewer();
        }
      }
    };

    reader.onerror = () => {
      // Error reading file
      console.error("Error reading file:", file.name, reader.error);
      showToast(translate("toastImageUploadErr", { name: file.name }), "error");
      processedCount++;
      if (processedCount === totalToProcess) {
        hideLoader(); // Hide loader even if errors occurred
      }
    };

    reader.readAsDataURL(file); // Read the file as Base64 Data URL
  });

  // Clear the file input value to allow selecting the same file again
  domElements.imageUploadInput.value = "";
}
function toggleImageViewer() {
  if (!domElements.imageViewerSection || !domElements.toggleImageViewerButton)
    return;

  if (uploadedImages.length === 0) {
    showToast(translate("toastNoImages"), "info");
    domElements.imageViewerSection.style.display = "none";
    domElements.toggleImageViewerButton.disabled = true; // Ensure button is disabled
    return;
  }

  const isHidden = domElements.imageViewerSection.style.display === "none";
  domElements.imageViewerSection.style.display = isHidden ? "flex" : "none";

  if (isHidden) {
    // If opening, reset to first image
    currentImageIndex = 0;
    displayCurrentImage();
  }
}
function displayCurrentImage() {
  if (
    !domElements.imageViewerSection ||
    !domElements.currentImageView ||
    !domElements.imageViewerStatus ||
    !domElements.prevImageButton ||
    !domElements.nextImageButton
  )
    return; // Ensure all elements exist

  const totalImages = uploadedImages.length;

  if (
    totalImages === 0 ||
    currentImageIndex < 0 ||
    currentImageIndex >= totalImages ||
    !uploadedImages[currentImageIndex]
  ) {
    // Handle empty or invalid state
    domElements.imageViewerSection.style.display = "none"; // Hide if no images
    domElements.currentImageView.src = "";
    domElements.currentImageView.alt = "";
    domElements.imageViewerStatus.textContent = translate("ImageViewerStatus", {
      current: 0,
      total: 0,
    });
    domElements.prevImageButton.disabled = true;
    domElements.nextImageButton.disabled = true;
    return;
  }

  // Ensure viewer is visible if we have images to show
  if (domElements.imageViewerSection.style.display === "none") {
    domElements.imageViewerSection.style.display = "flex";
  }

  // Display the current image
  domElements.currentImageView.src = uploadedImages[currentImageIndex].dataUrl;
  domElements.currentImageView.alt =
    uploadedImages[currentImageIndex].name || `Image ${currentImageIndex + 1}`;
  domElements.imageViewerStatus.textContent = translate("ImageViewerStatus", {
    current: currentImageIndex + 1,
    total: totalImages,
  });

  // Enable/disable navigation buttons
  domElements.prevImageButton.disabled = currentImageIndex === 0;
  domElements.nextImageButton.disabled = currentImageIndex === totalImages - 1;
}
function showNextImage() {
  if (currentImageIndex < uploadedImages.length - 1) {
    currentImageIndex++;
    displayCurrentImage();
  }
}
function showPrevImage() {
  if (currentImageIndex > 0) {
    currentImageIndex--;
    displayCurrentImage();
  }
}
function updateImageViewerState() {
  if (!domElements.imageCountSpan || !domElements.toggleImageViewerButton)
    return;

  const count = uploadedImages.length;
  domElements.imageCountSpan.textContent = count; // Update button text count
  domElements.toggleImageViewerButton.disabled = count === 0; // Disable button if no images

  if (count === 0) {
    // If no images, ensure viewer is hidden and state is reset
    if (domElements.imageViewerSection)
      domElements.imageViewerSection.style.display = "none";
    displayCurrentImage(); // Reset text/buttons via displayCurrentImage's empty state logic
  } else {
    // If images exist and viewer is open, update display potentially
    if (domElements.imageViewerSection?.style.display !== "none") {
      // If current index is now out of bounds (e.g., image deleted), reset
      if (currentImageIndex >= count) {
        currentImageIndex = Math.max(0, count - 1);
      }
      displayCurrentImage(); // Refresh display
    }
  }
}

// --- Core Customer Data Handling ---
function handleAddOrUpdateEntry() {
  if (!domElements.form) return;
  clearFormValidationStyles(); // Clear previous validation feedback

  // Use HTML5 validation first for required fields, patterns etc.
  if (!domElements.form.checkValidity()) {
    let missingFields = [];
    let firstInvalidElement = null;
    domElements.form.querySelectorAll(":invalid").forEach((el, index) => {
      // Apply visual style directly, but CSS :invalid selector should also work
      // el.style.borderColor = 'var(--danger-color, red)';
      el.classList.add("invalid"); // Add class for CSS styling
      if (index === 0) firstInvalidElement = el; // Find first invalid for focus

      // Try to get a user-friendly field name from label
      const labelElement = el
        .closest(".form-field")
        ?.querySelector("label:not(.gender-group label)");
      let fieldName = el.id || el.name || "field"; // Fallback
      if (labelElement) {
        const labelClone = labelElement.cloneNode(true);
        labelClone
          .querySelectorAll(".required-star, .sr-only")
          .forEach((s) => s.remove());
        fieldName = labelClone.textContent.replace(/[:*]/g, "").trim();
      } else {
        // Attempt translation lookup if label not found
        const labelKey = `lbl${
          fieldName.charAt(0).toUpperCase() + fieldName.slice(1)
        }`;
        const translatedLabel = translate(labelKey);
        // Use translated label if it's different from the key itself
        if (translatedLabel !== labelKey) {
          fieldName = translatedLabel.replace(/[:*]/g, "").trim();
        }
      }
      missingFields.push(fieldName);
    });
    missingFields = [...new Set(missingFields)]; // Unique field names
    showToast(
      translate("toastReqFieldsWarning", { fields: missingFields.join(", ") }),
      "warning",
      5000
    );
    if (firstInvalidElement) firstInvalidElement.focus(); // Focus the first invalid field
    return; // Stop processing
  }

  // Custom validation for main gender radio buttons (if required)
  const genderSelected = domElements.form.querySelector(
    'input[name="gender"]:checked'
  );
  if (!genderSelected && requiredFields.includes("gender")) {
    showToast(
      translate("toastReqFieldsWarning", { fields: translate("lblGender") }),
      "warning",
      5000
    );
    const genderGroup = domElements.form.querySelector(".gender-group"); // Find main gender group
    if (genderGroup) {
      // Highlight the group visually
      genderGroup.style.outline = "1px solid var(--danger-color, red)";
      const firstRadio = genderGroup.querySelector('input[type="radio"]');
      if (firstRadio) firstRadio.focus(); // Focus first radio in group
    }
    return; // Stop processing
  }

  // Custom validation for nominee gender (only if a nominee name is entered, treat as optional otherwise)
  const nomineeNameInput = document.getElementById("nomineeName");
  const nomineeGenderSelected = domElements.form.querySelector(
    'input[name="nomineeGender"]:checked'
  );
  if (
    nomineeNameInput?.value.trim() &&
    !nomineeGenderSelected &&
    !optionalFields.includes("nomineeGender")
  ) {
    // If nominee name exists AND gender is required AND not selected
    showToast(
      translate("toastReqFieldsWarning", {
        fields: translate("lblNomineeGender"),
      }),
      "warning",
      5000
    );
    const nomineeGenderGroup = domElements.form.querySelector(
      ".nominee-section .gender-group"
    ); // Find nominee gender group
    if (nomineeGenderGroup) {
      nomineeGenderGroup.style.outline = "1px solid var(--danger-color, red)";
      const firstNomineeRadio = nomineeGenderGroup.querySelector(
        'input[type="radio"]'
      );
      if (firstNomineeRadio) firstNomineeRadio.focus();
    }
    return; // Stop processing
  }

  // All validation passed, collect data
  const entryData = {};
  customerFieldKeys.forEach((key) => {
    let value;
    if (key === "gender") {
      // Use selected main gender value or empty string
      value = genderSelected ? genderSelected.value : "";
    } else if (key === "nomineeGender") {
      // Use selected nominee gender value or empty string
      const selectedNomineeGender = domElements.form.querySelector(
        'input[name="nomineeGender"]:checked'
      );
      value = selectedNomineeGender ? selectedNomineeGender.value : "";
    } else {
      // Get value from other input/select elements
      const element = document.getElementById(key);
      value = element ? (element.value || "").trim() : ""; // Trim whitespace
    }
    entryData[key] = value;
  });

  const editingId = domElements.editingIdInput
    ? domElements.editingIdInput.value
    : null;
  const name = entryData.customerName || "N/A"; // Use customer name for toasts

  if (editingId) {
    // Update existing entry
    const index = collectedData.findIndex((e) => e.id == editingId); // Use == for potential type difference
    if (index > -1) {
      // Preserve original ID, update other fields
      collectedData[index] = { ...collectedData[index], ...entryData };
      showToast(translate("toastEntryUpdated", { name: name }), "success");
    } else {
      // ID mismatch (shouldn't normally happen), treat as new entry
      console.warn(
        `Edit ID ${editingId} not found in data array, adding as new.`
      );
      entryData.id = Date.now(); // Assign a new ID
      collectedData.push(entryData);
      showToast(translate("toastEntryAdded", { name: name }), "success"); // Indicate added
    }
    // Clear editing state
    if (domElements.editingIdInput) domElements.editingIdInput.value = "";
    if (domElements.addEntryButton)
      domElements.addEntryButton.querySelector("span").textContent =
        translate("btnAddEntry"); // Reset button text
  } else {
    // Add new entry
    entryData.id = Date.now(); // Generate unique ID (timestamp is usually sufficient for local)
    collectedData.push(entryData);
    showToast(translate("toastEntryAdded", { name: name }), "success");
  }

  saveDataToLocalStorage(); // Persist changes
  renderTable(); // Update the displayed table
  clearForm(); // Clear the form for the next entry
}
function handleEditEntry(id) {
  const entry = collectedData.find((e) => e.id == id); // Use == for potential type difference
  if (!entry) {
    console.warn(`Entry with ID ${id} not found for editing.`);
    showToast("Could not find the entry to edit.", "error");
    return;
  }
  if (!domElements.form) return;
  clearFormValidationStyles(); // Clear previous validation highlights

  console.log("Editing entry:", entry); // Log the entry being edited

  // Populate form fields
  customerFieldKeys.forEach((key) => {
    const element = document.getElementById(key);
    if (key === "entryType") {
      if (domElements.entryTypeSelect) {
        domElements.entryTypeSelect.value = entry[key] || "";
        // IMPORTANT: Populate partners *after* setting entry type
        populatePartnerDropdown(entry[key]);
      }
    } else if (key === "partnerId") {
      // Defer setting partnerId slightly to ensure dropdown is populated
      setTimeout(() => {
        if (domElements.partnerSelect) {
          domElements.partnerSelect.value = entry[key] || "";
          // Ensure required status is correct after potentially enabling dropdown
          applyRequiredAttributes();
        }
      }, 50); // Small delay (adjust if needed)
    } else if (key === "gender") {
      // Handle main gender radio buttons
      domElements.form
        .querySelectorAll('input[name="gender"]')
        .forEach((rb) => {
          rb.checked = rb.value === entry[key];
        });
    } else if (key === "nomineeGender") {
      // Handle nominee gender radio buttons
      domElements.form
        .querySelectorAll('input[name="nomineeGender"]')
        .forEach((rb) => {
          rb.checked = rb.value === entry[key];
        });
    } else if (element) {
      // Handle standard text, date, tel, select fields
      element.value = entry[key] || "";
    } else {
      console.warn(
        `Element with ID '${key}' not found during edit population.`
      );
    }
  });

  // Set the hidden editing ID field
  if (domElements.editingIdInput) domElements.editingIdInput.value = id;
  // Change button text to "Update Entry"
  if (domElements.addEntryButton)
    domElements.addEntryButton.querySelector("span").textContent =
      translate("btnUpdateEntry");

  // Provide feedback and focus form
  showToast(
    translate("toastEditing", { name: entry.customerName || "N/A" }),
    "info"
  );
  domElements.form.scrollIntoView({ behavior: "smooth", block: "start" });
  applyRequiredAttributes(); // Re-apply required attributes after populating
}
function handleDeleteEntry(id) {
  const index = collectedData.findIndex((e) => e.id == id); // Use == for potential type difference
  if (index > -1) {
    const name = collectedData[index].customerName || "this record";
    // Use translated confirmation message
    if (confirm(translate("DeleteEntry", { name: name }) + ` "${name}"?`)) {
      collectedData.splice(index, 1); // Remove the entry
      saveDataToLocalStorage(); // Update storage
      renderTable(); // Refresh the table
      showToast(translate("toastEntryDeleted", { name: name }), "success");

      // If the deleted entry was the one being edited, clear the form
      if (
        domElements.editingIdInput &&
        domElements.editingIdInput.value == id
      ) {
        clearForm();
      }
    }
  } else {
    console.warn(`Entry with ID ${id} not found for deletion.`);
    showToast("Could not find the entry to delete.", "error");
  }
}

// --- Duplicate Detection ---
// Performance: This iterates through all data. For very large datasets (>10k entries),
// optimizing this might be needed (e.g., pre-sorting or more complex data structures).
// For typical local use, this is acceptable.
function findDuplicates(data) {
  const combinations = new Map(); // Stores "field1|field2|..." -> first_id_found
  const duplicateIds = new Set(); // Stores IDs of entries considered duplicates

  data.forEach((entry) => {
    // Create a key based on the defined duplicate check fields
    const keyParts = duplicateCheckFields.map(
      (field) => (entry[field] || "").trim().toLowerCase() // Normalize: trim, lowercase
    );

    // Only check for duplicates if all key parts are present
    if (keyParts.every((part) => part)) {
      const key = keyParts.join("|"); // Simple join, assumes '|' isn't in data

      if (combinations.has(key)) {
        // This key has been seen before - mark both as duplicates
        duplicateIds.add(entry.id); // Mark current entry
        duplicateIds.add(combinations.get(key)); // Mark the first entry found with this key
      } else {
        // First time seeing this combination, store its ID
        combinations.set(key, entry.id);
      }
    }
  });
  return duplicateIds; // Return the set of IDs involved in duplicates
}

// --- Table Sorting ---
let sortColumn = null;
let sortDirection = "asc";
function sortData(key) {
  const isAsc = sortColumn === key && sortDirection === "asc";
  sortDirection = isAsc ? "desc" : "asc";
  sortColumn = key;

  collectedData.sort((a, b) => {
    let valA, valB;

    // Handle special sorting cases (like partner lookup)
    if (key === "partnerName" || key === "subscriptionAmount") {
      const partnerA = partnerConfig[a.entryType]?.find(
        (p) => p.id === a.partnerId
      );
      const partnerB = partnerConfig[b.entryType]?.find(
        (p) => p.id === b.partnerId
      );
      valA =
        key === "partnerName"
          ? partnerA?.name || ""
          : partnerA?.subscriptionAmount ?? null;
      valB =
        key === "partnerName"
          ? partnerB?.name || ""
          : partnerB?.subscriptionAmount ?? null;
    } else {
      // Standard field access
      valA = a[key];
      valB = b[key];
    }

    // Type-aware comparison
    const typeA = typeof valA;
    const typeB = typeof valB;

    // Handle nulls/undefined consistently (sort them to the end usually)
    const nullSortOrder = isAsc ? 1 : -1; // Place nulls last in asc, first in desc
    if (valA == null && valB == null) return 0;
    if (valA == null) return nullSortOrder;
    if (valB == null) return -nullSortOrder;

    // Numeric sort (including subscription amount)
    if (
      (typeA === "number" || key === "subscriptionAmount") &&
      (typeB === "number" || key === "subscriptionAmount")
    ) {
      const numA = Number(valA);
      const numB = Number(valB);
      return isAsc ? numA - numB : numB - numA;
    }
    // Date sort
    else if (key === "enrolmentDate" || key === "dob" || key === "nomineeDob") {
      // Attempt to parse dates, handle invalid dates gracefully
      const dateA = valA ? new Date(valA) : null;
      const dateB = valB ? new Date(valB) : null;
      const dateAValid = dateA && !isNaN(dateA.getTime());
      const dateBValid = dateB && !isNaN(dateB.getTime());

      if (dateAValid && dateBValid) {
        return isAsc ? dateA - dateB : dateB - dateA;
      } else if (dateAValid) {
        // Valid date comes before invalid/null
        return isAsc ? -1 : 1;
      } else if (dateBValid) {
        // Valid date comes before invalid/null
        return isAsc ? 1 : -1;
      } else {
        return 0; // Both invalid/null
      }
    }
    // Default: String locale-aware sort (case-insensitive)
    else {
      const strA = String(valA).toLowerCase();
      const strB = String(valB).toLowerCase();
      return isAsc ? strA.localeCompare(strB) : strB.localeCompare(strA);
    }
  });

  renderTable(); // Re-render the table with sorted data
}
function updateSortIcons() {
  document
    .querySelectorAll("#dataTable thead th[data-sort-key]")
    .forEach((th) => {
      const icon = th.querySelector(".sort-icon");
      if (!icon) return;

      if (th.dataset.sortKey === sortColumn) {
        // Active sort column
        icon.textContent = sortDirection === "asc" ? "▲" : "▼";
        icon.style.opacity = "1";
      } else {
        // Inactive sort column
        icon.textContent = "▲"; // Default icon (up arrow)
        icon.style.opacity = "0.3"; // Dimmed
      }
    });
}

// --- Table Rendering ---
// Performance: Creating DOM elements in a loop can be slow for *very* large datasets.
// Using document fragments or innerHTML += could be faster but more complex to manage events.
// Current approach is generally fine for hundreds/few thousand entries.
function renderTable() {
  if (!domElements.tableBody) return;
  domElements.tableBody.innerHTML = ""; // Clear previous content

  if (collectedData.length === 0) {
    const colspan =
      domElements.dataTableHead?.querySelectorAll("th").length || 12; // Match column count
    domElements.tableBody.innerHTML = `<tr class="no-data-row"><td colspan="${colspan}">${translate(
      "tblNoEntries"
    )}</td></tr>`;
    updateSortIcons(); // Ensure icons are reset/dimmed
    return;
  }

  const duplicateIds = findDuplicates(collectedData);
  const oneHourAgo = Date.now() - 3600000; // For highlighting recent entries

  // Use DocumentFragment for potentially better performance with many rows
  const fragment = document.createDocumentFragment();

  collectedData.forEach((entry) => {
    const row = document.createElement("tr"); // Create row element
    row.dataset.id = entry.id; // Set data-id for actions

    // Lookup partner details
    const partner = partnerConfig[entry.entryType]?.find(
      (p) => p.id === entry.partnerId
    );
    const partnerName = partner?.name || (entry.partnerId ? "N/A" : ""); // Show N/A only if partner ID exists but no match found
    const partnerAmount = partner?.subscriptionAmount;

    // Determine row highlighting
    let isMissingRequired = criticalFieldsForBlanks.some((key) => !entry[key]);
    let isRecent = entry.id > oneHourAgo; // Check if added within the last hour
    let isDuplicate = duplicateIds.has(entry.id);

    row.className = "fade-in"; // Add fade-in animation class
    if (isDuplicate) row.classList.add("row-highlight-duplicate");
    else if (isMissingRequired) row.classList.add("row-highlight-missing");
    else if (isRecent) row.classList.add("row-highlight-recent");

    // --- Create and Append Cells (Order MUST match thead in HTML) ---
    // Helper function to create and append a cell
    const addCell = (text = "", align = "left") => {
      const cell = row.insertCell();
      cell.textContent = text;
      cell.style.textAlign = align;
      return cell;
    };

    addCell(entry.branchName || ""); // Col 1: Branch
    addCell(entry.customerName || ""); // Col 2: Name
    addCell(entry.customerID || ""); // Col 3: Cust ID
    addCell(translate(`optGender${entry.gender || "Unknown"}`)); // Col 4: Gender
    addCell(entry.mobileNumber || ""); // Col 5: Mobile
    addCell(entry.enrolmentDate || ""); // Col 6: Enrol Date
    addCell(entry.dob || ""); // Col 7: DOB
    addCell(entry.savingsAccountNumber || ""); // Col 8: Savings Acc
    addCell(entry.csbCode || ""); // Col 9: CSB Code
    addCell(partnerName); // Col 10: Partner Name
    addCell(
      partnerAmount != null && !isNaN(partnerAmount)
        ? formatCurrency(Number(partnerAmount))
        : "",
      "right"
    ); // Col 11: Sub Amount (Right Aligned)

    // Action Cell (Col 12)
    const actionCell = row.insertCell();
    actionCell.classList.add("action-cell");
    actionCell.innerHTML = `
        <button class="btn btn-sm btn-outline-primary edit-btn" data-id="${
          entry.id
        }" title="${translate("titleEditButton")}">
            <i class="fas fa-edit" aria-hidden="true"></i> <span class="sr-only">Edit</span>
        </button>
        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${
          entry.id
        }" title="${translate("titleDeleteButton")}">
            <i class="fas fa-trash-alt" aria-hidden="true"></i> <span class="sr-only">Delete</span>
        </button>
    `;
    // --- End Cell Creation ---

    fragment.appendChild(row); // Add the completed row to the fragment
  });

  domElements.tableBody.appendChild(fragment); // Append the fragment to the table body (single DOM operation)
  updateSortIcons(); // Update sort indicators after rendering
}
function clearFormValidationStyles() {
  if (!domElements.form) return;
  // Remove .invalid class and explicit styles
  domElements.form
    .querySelectorAll(
      '.invalid, input[style*="border-color"], .gender-group[style*="outline"]'
    )
    .forEach((el) => {
      el.classList.remove("invalid");
      el.style.borderColor = ""; // Reset border color
      el.style.outline = ""; // Reset outline
      if (typeof el.setCustomValidity === "function") {
        el.setCustomValidity(""); // Clear custom validation messages if used
      }
    });
  // Specifically reset gender group outlines
  domElements.form.querySelectorAll(".gender-group").forEach((group) => {
    group.style.outline = "none";
  });
}
function clearForm() {
  if (!domElements.form) return;
  domElements.form.reset(); // Resets most fields to default values
  clearFormValidationStyles(); // Clear any red borders/highlights

  // Reset partner dropdown based on potentially reset entryType
  if (domElements.entryTypeSelect) {
    populatePartnerDropdown(domElements.entryTypeSelect.value);
  }

  // Clear the editing ID state
  if (domElements.editingIdInput) domElements.editingIdInput.value = "";
  // Reset the Add/Update button text
  if (domElements.addEntryButton)
    domElements.addEntryButton.querySelector("span").textContent =
      translate("btnAddEntry");

  applyRequiredAttributes(); // Re-apply required attributes based on the reset state
}

// --- Download Functions ---
// Performance: getExportData iterates through all data. This is necessary.
// Library calls (XLSX, jsPDF) handle their own performance. Using setTimeout avoids blocking UI thread.
function handleSaveToExcel() {
  if (typeof XLSX === "undefined") {
    showToast(
      translate("toastLibNotLoaded", { libraryName: "XLSX (SheetJS)" }),
      "error"
    );
    return;
  }
  if (collectedData.length === 0) {
    showToast("No data to export.", "warning");
    return;
  }
  showLoader();
  // Use setTimeout to allow UI to update (show loader) before potentially blocking export
  setTimeout(() => {
    try {
      const exportData = getExportData(); // Get formatted data
      if (exportData.length === 0) {
        showToast("No exportable data generated.", "warning");
        hideLoader();
        return;
      }

      const wb = XLSX.utils.book_new(); // Create new workbook
      const headers = Object.keys(exportData[0]); // Get headers from first object
      // Convert array of objects to array of arrays for sheetjs
      const wsData = [
        headers,
        ...exportData.map((row) => headers.map((header) => row[header])),
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData); // Create worksheet

      // Define approximate column widths (adjust as needed)
      const columnWidths = [
        // Order should match getExportData()
        { wch: 20 }, // Branch
        { wch: 25 }, // Cust Name
        { wch: 15 }, // Cust ID
        { wch: 10 }, // Gender
        { wch: 15 }, // Mobile
        { wch: 12 }, // Enrol Date
        { wch: 12 }, // DOB
        { wch: 18 }, // Savings Acc
        { wch: 12 }, // CSB Code
        { wch: 25 }, // Partner Name
        { wch: 15 }, // Sub Amount
        // Nominee columns widths - MODIFICATION: Added
        { wch: 25 }, // Nom Name
        { wch: 12 }, // Nom DOB
        { wch: 15 }, // Nom Mobile
        { wch: 10 }, // Nom Gender
      ];

      // Apply column widths if counts match
      if (headers.length === columnWidths.length) {
        ws["!cols"] = columnWidths;
      } else {
        console.warn(
          `Excel Export: Header count (${headers.length}) doesn't match defined column widths (${columnWidths.length}). Auto-sizing will be used.`
        );
      }

      XLSX.utils.book_append_sheet(wb, ws, "CustomerData"); // Add worksheet to workbook
      const filename = `CustomerData_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, filename); // Trigger download

      // Clear data after successful Excel export
      clearLocalStorageAndCustomerData();
      uploadedImages = []; // Also clear images on Excel save
      updateImageViewerState();

      showToast(translate("toastExcelSuccess"), "success", 5000);
    } catch (error) {
      console.error("Error exporting to Excel:", error);
      showToast(translate("toastExcelErr"), "error");
    } finally {
      hideLoader(); // Ensure loader is hidden
    }
  }, 50); // Small delay
}
function handleSaveToCSV() {
  if (collectedData.length === 0) {
    showToast("No data to export.", "warning");
    return;
  }
  showLoader();
  setTimeout(() => {
    try {
      const data = getExportData();
      if (data.length === 0) {
        showToast("No exportable data generated.", "warning");
        hideLoader();
        return;
      }
      const headers = Object.keys(data[0]);
      // Create CSV rows, ensuring proper quoting for values containing commas or quotes
      const csvRows = [
        headers.join(","), // Header row
        ...data.map((row) =>
          headers
            .map(
              (header) =>
                // Quote value if it contains comma, newline, or double quote
                // Escape existing double quotes by doubling them ( "" )
                `"${(row[header] ?? "").toString().replace(/"/g, '""')}"`
            )
            .join(",")
        ),
      ];
      const csvString = csvRows.join("\r\n"); // Use CRLF for broad compatibility

      triggerDownload(
        csvString,
        `CustomerData_${new Date().toISOString().slice(0, 10)}.csv`,
        "text/csv;charset=utf-8;" // Specify content type and charset
      );
      showToast(translate("toastCsvSuccess"), "success");
    } catch (e) {
      console.error("Error exporting to CSV:", e);
      showToast(translate("toastCsvErr"), "error");
    } finally {
      hideLoader();
    }
  }, 50);
}
function handleSaveToPDF() {
  // Check for jsPDF and autoTable plugin
  if (
    typeof window.jspdf === "undefined" ||
    typeof window.jspdf.jsPDF === "undefined"
  ) {
    showToast(
      translate("toastLibNotLoaded", { libraryName: "jsPDF" }),
      "error"
    );
    return;
  }
  if (typeof window.jspdf.jsPDF.API?.autoTable === "undefined") {
    showToast(
      translate("toastLibNotLoaded", { libraryName: "jsPDF-AutoTable plugin" }),
      "error"
    );
    return;
  }
  if (collectedData.length === 0) {
    showToast("No data to export.", "warning");
    return;
  }
  showLoader();
  setTimeout(() => {
    try {
      const { jsPDF } = window.jspdf; // Destructure jsPDF
      const doc = new jsPDF({
        orientation: "landscape", // Landscape for potentially wide table
        unit: "pt", // Points as units
        format: "a4", // A4 paper size
      });

      const data = getExportData(); // Get formatted data
      if (data.length === 0) {
        showToast("No exportable data generated.", "warning");
        hideLoader();
        return;
      }

      const headers = Object.keys(data[0]); // Get headers
      // Convert array of objects to array of arrays expected by autoTable
      const body = data.map((row) =>
        headers.map((header) => row[header] ?? "")
      ); // Use ?? "" for null/undefined

      // Add title before table
      doc.setFontSize(16);
      doc.text(translate("mainHeading"), doc.internal.pageSize.width / 2, 40, {
        align: "center",
      });

      doc.autoTable({
        head: [headers], // Header row
        body: body, // Data rows
        startY: 60, // Start table below title
        theme: "striped", // Table theme (striped, grid, plain)
        headStyles: { fillColor: [41, 128, 185], textColor: 255 }, // Header style (blue bg, white text)
        styles: { fontSize: 7, cellPadding: 3 }, // General cell style (small font)
        columnStyles: {
          // Specific column styles (e.g., right-align amounts)
          [headers.indexOf(translate("tblColSubscrAmt"))]: { halign: "right" }, // Find amount column by translated header
          // Add more column styles if needed
        },
        didDrawPage: function (hookData) {
          // Add footer on each page
          doc.setFontSize(8);
          const pageCount = doc.internal.getNumberOfPages();
          doc.text(
            "Page " + hookData.pageNumber + " of " + pageCount,
            doc.internal.pageSize.width - hookData.settings.margin.right - 40, // Position right
            doc.internal.pageSize.height - 20 // Position near bottom
          );
          doc.text(
            `Generated: ${new Date().toLocaleDateString()}`,
            hookData.settings.margin.left, // Position left
            doc.internal.pageSize.height - 20
          );
        },
      });

      doc.save(`CustomerData_${new Date().toISOString().slice(0, 10)}.pdf`); // Trigger download
      showToast(translate("toastPdfSuccess"), "success");
    } catch (e) {
      console.error("Error exporting to PDF:", e);
      showToast(translate("toastPdfErr"), "error");
    } finally {
      hideLoader();
    }
  }, 50);
}
function getExportData() {
  // Returns an array of objects, where keys are the *translated* table headers.
  // Order of properties here dictates the column order in exports.
  return collectedData.map((entry) => {
    const partner = partnerConfig[entry.entryType]?.find(
      (p) => p.id === entry.partnerId
    );
    const partnerName = partner?.name || (entry.partnerId ? "N/A" : "");
    const partnerAmount = partner?.subscriptionAmount ?? null; // Use null for empty amount

    // Translate gender fields
    const genderDisplay = translate(`optGender${entry.gender || "Unknown"}`);
    const nomineeGenderDisplay = translate(
      `optGender${entry.nomineeGender || "Unknown"}`
    );

    let rowData = {};
    // --- Main Customer Data --- (Match table header order)
    rowData[translate("tblColBranch")] = entry.branchName || "";
    rowData[translate("tblColName")] = entry.customerName || "";
    rowData[translate("tblColCustID")] = entry.customerID || "";
    rowData[translate("tblColGender")] = genderDisplay;
    rowData[translate("tblColMobile")] = entry.mobileNumber || "";
    rowData[translate("tblColEnrolDate")] = entry.enrolmentDate || "";
    rowData[translate("tblColDOB")] = entry.dob || "";
    rowData[translate("tblColSavingsAcc")] = entry.savingsAccountNumber || "";
    rowData[translate("tblColCSB")] = entry.csbCode || "";
    rowData[translate("tblColPartner")] = partnerName;
    rowData[translate("tblColSubscrAmt")] = partnerAmount; // Keep as number or null for export libraries

    // --- Nominee Data --- MODIFICATION: Added Nominee Fields
    rowData[translate("tblColNomName")] = entry.nomineeName || "";
    rowData[translate("tblColNomDOB")] = entry.nomineeDob || "";
    rowData[translate("tblColNomMobile")] = entry.nomineeMobileNumber || "";
    rowData[translate("tblColNomGender")] = nomineeGenderDisplay;

    return rowData;
  });
}
function triggerDownload(content, filename, contentType) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a); // Append link to body
  a.click(); // Simulate click to trigger download
  document.body.removeChild(a); // Remove link from body
  URL.revokeObjectURL(url); // Release the object URL
}

// --- Dashboard Functionality ---
// Performance: Aggregating data iterates through collectedData. Acceptable for local use.
// Chart.js handles rendering performance.
function generateDashboard() {
  if (typeof Chart === "undefined") {
    showToast(
      translate("toastLibNotLoaded", { libraryName: "Chart.js" }),
      "error"
    );
    return;
  }
  if (collectedData.length === 0) {
    showToast("No data available to generate dashboard.", "warning");
    return;
  }
  showLoader();
  setTimeout(() => {
    try {
      // Destroy previous chart instances to prevent memory leaks and redraw issues
      if (genderChartInstance) genderChartInstance.destroy();
      if (branchChartInstance) branchChartInstance.destroy();
      if (partnerChartInstance) partnerChartInstance.destroy();

      // 1. Gender Distribution Data
      const genderCounts = collectedData.reduce((acc, entry) => {
        const genderKey = `optGender${entry.gender || "Unknown"}`; // Use translation key prefix
        acc[genderKey] = (acc[genderKey] || 0) + 1;
        return acc;
      }, {});
      renderGenderChart(genderCounts); // Pass data with keys like "optGenderMale"

      // 2. Branch Distribution Data (Top 5)
      const branchCounts = collectedData.reduce((acc, entry) => {
        const branchName = entry.branchName?.trim() || "Unknown Branch";
        acc[branchName] = (acc[branchName] || 0) + 1;
        return acc;
      }, {});
      const sortedBranches = Object.entries(branchCounts)
        .sort(([, countA], [, countB]) => countB - countA) // Sort descending by count
        .slice(0, 5); // Take top 5
      renderBranchChart(Object.fromEntries(sortedBranches));

      // 3. Partner Distribution Data
      const partnerCounts = collectedData.reduce((acc, entry) => {
        const partner = partnerConfig[entry.entryType]?.find(
          (p) => p.id === entry.partnerId
        );
        const partnerName =
          partner?.name ||
          (entry.partnerId ? "Unknown Partner" : "No Partner Selected");
        acc[partnerName] = (acc[partnerName] || 0) + 1;
        return acc;
      }, {});
      renderPartnerChart(partnerCounts);

      // Update Dashboard Stats (Example - add more as needed)
      const totalEntries = collectedData.length;
      const femaleCount = genderCounts["optGenderFemale"] || 0;
      const femaleRatio =
        totalEntries > 0 ? ((femaleCount / totalEntries) * 100).toFixed(1) : 0;
      const blankEntries = collectedData.filter((entry) =>
        criticalFieldsForBlanks.some((key) => !entry[key])
      ).length;

      document.getElementById("statTotalEntries").textContent = totalEntries;
      document.getElementById(
        "statFemaleRatio"
      ).textContent = `${femaleRatio}%`;
      document.getElementById("statBlankEntries").textContent = blankEntries;

      // Reset carousel and show modal
      currentChartSlide = 0;
      showSlide(currentChartSlide); // Ensure first slide is shown
      if (domElements.dashboardModal) {
        domElements.dashboardModal.style.display = "block";
        // Add class after display to trigger animation
        requestAnimationFrame(() => {
          domElements.dashboardModal.classList.add("fade-in-modal");
        });
      }
    } catch (e) {
      console.error("Error generating dashboard:", e);
      showToast(translate("toastDashErr"), "error");
    } finally {
      hideLoader();
    }
  }, 50); // setTimeout allows loader to show
}
function renderGenderChart(data) {
  const ctx = document.getElementById("genderChart")?.getContext("2d");
  if (!ctx) return;

  // Translate the keys (e.g., "optGenderMale") to display labels ("Male")
  const translatedLabels = Object.keys(data).map((key) => translate(key));
  const chartData = Object.values(data);
  const backgroundColors = [
    // Define consistent colors
    "rgba(54, 162, 235, 0.7)", // Blue
    "rgba(255, 99, 132, 0.7)", // Pink
    "rgba(255, 206, 86, 0.7)", // Yellow
    "rgba(75, 192, 192, 0.7)", // Teal
    "rgba(153, 102, 255, 0.7)", // Purple
    "rgba(255, 159, 64, 0.7)", // Orange
  ];

  genderChartInstance = new Chart(ctx, {
    type: "pie",
    data: {
      labels: translatedLabels,
      datasets: [
        {
          label: translate("DashboardGenderTitle"), // Use translated title
          data: chartData,
          backgroundColor: backgroundColors.slice(0, chartData.length), // Use defined colors
          borderColor: backgroundColors.map((c) => c.replace("0.7", "1")), // Make border opaque
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // Allow chart to fill container height
      plugins: {
        title: { display: true, text: translate("DashboardGenderTitle") },
        legend: { position: "top" },
      },
    },
  });
}
function renderBranchChart(data) {
  const ctx = document.getElementById("branchChart")?.getContext("2d");
  if (!ctx) return;
  const labels = Object.keys(data);
  const chartData = Object.values(data);
  const bgColor = "rgba(75, 192, 192, 0.7)"; // Teal

  branchChartInstance = new Chart(ctx, {
    type: "bar", // Horizontal bar chart
    data: {
      labels: labels,
      datasets: [
        {
          label: "Entries", // Simple label
          data: chartData,
          backgroundColor: bgColor,
          borderColor: bgColor.replace("0.7", "1"),
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y", // Make it horizontal
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: translate("DashboardBranchTitle") },
        legend: { display: false }, // Hide legend for single dataset bar chart
      },
      scales: {
        x: { beginAtZero: true }, // Ensure X-axis starts at 0
      },
    },
  });
}
function renderPartnerChart(data) {
  const ctx = document.getElementById("partnerChart")?.getContext("2d");
  if (!ctx) return;
  const labels = Object.keys(data);
  const chartData = Object.values(data);
  // Use same colors as gender chart for consistency, or define new set
  const backgroundColors = [
    "rgba(255, 159, 64, 0.7)", // Orange
    "rgba(153, 102, 255, 0.7)", // Purple
    "rgba(75, 192, 192, 0.7)", // Teal
    "rgba(255, 99, 132, 0.7)", // Pink
    "rgba(54, 162, 235, 0.7)", // Blue
    "rgba(255, 206, 86, 0.7)", // Yellow
  ];

  partnerChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          label: translate("DashboardPartnerTitle"),
          data: chartData,
          backgroundColor: backgroundColors.slice(0, chartData.length),
          borderColor: backgroundColors.map((c) => c.replace("0.7", "1")),
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: { display: true, text: translate("DashboardPartnerTitle") },
        legend: { position: "top" },
      },
    },
  });
}

// --- Dashboard Carousel Logic ---
function showSlide(index) {
  if (!domElements.dashboardCarouselSlides) return;
  const slides =
    domElements.dashboardCarouselSlides.querySelectorAll(".chart-slide");
  const totalSlides = slides.length;
  if (totalSlides === 0) return; // No slides to show

  // Clamp index within bounds [0, totalSlides - 1]
  if (index >= totalSlides) index = totalSlides - 1;
  if (index < 0) index = 0;

  currentChartSlide = index; // Update global state

  // Apply CSS transform to move the slides container
  const offset = -index * 100; // Calculate percentage offset
  domElements.dashboardCarouselSlides.style.transform = `translateX(${offset}%)`;

  // Update navigation button states
  if (domElements.prevChartButton)
    domElements.prevChartButton.disabled = index === 0;
  if (domElements.nextChartButton)
    domElements.nextChartButton.disabled = index === totalSlides - 1;
}
function nextSlide() {
  showSlide(currentChartSlide + 1);
}
function prevSlide() {
  showSlide(currentChartSlide - 1);
}

// --- Fullscreen ---
function toggleFullscreen() {
  if (!domElements.tableContainer) {
    console.error(
      "Target element for fullscreen ('tableContainer') not found."
    );
    return;
  }
  // Check if currently in fullscreen *for this element*
  if (!document.fullscreenElement) {
    // Request fullscreen for the table container
    domElements.tableContainer.requestFullscreen().catch((err) => {
      showToast(
        translate("toastFullscreenErr", { message: err.message }),
        "error"
      );
      console.error(`Fullscreen request failed: ${err.message} (${err.name})`);
    });
  } else {
    // Exit fullscreen if active
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}
function updateFullscreenButtonText() {
  if (!domElements.fullscreenButton) return;
  // Check if the specific table container is the fullscreen element
  const isFullscreen =
    document.fullscreenElement === domElements.tableContainer;
  const span = domElements.fullscreenButton.querySelector("span");
  const icon = domElements.fullscreenButton.querySelector("i");

  if (isFullscreen) {
    if (span) span.textContent = translate("btnExitFullscreen");
    if (icon) icon.className = "fas fa-compress"; // Change icon to compress
  } else {
    if (span) span.textContent = translate("btnFullscreen");
    if (icon) icon.className = "fas fa-expand"; // Change icon to expand
  }
}
// Listen for fullscreen changes globally to update the button
document.addEventListener("fullscreenchange", updateFullscreenButtonText);

// --- Admin Functionality ---
function handleAdminButtonClick() {
  if (!domElements.adminLoginModal || !domElements.adminLoginForm) return;
  domElements.adminLoginForm.reset(); // Clear previous attempts
  domElements.adminLoginModal.style.display = "block";
  requestAnimationFrame(() => {
    // Animate after display
    domElements.adminLoginModal.classList.add("fade-in-modal");
  });
  if (domElements.adminUsernameInput) domElements.adminUsernameInput.focus();
}
function handleAdminLogin(event) {
  event.preventDefault(); // Prevent form submission reload
  if (
    !domElements.adminLoginForm ||
    !domElements.adminLoginModal ||
    !domElements.adminEditModal ||
    !domElements.adminUsernameInput ||
    !domElements.adminPasswordInput
  )
    return; // Ensure elements exist

  const username = domElements.adminUsernameInput.value;
  const password = domElements.adminPasswordInput.value;

  // *** INSECURE HARDCODED CHECK - ONLY FOR LOCAL USE AS STATED BY USER ***
  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    domElements.adminLoginModal.style.display = "none";
    domElements.adminLoginModal.classList.remove("fade-in-modal");

    populateAdminEditPanel(); // Prepare the edit panel

    domElements.adminEditModal.style.display = "block";
    requestAnimationFrame(() => {
      // Animate after display
      domElements.adminEditModal.classList.add("fade-in-modal");
    });

    showToast(translate("toastLoginSuccess"), "success");
  } else {
    showToast(translate("toastLoginFail"), "error");
    domElements.adminLoginForm.reset(); // Clear form on failure
    domElements.adminUsernameInput.focus(); // Focus username again
  }
}
function populateAdminEditPanel() {
  if (!domElements.adminEditGrid || !partnerConfig) return;
  domElements.adminEditGrid.innerHTML = ""; // Clear previous content

  Object.keys(partnerConfig).forEach((entryType) => {
    // Try to get a translated name for the entry type (e.g., "Tele Health 365")
    const typeKey = `optEntryType${
      entryType.charAt(0).toUpperCase() + entryType.slice(1).replace(/_/g, "")
    }`;
    const typeLabelText = translate(typeKey); // Use translated key if found
    const displayType = typeLabelText !== typeKey ? typeLabelText : entryType; // Fallback to raw key

    partnerConfig[entryType].forEach((partner, index) => {
      const groupDiv = document.createElement("div");
      groupDiv.className = "admin-partner-group";

      const nameInputId = `adminName-${entryType}-${partner.id}`;
      const amountInputId = `adminAmount-${entryType}-${partner.id}`;

      // Use translated labels/titles for fields within the admin panel
      groupDiv.innerHTML = `
        <h5>${displayType} - Partner ${index + 1} (ID: ${partner.id})</h5>
        <div class="form-field admin-field">
          <label for="${nameInputId}" data-translate-key="titleAdminPartnerName">${translate(
        "titleAdminPartnerName"
      )}:</label>
          <input type="text" id="${nameInputId}" data-partner-id="${
        partner.id
      }" data-partner-type="${entryType}" value="${partner.name}" required>
        </div>
        <div class="form-field admin-field">
          <label for="${amountInputId}" data-translate-key="titleAdminPartnerAmount">${translate(
        "titleAdminPartnerAmount"
      )}:</label>
          <input type="number" id="${amountInputId}" data-partner-id="${
        partner.id
      }" data-partner-type="${entryType}" value="${
        partner.subscriptionAmount
      }" min="0" step="any" required>
        </div>
      `;
      domElements.adminEditGrid.appendChild(groupDiv);
    });
  });
}
function handleAdminSaveChanges(event) {
  event.preventDefault(); // Prevent form submission
  if (!domElements.adminEditGrid) return;

  let hasChanges = false;
  let isValid = true;

  // Clear previous validation styles
  domElements.adminEditGrid
    .querySelectorAll("input")
    .forEach((input) => (input.style.borderColor = ""));

  // Iterate through all input fields in the admin grid
  domElements.adminEditGrid
    .querySelectorAll("input[data-partner-id]")
    .forEach((input) => {
      if (!isValid) return; // Stop checking if already found invalid

      const partnerId = input.dataset.partnerId;
      const partnerType = input.dataset.partnerType;
      const isNameField = input.id.includes("Name"); // Check if it's the name or amount field

      // Find the corresponding partner object in the config
      const partnerIndex = partnerConfig[partnerType]?.findIndex(
        (p) => p.id === partnerId
      );

      if (partnerIndex === -1 || partnerIndex === undefined) {
        console.error(
          `Admin Save Error: Partner ${partnerId} of type ${partnerType} not found in config.`
        );
        isValid = false;
        showToast(
          translate("toastGenericErr") + ` (Partner ${partnerId} mismatch)`,
          "error"
        );
        return;
      }

      let partner = partnerConfig[partnerType][partnerIndex];
      let newValue;

      if (isNameField) {
        // Validate and update name
        newValue = input.value.trim();
        if (!newValue) {
          // Name cannot be empty
          showToast(translate("toastAdminSaveValidation"), "warning");
          input.style.borderColor = "var(--danger-color)";
          if (isValid) input.focus(); // Focus first invalid field
          isValid = false;
          return;
        }
        if (partner.name !== newValue) {
          partner.name = newValue;
          hasChanges = true; // Mark that a change occurred
        }
      } else {
        // Validate and update amount
        newValue = parseFloat(input.value);
        if (isNaN(newValue) || newValue < 0) {
          // Amount must be a non-negative number
          showToast(translate("toastAdminSaveValidation"), "warning");
          input.style.borderColor = "var(--danger-color)";
          if (isValid) input.focus();
          isValid = false;
          return;
        }
        // Compare as numbers
        if (Number(partner.subscriptionAmount) !== newValue) {
          partner.subscriptionAmount = newValue;
          hasChanges = true; // Mark that a change occurred
        }
      }
    });

  // If validation failed, stop here
  if (!isValid) return;

  // If changes were detected, save and update UI
  if (hasChanges) {
    savePartnerData(); // Save updated config to localStorage
    // Update partner dropdown in main form if entry type select exists
    if (domElements.entryTypeSelect) {
      populatePartnerDropdown(domElements.entryTypeSelect.value);
    }
    renderTable(); // Re-render main table to reflect potential partner name/amount changes
    showToast(translate("toastAdminSaveSuccess"), "success");
  } else {
    showToast(translate("toastAdminSaveNoChange"), "info"); // Inform user no changes were made
  }

  // Close the admin edit modal
  if (domElements.adminEditModal) {
    domElements.adminEditModal.style.display = "none";
    domElements.adminEditModal.classList.remove("fade-in-modal");
  }
}

// --- Utility Functions ---
function enableAllMicButtons() {
  document.querySelectorAll(".mic-button").forEach((btn) => {
    btn.disabled = false;
    btn.classList.remove("listening");
  });
}
function disableAllMicButtons() {
  document.querySelectorAll(".mic-button").forEach((btn) => {
    btn.disabled = true;
    btn.classList.remove("listening"); // Ensure listening class is removed if disabling forcefully
  });
}

// --- Event Listeners Setup ---
function setupEventListeners() {
  // Global UI Controls
  if (domElements.languageSwitcher)
    domElements.languageSwitcher.addEventListener("change", (e) =>
      setLanguage(e.target.value)
    );
  if (domElements.themeToggleButton)
    domElements.themeToggleButton.addEventListener("click", toggleTheme);
  if (domElements.toggleDataEntryModeButton)
    domElements.toggleDataEntryModeButton.addEventListener(
      "click",
      toggleDataEntryMode
    );
  if (domElements.fullscreenButton)
    domElements.fullscreenButton.addEventListener("click", toggleFullscreen);

  // Form Specific Listeners
  if (domElements.form) {
    // Handle form reset event
    domElements.form.addEventListener("reset", () => {
      // Use setTimeout to allow native reset to complete first
      setTimeout(() => {
        clearFormValidationStyles();
        applyRequiredAttributes(); // Reapply required after reset
        if (domElements.entryTypeSelect) {
          populatePartnerDropdown(domElements.entryTypeSelect.value); // Update partner dropdown based on reset type
        }
        if (domElements.editingIdInput) domElements.editingIdInput.value = ""; // Clear editing ID
        if (domElements.addEntryButton)
          // Reset button text
          domElements.addEntryButton.querySelector("span").textContent =
            translate("btnAddEntry");
      }, 0);
    });

    // Update partner dropdown when entry type changes
    if (domElements.entryTypeSelect) {
      domElements.entryTypeSelect.addEventListener("change", (e) => {
        populatePartnerDropdown(e.target.value);
        applyRequiredAttributes(); // Re-check required attributes for partner dropdown
      });
    }

    // Attach mic button listeners
    document
      .querySelectorAll(".mic-button")
      .forEach((b) => b.addEventListener("click", handleMicButtonClick));
    // Attach clean button listeners
    document
      .querySelectorAll(".clean-button")
      .forEach((b) => b.addEventListener("click", handleCleanButtonClick));

    // Add/Update button listener
    if (domElements.addEntryButton)
      domElements.addEntryButton.addEventListener(
        "click",
        handleAddOrUpdateEntry
      );

    // Explicit clear button listener (supplements reset type)
    if (domElements.clearFormButton)
      domElements.clearFormButton.addEventListener("click", clearForm); // Might be redundant if type="reset", but ensures our logic runs
  }

  // Image Handling Listeners
  if (domElements.uploadImageButton)
    domElements.uploadImageButton.addEventListener(
      "click",
      handleImageUploadTrigger
    );
  if (domElements.imageUploadInput)
    domElements.imageUploadInput.addEventListener("change", handleImageFiles);
  if (domElements.toggleImageViewerButton)
    domElements.toggleImageViewerButton.addEventListener(
      "click",
      toggleImageViewer
    );
  if (domElements.prevImageButton)
    domElements.prevImageButton.addEventListener("click", showPrevImage);
  if (domElements.nextImageButton)
    domElements.nextImageButton.addEventListener("click", showNextImage);

  // Data Table Listeners (using event delegation on thead and tbody)
  if (domElements.dataTableHead) {
    domElements.dataTableHead.addEventListener("click", (event) => {
      // Find the clicked header cell with a sort key
      const header = event.target.closest("th[data-sort-key]");
      if (header) {
        sortData(header.dataset.sortKey); // Trigger sort
      }
    });
  }
  if (domElements.tableBody) {
    domElements.tableBody.addEventListener("click", (e) => {
      // Find the closest button element that was clicked
      const button = e.target.closest("button");
      if (!button) return; // Exit if click wasn't on or inside a button

      if (button.classList.contains("edit-btn")) {
        handleEditEntry(button.dataset.id);
      } else if (button.classList.contains("delete-btn")) {
        handleDeleteEntry(button.dataset.id);
      }
    });
  }

  // Export/Action Buttons
  if (domElements.saveExcelButton)
    domElements.saveExcelButton.addEventListener("click", handleSaveToExcel);
  if (domElements.saveCsvButton)
    domElements.saveCsvButton.addEventListener("click", handleSaveToCSV);
  if (domElements.savePdfButton)
    domElements.savePdfButton.addEventListener("click", handleSaveToPDF);

  // Dashboard Listeners
  if (domElements.dashboardButton)
    domElements.dashboardButton.addEventListener("click", generateDashboard);
  if (domElements.closeDashboardButton)
    domElements.closeDashboardButton.addEventListener("click", () => {
      if (domElements.dashboardModal) {
        domElements.dashboardModal.style.display = "none";
        domElements.dashboardModal.classList.remove("fade-in-modal");
      }
    });
  if (domElements.prevChartButton)
    domElements.prevChartButton.addEventListener("click", prevSlide);
  if (domElements.nextChartButton)
    domElements.nextChartButton.addEventListener("click", nextSlide);

  // Admin Listeners
  if (domElements.adminButton)
    domElements.adminButton.addEventListener("click", handleAdminButtonClick);
  if (domElements.closeAdminLoginButton)
    domElements.closeAdminLoginButton.addEventListener("click", () => {
      if (domElements.adminLoginModal) {
        domElements.adminLoginModal.style.display = "none";
        domElements.adminLoginModal.classList.remove("fade-in-modal");
      }
    });
  if (domElements.adminLoginForm)
    domElements.adminLoginForm.addEventListener("submit", handleAdminLogin);
  if (domElements.closeAdminEditButton)
    domElements.closeAdminEditButton.addEventListener("click", () => {
      if (domElements.adminEditModal) {
        domElements.adminEditModal.style.display = "none";
        domElements.adminEditModal.classList.remove("fade-in-modal");
      }
    });
  if (domElements.adminEditForm)
    domElements.adminEditForm.addEventListener(
      "submit",
      handleAdminSaveChanges
    );

  // Modal Click Outside Listener (closes modals if click is on the overlay)
  window.addEventListener("click", (e) => {
    if (domElements.dashboardModal && e.target == domElements.dashboardModal) {
      domElements.dashboardModal.style.display = "none";
      domElements.dashboardModal.classList.remove("fade-in-modal");
    }
    if (
      domElements.adminLoginModal &&
      e.target == domElements.adminLoginModal
    ) {
      domElements.adminLoginModal.style.display = "none";
      domElements.adminLoginModal.classList.remove("fade-in-modal");
    }
    if (domElements.adminEditModal && e.target == domElements.adminEditModal) {
      domElements.adminEditModal.style.display = "none";
      domElements.adminEditModal.classList.remove("fade-in-modal");
    }
  });
} // End setupEventListeners
