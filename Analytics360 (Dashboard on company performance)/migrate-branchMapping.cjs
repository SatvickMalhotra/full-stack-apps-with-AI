const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc, setDoc, writeBatch } = require('firebase/firestore');
const XLSX = require('xlsx');
const path = require('path');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCwzCvYAcbRM0e7u6kgYy_21YAGvXUA6es",
  authDomain: "utilizationpage.firebaseapp.com",
  projectId: "utilizationpage",
  storageBucket: "utilizationpage.firebasestorage.app",
  messagingSenderId: "92425443246",
  appId: "1:92425443246:web:cb3255454e583ce67b1a3f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function deleteAllBranchMappings() {
  console.log('\n=== STEP 1: DELETING OLD BRANCH MAPPINGS ===\n');

  const collectionRef = collection(db, 'branchMapping');
  const snapshot = await getDocs(collectionRef);

  console.log(`Found ${snapshot.docs.length} documents to delete...`);

  // Delete in batches of 500 (Firestore limit)
  const batchSize = 500;
  let deleted = 0;

  for (let i = 0; i < snapshot.docs.length; i += batchSize) {
    const batch = writeBatch(db);
    const docsToDelete = snapshot.docs.slice(i, i + batchSize);

    docsToDelete.forEach(docSnapshot => {
      batch.delete(docSnapshot.ref);
    });

    await batch.commit();
    deleted += docsToDelete.length;
    console.log(`Deleted ${deleted}/${snapshot.docs.length} documents...`);
  }

  console.log(`\n✓ Successfully deleted all ${deleted} documents!\n`);
}

function readAndGroupExcelData() {
  console.log('\n=== STEP 2: READING AND GROUPING EXCEL DATA ===\n');

  const filePath = path.join('D:', 'M-SWASTH', 'consult and policy', 'raw data', 'Book1.xlsx');
  console.log('Reading file:', filePath);

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet);

  console.log(`Total rows in Excel: ${data.length}`);

  // Group by clinicCode
  const grouped = {};

  data.forEach(row => {
    const clinicCode = row.clinicCode;

    if (!grouped[clinicCode]) {
      grouped[clinicCode] = {
        pinCode: String(row.pinCode || ''),
        state: row.state || '',
        entries: []
      };
    }

    // Add entry with consultation field
    grouped[clinicCode].entries.push({
      channelName: row.channelName || '',
      branchName: row.branchName || '',
      activeBase: Number(row.activeBase) || 0,
      totalBase: Number(row.totalBase) || 0,
      consultation: 0  // Default consultation to 0
    });
  });

  const clinicCodes = Object.keys(grouped);
  console.log(`Unique clinic codes: ${clinicCodes.length}`);

  // Show sample
  const sampleCode = clinicCodes[0];
  console.log(`\nSample document (${sampleCode}):`);
  console.log(JSON.stringify(grouped[sampleCode], null, 2));

  return grouped;
}

async function uploadNewStructure(groupedData) {
  console.log('\n=== STEP 3: UPLOADING NEW STRUCTURE ===\n');

  const clinicCodes = Object.keys(groupedData);
  console.log(`Uploading ${clinicCodes.length} documents...`);

  // Upload in batches of 500
  const batchSize = 500;
  let uploaded = 0;

  for (let i = 0; i < clinicCodes.length; i += batchSize) {
    const batch = writeBatch(db);
    const codesInBatch = clinicCodes.slice(i, i + batchSize);

    codesInBatch.forEach(clinicCode => {
      const docRef = doc(db, 'branchMapping', clinicCode);
      batch.set(docRef, groupedData[clinicCode]);
    });

    await batch.commit();
    uploaded += codesInBatch.length;
    console.log(`Uploaded ${uploaded}/${clinicCodes.length} documents...`);
  }

  console.log(`\n✓ Successfully uploaded ${uploaded} documents!\n`);
}

async function main() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║     M-SWASTH Branch Mapping Migration Script            ║');
  console.log('║     Converting flat structure to nested structure       ║');
  console.log('╚══════════════════════════════════════════════════════════╝');

  try {
    // Step 1: Delete all existing documents
    await deleteAllBranchMappings();

    // Step 2: Read Excel and group by clinicCode
    const groupedData = readAndGroupExcelData();

    // Step 3: Upload new structure
    await uploadNewStructure(groupedData);

    console.log('╔══════════════════════════════════════════════════════════╗');
    console.log('║     ✓ MIGRATION COMPLETED SUCCESSFULLY!                 ║');
    console.log('╚══════════════════════════════════════════════════════════╝');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();
