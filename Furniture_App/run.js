// import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
// import { getDatabase, ref as dbRef, set,doc ,docRef} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-database.js";

// // Firebase configuration
// const firebaseConfig = {
//   apiKey: "-",
//   authDomain: "-..com",
//   databaseURL: "https://--.com",
//   projectId: "-21df5",
//   storageBucket: "-21df5..com",
//   messagingSenderId: "",
//   appId: "1::web:",
// };

// // Initialize Firebase
// const firebaseApp = initializeApp(firebaseConfig);

// // Get a reference to the database service
// const db = getDatabase(firebaseApp);

// // Function to add employee IDs to Firebase Database
// //function addEmployeeIdsToDatabase() {
//   const employeeIdss = [
//     "
//     "", "", "", "", "", "", "MS01558",
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
//     
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
