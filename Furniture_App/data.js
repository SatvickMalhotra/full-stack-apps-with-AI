function _0x34e1() {
  const _0x1538b4 = [
    "1:719155230190:web:b5989e1779a51b9be28aff",
    "5zfaJPV",
    "Partner\x20names\x20fetched:",
    "324TkkPIj",
    "map",
    "No\x20employee\x20IDs\x20found",
    "datapartnernames",
    "No\x20partner\x20names\x20found",
    "Failed\x20to\x20fetch\x20data:",
    "setItem",
    "G-YT0GGE631Y",
    "1970040pZizdI",
    "Error\x20fetching\x20partner\x20names:\x20",
    "",
    "mswasth-reimbursement.firebaseapp.com",
    "16OEJpJy",
    "496441tgZGaj",
    "1101900WoLrvq",
    "employeeIds",
    "partnerName",
    "1330AXIrGR",
    "mswasth-reimbursement",
    "keys",
    "log",
    "1270717AHWFPL",
    "empid",
    "54QJaWKJ",
    "1463916ZfTQcO",
    "stringify",
    "1998TLwonU",
    "12137reKAya",
    "error",
    "all",
    "then",
    "val",
    "Error\x20fetching\x20employee\x20IDs:\x20",
  ];
  _0x34e1 = function () {
    return _0x1538b4;
  };
  return _0x34e1();
}
const _0x53317f = _0x1013;
(function (_0x1325c1, _0x137f81) {
  const _0x4defef = _0x1013,
    _0x1a7435 = _0x1325c1();
  while (!![]) {
    try {
      const _0xd92bdb =
        (parseInt(_0x4defef(0x1a2)) / 0x1) *
          (-parseInt(_0x4defef(0x19e)) / 0x2) +
        -parseInt(_0x4defef(0x195)) / 0x3 +
        (-parseInt(_0x4defef(0x19f)) / 0x4) *
          (parseInt(_0x4defef(0x185)) / 0x5) +
        -parseInt(_0x4defef(0x18f)) / 0x6 +
        (parseInt(_0x4defef(0x19c)) / 0x7) *
          (parseInt(_0x4defef(0x193)) / 0x8) +
        (-parseInt(_0x4defef(0x1a1)) / 0x9) *
          (-parseInt(_0x4defef(0x198)) / 0xa) +
        (parseInt(_0x4defef(0x194)) / 0xb) * (parseInt(_0x4defef(0x187)) / 0xc);
      if (_0xd92bdb === _0x137f81) break;
      else _0x1a7435["push"](_0x1a7435["shift"]());
    } catch (_0x3c7326) {
      _0x1a7435["push"](_0x1a7435["shift"]());
    }
  }
})(_0x34e1, 0x3626f);
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
const firebaseConfig = {
    apiKey: (0x191),
    authDomain: (0x192),
    projectId: (0x199),
    storageBucket: "..com",
    messagingSenderId: "",
    appId: (0x184),
    measurementId: (0x18e),
  },
  firebaseApp = initializeApp(firebaseConfig),
  db = getDatabase(firebaseApp);
async function fetchEmployeeIds() {
  const _0xb14af6 = _0x53317f;
  try {
    const _0x242891 = await get(ref(db, _0xb14af6(0x196)));
    if (_0x242891["exists"]()) {
      const _0x4618fb = _0x242891[_0xb14af6(0x182)]();
      return Object[_0xb14af6(0x19a)](_0x4618fb)[_0xb14af6(0x188)](
        (_0x410a8b) => _0x4618fb[_0x410a8b][_0xb14af6(0x19d)]
      );
    } else return console[_0xb14af6(0x19b)](_0xb14af6(0x189)), [];
  } catch (_0x17f464) {
    return console[_0xb14af6(0x1a3)](_0xb14af6(0x183), _0x17f464), [];
  }
}
async function fetchPartnerNames() {
  const _0x5a5177 = _0x53317f;
  try {
    const _0x2ab52b = await get(ref(db, "partnerNames"));
    if (_0x2ab52b["exists"]()) {
      const _0x18f4c5 = _0x2ab52b[_0x5a5177(0x182)]();
      return Object[_0x5a5177(0x19a)](_0x18f4c5)["map"](
        (_0x52a520) => _0x18f4c5[_0x52a520][_0x5a5177(0x197)]
      );
    } else return console[_0x5a5177(0x19b)](_0x5a5177(0x18b)), [];
  } catch (_0x59a03b) {
    return console["error"](_0x5a5177(0x190), _0x59a03b), [];
  }
}
function _0x1013(_0x146717, _0x2a30c5) {
  const _0x34e1a8 = _0x34e1();
  return (
    (_0x1013 = function (_0x101364, _0x434bf8) {
      _0x101364 = _0x101364 - 0x182;
      let _0x424009 = _0x34e1a8[_0x101364];
      return _0x424009;
    }),
    _0x1013(_0x146717, _0x2a30c5)
  );
}
Promise[_0x53317f(0x1a4)]([fetchEmployeeIds(), fetchPartnerNames()])
  [_0x53317f(0x1a5)](([_0x4290d8, _0x132a05]) => {
    const _0x5b2024 = _0x53317f;
    console[_0x5b2024(0x19b)]("Employee\x20IDs\x20fetched:", _0x4290d8),
      console[_0x5b2024(0x19b)](_0x5b2024(0x186), _0x132a05),
      localStorage[_0x5b2024(0x18d)](
        "dataemployeeids",
        JSON[_0x5b2024(0x1a0)](_0x4290d8)
      ),
      localStorage[_0x5b2024(0x18d)](
        _0x5b2024(0x18a),
        JSON[_0x5b2024(0x1a0)](_0x132a05)
      );
  })
  ["catch"]((_0x34721d) => {
    const _0x4bdce8 = _0x53317f;
    console[_0x4bdce8(0x1a3)](_0x4bdce8(0x18c), _0x34721d);
  });
