// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
// import { getDatabase, ref as dbRef, set,doc ,docRef} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "AIzaSyA0OIPqPpYcLyyBAci9UWx-95QIVtwtRik",
//   authDomain: "mswasth-21df5.firebaseapp.com",
//   databaseURL: "https://mswasth-21df5-default-rtdb.firebaseio.com",
//   projectId: "mswasth-21df5",
//   storageBucket: "mswasth-21df5.appspot.com",
//   messagingSenderId: "281245658334",
//   appId: "1:281245658334:web:7a4443d4f4821e00f8e64f",
// };

// // Initialize Firebase
// const firebaseApp = initializeApp(firebaseConfig);

// // Get a reference to the database service
// const db = getDatabase(firebaseApp);

// // Function to add employee IDs to Firebase Database
// //function addEmployeeIdsToDatabase() {
//   const employeeIdss = [
//     "MS00147", "MS00148", "MS00149", "MS01699", "MS01514", "MS00233", "MSO1507",
//     "MS01568", "MS01525", "MS00237", "MS00277", "MS00302", "MS00303", "MS00309",
//     "MS00317", "MS00318", "MS00319", "MS00320", "MS00322", "MS00324", "MS00354",
//     "MS00355", "MS01698", "MS01703", "MS00364", "MS00370", "MS00371", "MS00372",
//     "MS00374", "MS00394", "MS00399", "MS00401", "MS00409", "MS00410", "MS00454",
//     "MS00457", "MS00475", "MS00501", "MS00505", "MS00512", "MS00521", "MS00549",
//     "MS00589", "MS00625", "MS00639", "MS00661", "MS00662", "MS00664", "MS00680",
//     "MS00701", "MS00703", "MS00704", "MS00705", "MS00730", "MS00784", "MS00824",
//     "MS00830", "MS00864", "MS00885", "MS00909", "MS00939", "MS00983", "MS00985",
//     "MS01003", "MS01025", "MS01041", "MS01054", "MS01055", "MS01057", "MS01060",
//     "MS01078", "MS01094", "MS01101", "MS01119", "MS01121", "MS01134", "MS01142",
//     "MS01156", "MS01190", "MS01195", "MS01269", "MS01271", "MS01274", "MS01276",
//     "MS01302", "MS01339", "MS01341", "MS01346", "MS01395", "MS01411", "MS01436",
//     "MS01453", "MS01456", "MS01459", "MS01466", "MS01476", "MS01499", "MS01504",
//     "MS01505", "MS01508", "MS01509", "MS01513", "MS01535", "MS01549", "MS01558",
//     "MS02530"
//   ];


// async function storeEmployeeIds(employeeIdss) {
//   try {
//     for (const employeeId of employeeIdss) {
//       const docRef = doc(db, "employeeIds", employeeId);
//       await setDoc(docRef, {
//         empid: employeeId
//       });
//       console.log(`Employee ID ${employeeId} added to the database`);
//     }
//   } catch (error) {
//     console.error("Error adding employee IDs: ", error);
//   }
// }


// storeEmployeeIds(employeeIdss);




//   // Iterate through employeeIds and add them to the database
//   employeeIds.forEach(employeeId => {
//     set(dbRef(db, `employeeIds/${employeeId}`), {
//       empid: employeeId
//     }).then(() => {
//       console.log(`Employee ID ${employeeId} added to the database`);
//     }).catch(error => {
//       console.error(`Error adding employee ID ${employeeId}: `, error);
//     });
//   });
// }

// // Call the function to add employee IDs to the database
// addEmployeeIdsToDatabase();



// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
// import { getDatabase, ref as dbRef, set } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "mswasth-21df5.firebaseapp.com",
//   projectId: "mswasth-21df5",
//   databaseURL: "https://mswasth-21df5-default-rtdb.firebaseio.com",
//   storageBucket: "mswasth-21df5.appspot.com",
//   messagingSenderId: "281245658334",
//   appId: "1:281245658334:web:7a4443d4f4821e00f8e64f",
// };

// // Initialize Firebase
// const firebaseApp = initializeApp(firebaseConfig);

// // Initialize Firestore
// const db = getDatabase(firebaseApp);

// // Function to add partner names to Firestore
// function addPartnerNamesToFirestore() {
//   const partnerNames = [
//     "Cashpor", "Muthoot", "Svatantra", "Namra Finance", "Utkarsh SFB", "TATA Capital",
//     "North East Small Finance Bank", "Pahal Finance", "Adi Chitragupta Finance Limited",
//     "Bangia Gramin Vikas Bank", "Uttrayan", "Satya Microcapital", "Humana Financial Services",
//     "VFS", "Swarnodhayam Credits Pvt Ltd", "NABFINS Limited", "Paschim Banga Gramin Bank",
//     "Share India Fincap", "SEBA RAHARA", "Uttar Banga Kshetriya Garmin Bank", "Annapurna",
//     "Bank of India", "Uttar Bihar Gramin Bank", "Servitium Micro Finance Pvt Ltd",
//     "Sonata Finance", "ESAF HEALTH CARE SERVICES PVT LTD", "CCFID", "Mitrata", "M-INSURE CHANNEL",
//     "Maharashtra Gramin Bank", "ASA International", "Arohan Financial Services Limited",
//     "APGVB", "Sugamya", "Midland Microfin", "Chhattisgarh Rajya Gramin Bank",
//     "Sampurna Training and Entrepreneurship Programme", "DCBS", "Hirbandh Ramkrishna Sarada Sevashrama",
//     "Indiabulls Housing Finance", "Sindhuja Microcredit", "Muthoot Capital",
//     "Sarala Development & Microfinance Pvt Ltd", "Madhyanchal Gramin Bank",
//     "Baghat Urban Co-op Bank Ltd", "People's Forum", "KBS Local Bank", "Janakalyan",
//     "Your Global Money", "Agora Microfinance", "Ambitions Services", "Kamal Fincap Private Limited",
//     "Maddox Consultancy Services Pvt Ltd", "AISSHPRA", "Rohtak Central Cooperative Bank",
//     "Projects", "Swabhimaan Sales & Services Pvt Ltd", "South India Finvest Pvt Ltd",
//     "Panchawati", "Pune District Central Co-op bank", "APGVB Pensioners Association",
//     "IFFCO Bazar", "Aviral Finance", "Shepays Financial Services Pvt Ltd", "DULAL NGO",
//     "Adhikosh Financial Advisory Pvt Ltd", "Aishwarya MACC Society Ltd", "Sudhir HUF",
//     "CBC", "North East Small Finance Bank - SHG"
//   ];

//   // Add each partner name to Firestore
//   partnerNames.forEach(partnerName => {
//     set(dbRef(db, `partnerNames/${partnerName}`), {
//       partnerName: partnerName
//     })
//     .then(docRef => {
//       console.log(`Partner ${partnerName} added with ID: ${docRef.id}`);
//     })
//     .catch(error => {
//       console.error(`Error adding partner ${partnerName}: `, error);
//     });
//   });
// }

// // Run the function to add partner names to Firestore
// addPartnerNamesToFirestore();
