// Script to analyze mapLocator collection and compare with branchMapping
const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('D:/M-SWASTH/consult and policy/utilizationpage-firebase-adminsdk-fbsvc-c964af1f7f.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function analyzeData() {
  console.log('='.repeat(60));
  console.log('ANALYZING FIREBASE DATA');
  console.log('='.repeat(60));

  // Fetch branchMapping collection
  console.log('\n📊 Fetching branchMapping collection...');
  const branchMappingSnapshot = await db.collection('branchMapping').get();
  const branchClinicCodes = new Set();
  branchMappingSnapshot.docs.forEach(doc => {
    branchClinicCodes.add(doc.id);
  });
  console.log(`Total clinics in branchMapping: ${branchClinicCodes.size}`);

  // Fetch mapLocator collection
  console.log('\n📊 Fetching mapLocator collection...');
  const mapLocatorSnapshot = await db.collection('mapLocator').get();
  const mapLocators = mapLocatorSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  console.log(`Total documents in mapLocator: ${mapLocators.length}`);

  // Get unique clinic codes from mapLocator
  const mapLocatorClinicCodes = new Set();
  mapLocators.forEach(loc => {
    if (loc.clinicCode) mapLocatorClinicCodes.add(loc.clinicCode);
  });
  console.log(`Unique clinic codes in mapLocator: ${mapLocatorClinicCodes.size}`);

  // Find clinics in branchMapping but NOT in mapLocator
  const clinicsNotInMapLocator = [...branchClinicCodes].filter(code => !mapLocatorClinicCodes.has(code));
  console.log(`\n⚠️ Clinics in branchMapping but NOT in mapLocator: ${clinicsNotInMapLocator.length}`);

  // Analyze nurseType field
  console.log('\n' + '='.repeat(60));
  console.log('NURSE TYPE ANALYSIS');
  console.log('='.repeat(60));

  const nurseTypeCount = {};
  let nullCount = 0;
  let emptyCount = 0;
  let undefinedCount = 0;

  mapLocators.forEach(loc => {
    const nurseType = loc.nurseType;

    if (nurseType === null) {
      nullCount++;
    } else if (nurseType === undefined) {
      undefinedCount++;
    } else if (nurseType === '' || nurseType.trim() === '') {
      emptyCount++;
    } else {
      nurseTypeCount[nurseType] = (nurseTypeCount[nurseType] || 0) + 1;
    }
  });

  console.log('\nNurse Type breakdown:');
  console.log('-'.repeat(40));

  let totalWithValue = 0;
  Object.entries(nurseTypeCount).sort((a, b) => b[1] - a[1]).forEach(([type, count]) => {
    console.log(`  "${type}": ${count}`);
    totalWithValue += count;
  });

  console.log('-'.repeat(40));
  console.log(`  [null]: ${nullCount}`);
  console.log(`  [undefined]: ${undefinedCount}`);
  console.log(`  [empty string]: ${emptyCount}`);
  console.log('-'.repeat(40));
  console.log(`  TOTAL with value: ${totalWithValue}`);
  console.log(`  TOTAL without value: ${nullCount + undefinedCount + emptyCount}`);
  console.log(`  GRAND TOTAL: ${totalWithValue + nullCount + undefinedCount + emptyCount}`);

  // Analyze ALL extra filter fields
  console.log('\n' + '='.repeat(60));
  console.log('ALL EXTRA FILTER FIELDS ANALYSIS');
  console.log('='.repeat(60));

  const fields = ['clinicType', 'region', 'tlName', 'nurseName', 'dcName', 'status', 'nurseType'];

  for (const field of fields) {
    const valueCount = {};
    let missing = 0;

    mapLocators.forEach(loc => {
      const value = loc[field];
      if (value === null || value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')) {
        missing++;
      } else {
        valueCount[value] = (valueCount[value] || 0) + 1;
      }
    });

    const uniqueValues = Object.keys(valueCount).length;
    const totalWithValues = Object.values(valueCount).reduce((a, b) => a + b, 0);

    console.log(`\n📌 ${field}:`);
    console.log(`   Unique values: ${uniqueValues}`);
    console.log(`   Records with value: ${totalWithValues}`);
    console.log(`   Records missing value: ${missing}`);

    if (uniqueValues <= 10) {
      console.log('   Values:');
      Object.entries(valueCount).sort((a, b) => b[1] - a[1]).forEach(([val, count]) => {
        console.log(`     "${val}": ${count}`);
      });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));
  console.log(`\nbranchMapping clinics: ${branchClinicCodes.size}`);
  console.log(`mapLocator unique clinics: ${mapLocatorClinicCodes.size}`);
  console.log(`Clinics ONLY in branchMapping: ${clinicsNotInMapLocator.length}`);
  console.log(`\n⚡ This explains why extra filters show fewer results!`);
  console.log(`   Extra filters can only filter clinics that exist in mapLocator.`);
  console.log(`   ${clinicsNotInMapLocator.length} clinics have no mapLocator data.`);

  process.exit(0);
}

analyzeData().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
