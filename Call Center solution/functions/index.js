const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const axios = require("axios");
const cors = require("cors")({ origin: true });
require("dotenv").config();

admin.initializeApp();

/**
 * 🔐 Role-based Access Helper
 * Checks if the authenticated user has the required role.
 *
 * @param {object} request
 *   The function request (Firebase callable request).
 * @param {Array<string>} allowedRoles
 *   List of roles allowed to perform this action.
 * @return {string} The role of the user if authorized.
 */
function checkRole(request, allowedRoles) {
  if (!request.auth) {
    throw new HttpsError(
        "unauthenticated",
        "You must be logged in",
    );
  }

  const role = request.auth.token.role;

  if (!allowedRoles.includes(role)) {
    throw new HttpsError(
        "permission-denied",
        "You do not have permission to perform this action",
    );
  }

  return role;
}


/**
 * 👤 Create a new user (Enhanced for M-Swasth)
 * - Admin only
 * Creates both Firebase Auth user and Firestore document in the appropriate collection
 */
exports.createUser = onCall(async (request) => {
  // Debug logging
  console.log("createUser called");
  console.log("request.auth:", request.auth ? "EXISTS" : "MISSING");
  if (request.auth) {
    console.log("request.auth.uid:", request.auth.uid);
    console.log("request.auth.token:", request.auth.token);
  }

  checkRole(request, ["admin"]);

  const data = request.data;

  try {
    // Validate required fields
    if (!data.email || !data.password || !data.name || !data.collection) {
      throw new HttpsError(
          "invalid-argument",
          "Missing required fields: email, password, name, collection",
      );
    }

    // Validate collection name
    const validCollections = [
      "healthAgents",
      "insuranceAgents",
      "healthTeamLeads",
      "insuranceTeamLeads",
      "healthManagers",
      "insuranceManagers",
      "managers",              // For Department Managers
      "offlineVisits",         // For DC Agents and Offline Visits users
      "offlineVisitsManagers", // For Offline Visits Managers
    ];

    if (!validCollections.includes(data.collection)) {
      throw new HttpsError(
          "invalid-argument",
          `Invalid collection. Must be one of: ${validCollections.join(", ")}`,
      );
    }

    // Create Firebase Authentication user
    const userRecord = await admin.auth().createUser({
      email: data.email,
      password: data.password,
      displayName: data.name,
      phoneNumber: data.mobile ? `+91${data.mobile}` : undefined,
    });

    // Map display roles to system roles
    const roleMapping = {
      "Health Agent": "agent",
      "Insurance Agent": "agent",
      "DC Agent": "dc_agent",
      "Health TL": "teamlead",
      "Insurance TL": "teamlead",
      "Manager": "Manager",
      "Health Manager": "Manager",
      "Insurance Manager": "Manager",
      "Department Manager": "Manager",
      "Offline Visits": "offlineVisits",
      "Offline Visits Manager": "offlineVisitsManager",
    };

    // Get the system role from the display role
    const displayRole = data.role || "agent";
    const systemRole = roleMapping[displayRole] || "agent";

    // Set custom claims with system role
    await admin.auth().setCustomUserClaims(userRecord.uid, {role: systemRole});

    // Prepare Firestore document with display role
    const userData = {
      uid: userRecord.uid, // Add UID for Firestore rules
      name: data.name,
      email: data.email,
      mobile: data.mobile || "",
      empId: data.empId || "",
      role: displayRole, // Store display role in Firestore
      department: data.department || "",
      status: data.status || "Available",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: request.auth.uid,
    };

    // Add collection-specific fields
    if (data.teamLead) userData.teamLead = data.teamLead;
    if (data.manager) userData.manager = data.manager;
    if (data.teamMembers) userData.teamMembers = data.teamMembers;

    // Create Firestore document
    const docRef = data.empId ?
      admin.firestore().collection(data.collection).doc(data.empId) :
      admin.firestore().collection(data.collection).doc(userRecord.uid);

    await docRef.set(userData);

    // Create mapping in userCollections for login to work
    // This helps the login page find users stored with empId as document ID
    await admin.firestore().collection("userCollections").doc(userRecord.uid).set({
      collection: data.collection,
      documentId: data.empId || userRecord.uid,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {
      uid: userRecord.uid,
      empId: data.empId || userRecord.uid,
      message: `User ${data.name} created successfully in ${data.collection}`,
    };
  } catch (error) {
    console.error("Error creating user:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * ✏️ Update a user (Enhanced for M-Swasth)
 * - Admin only
 * Updates both Firebase Auth user and Firestore document
 */
exports.updateUser = onCall(async (request) => {
  checkRole(request, ["admin"]);

  const data = request.data;

  try {
    if (!data.uid || !data.collection) {
      throw new HttpsError(
          "invalid-argument",
          "Missing required fields: uid, collection",
      );
    }

    const updates = {};

    // Update Firebase Auth if email, password, or displayName changed
    const authUpdates = {};
    if (data.email) authUpdates.email = data.email;
    if (data.password) authUpdates.password = data.password;
    if (data.name) authUpdates.displayName = data.name;
    if (data.mobile) authUpdates.phoneNumber = `+91${data.mobile}`;

    if (Object.keys(authUpdates).length > 0) {
      await admin.auth().updateUser(data.uid, authUpdates);
    }

    // Update custom claims if role changed
    if (data.role) {
      await admin.auth().setCustomUserClaims(data.uid, {role: data.role});
      updates.role = data.role;
    }

    // Prepare Firestore updates
    if (data.name) updates.name = data.name;
    if (data.email) updates.email = data.email;
    if (data.mobile) updates.mobile = data.mobile;
    if (data.empId) updates.empId = data.empId;
    if (data.department) updates.department = data.department;
    if (data.status) updates.status = data.status;
    if (data.teamLead) updates.teamLead = data.teamLead;
    if (data.manager) updates.manager = data.manager;
    if (data.teamMembers) updates.teamMembers = data.teamMembers;

    updates.updatedAt = admin.firestore.FieldValue.serverTimestamp();
    updates.updatedBy = request.auth.uid;

    // Get the document ID (could be empId or uid)
    const docId = data.empId || data.uid;
    await admin.firestore().collection(data.collection).doc(docId).update(updates);

    return {
      uid: data.uid,
      message: `User updated successfully`,
    };
  } catch (error) {
    console.error("Error updating user:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * 🗑 Delete a user (Enhanced for M-Swasth)
 * - Admin only
 * Deletes both Firebase Auth user and Firestore document
 */
exports.deleteUser = onCall(async (request) => {
  checkRole(request, ["admin"]);

  const data = request.data;

  try {
    if (!data.uid || !data.collection) {
      throw new HttpsError(
          "invalid-argument",
          "Missing required fields: uid, collection",
      );
    }

    // Delete from Firebase Auth
    await admin.auth().deleteUser(data.uid);

    // Delete from Firestore
    const docId = data.empId || data.uid;
    await admin.firestore().collection(data.collection).doc(docId).delete();

    return {message: "User deleted successfully"};
  } catch (error) {
    console.error("Error deleting user:", error);
    throw new HttpsError("internal", error.message);
  }
});

/**
 * 🎭 Assign role to a user (agent, manager, admin)
 * - Admin only
 */
exports.assignRole = onCall(async (request) => {
  checkRole(request, ["admin"]);

  const data = request.data;

  try {
    // Update Firestore
    await admin.firestore().collection("users").doc(data.uid).update({
      role: data.role,
    });

    // Also set custom claims in Firebase Auth
    await admin.auth().setCustomUserClaims(data.uid, {role: data.role});

    return {message: `Role updated to ${data.role}`};
  } catch (error) {
    throw new HttpsError("internal", error.message);
  }
});

/**
 * 📞 Log a call
 * - Agents & Admins
 */
exports.logCall = onCall(async (request) => {
  checkRole(request, ["agent", "admin"]);

  const data = request.data;

  try {
    const logRef = await admin.firestore().collection("callLogs").add({
      userId: request.auth.uid,
      details: data.details,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });

    return {logId: logRef.id, message: "Call logged successfully"};
  } catch (error) {
    throw new HttpsError("internal", error.message);
  }
});

/**
 * 📊 Fetch reports
 * - Admin only
 */
exports.fetchReports = onCall(async (request) => {
  checkRole(request, ["admin"]);

  try {
    const snapshot = await admin.firestore().collection("callLogs").get();
    const reports = snapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

    return {reports};
  } catch (error) {
    throw new HttpsError("internal", error.message);
  }
});

/**
 * 📞 Exotel API Proxy
 * Proxies requests to Exotel API to avoid CORS issues
 */
exports.exotelProxy = onRequest((req, res) => {
  return cors(req, res, async () => {
    try {
      // Get Exotel credentials from environment variables
      const API_KEY = process.env.EXOTEL_API_KEY;
      const API_TOKEN = process.env.EXOTEL_API_TOKEN;

      if (!API_KEY || !API_TOKEN) {
        return res.status(500).json({
          error: "Exotel credentials not configured",
        });
      }

      // Extract the path after /exotelProxy/
      const exotelPath = req.path.substring(1);
      const url = `https://api.exotel.com/${exotelPath}`;

      console.log("Exotel API Request:", {
        method: req.method,
        url: url,
        body: req.body,
      });

      // Prepare request config
      const config = {
        method: req.method,
        url: url,
        auth: {
          username: API_KEY,
          password: API_TOKEN,
        },
        headers: {
          "Accept": "application/xml, application/json, */*",
        },
      };

      // For POST requests, send as form-urlencoded
      if (req.method === "POST" && req.body) {
        const params = new URLSearchParams();
        Object.keys(req.body).forEach((key) => {
          params.append(key, req.body[key]);
        });
        config.data = params.toString();
        config.headers["Content-Type"] = "application/x-www-form-urlencoded";
      }

      const response = await axios(config);

      console.log("Exotel API Response:", {
        status: response.status,
      });

      return res.status(response.status).send(response.data);
    } catch (error) {
      console.error("Exotel API Error:", error.message);
      if (error.response) {
        console.error("Error details:", {
          status: error.response.status,
          data: error.response.data,
        });
        return res.status(error.response.status).send(error.response.data);
      } else {
        return res.status(500).json({error: error.message});
      }
    }
  });
});
