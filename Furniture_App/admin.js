const _0x5b83ae = _0x4906;
(function (_0x3ba11f, _0x65c394) {
  const _0x5eabd3 = _0x4906,
    _0x7c362d = _0x3ba11f();
  while (!![]) {
    try {
      const _0x2bd878 =
        -parseInt(_0x5eabd3(0x115)) / 0x1 +
        (-parseInt(_0x5eabd3(0x12f)) / 0x2) *
          (-parseInt(_0x5eabd3(0x136)) / 0x3) +
        parseInt(_0x5eabd3(0x140)) / 0x4 +
        (parseInt(_0x5eabd3(0x167)) / 0x5) *
          (parseInt(_0x5eabd3(0x162)) / 0x6) +
        parseInt(_0x5eabd3(0x119)) / 0x7 +
        parseInt(_0x5eabd3(0x132)) / 0x8 +
        (-parseInt(_0x5eabd3(0x116)) / 0x9) *
          (parseInt(_0x5eabd3(0x149)) / 0xa);
      if (_0x2bd878 === _0x65c394) break;
      else _0x7c362d["push"](_0x7c362d["shift"]());
    } catch (_0x4d2d39) {
      _0x7c362d["push"](_0x7c362d["shift"]());
    }
  }
})(_0x2044, 0xb4dd4);
function _0x2044() {
  const _0x41ff24 = [
    "getElementsByTagName",
    "Error\x20fetching\x20partner\x20data:\x20",
    "createElement",
    "mswasth-reimbursement",
    "editEmployee",
    "2114FBRKJN",
    "getElementById",
    "googleSheet",
    "11085576UCtCay",
    "addEmployee",
    "Partner\x20added\x20successfully.",
    "log",
    "2481eMuinf",
    "error",
    "textContent",
    "style",
    "innerHTML",
    "location",
    "searchPartnerTable",
    "value",
    "indexOf",
    "Partner\x20name\x20updated\x20successfully.",
    "1342016Wvcbwo",
    "Employee\x20ID\x20already\x20exists.",
    "addEventListener",
    "logout",
    "delete-button",
    "partnerName",
    "src",
    "add",
    "val",
    "892950ozsZqm",
    "trim",
    "forEach",
    "719155230190",
    "DOMContentLoaded",
    "map",
    "employeeIds/",
    "home",
    "querySelectorAll",
    "Error\x20adding\x20employee:\x20",
    "partnerNameInput",
    "Employee\x20deleted\x20successfully.",
    "partnerId",
    "href",
    "insertCell",
    "#employeeTable\x20tbody",
    "toUpperCase",
    "innerText",
    "populateEmployeeTable",
    "keys",
    "appendChild",
    "dataset",
    "block",
    "Enter\x20the\x20new\x20partner\x20name",
    "querySelector",
    "265962aFLYwJ",
    "edit-button",
    "populatePartnerTable",
    "employeeTable",
    "showSection",
    "65aeZPuf",
    "employeeId",
    "empid",
    "none",
    "display",
    "Enter\x20the\x20new\x20employee\x20ID",
    "searchPartnerInput",
    "mswasth-reimbursement.firebaseapp.com",
    "Edit",
    "click",
    "No\x20partner\x20names\x20available",
    "353331hnrwGS",
    "279EYNMMy",
    "index.html",
    "deletePartner",
    "4834935lDOysO",
    "editPartner",
    "No\x20data\x20available",
    "partnerNames/",
    "Please\x20enter\x20an\x20Employee\x20ID.",
    "Error\x20fetching\x20employee\x20data:\x20",
    "exists",
    "AIzaSyBqEYta8mbk2kmGSMpNUSvz3Etji8LkEuE",
    "insertRow",
    "Partner\x20name\x20deleted\x20successfully.",
    "getElementsByClassName",
    "target",
    "button",
    "classList",
    "length",
    "employeeIdInput",
    "searchEmployeeTable",
  ];
  _0x2044 = function () {
    return _0x41ff24;
  };
  return _0x2044();
}
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-app.js";
import {
  getDatabase,
  ref,
  get,
  set,
  update,
  remove,
} from "https://www.gstatic.com/firebasejs/10.12.4/firebase-database.js";
const firebaseConfig = {
    apiKey: _0x5b83ae(0x120),
    authDomain: _0x5b83ae(0x111),
    projectId: _0x5b83ae(0x12d),
    storageBucket: "mswasth-reimbursement.appspot.com",
    messagingSenderId: _0x5b83ae(0x14c),
    appId: "1:719155230190:web:b5989e1779a51b9be28aff",
    measurementId: "G-YT0GGE631Y",
  },
  firebaseApp = initializeApp(firebaseConfig),
  db = getDatabase(firebaseApp);
(window[_0x5b83ae(0x166)] = function (_0x581669) {
  const _0x4231cc = _0x5b83ae;
  let _0x2a031d = document[_0x4231cc(0x123)]("admin-section");
  for (let _0x1d9b42 of _0x2a031d) {
    _0x1d9b42[_0x4231cc(0x139)]["display"] = _0x4231cc(0x16a);
  }
  let _0x321e63 = document["getElementById"](_0x581669);
  _0x321e63 && (_0x321e63[_0x4231cc(0x139)][_0x4231cc(0x10e)] = "block");
}),
  (window[_0x5b83ae(0x133)] = async function () {
    const _0x2640d9 = _0x5b83ae,
      _0x3626cd = document[_0x2640d9(0x130)](_0x2640d9(0x128))
        [_0x2640d9(0x13d)]["trim"]()
        [_0x2640d9(0x159)]();
    if (_0x3626cd)
      try {
        const _0x3e49c2 = ref(db, _0x2640d9(0x14f) + _0x3626cd),
          _0x3c987e = await get(_0x3e49c2);
        _0x3c987e[_0x2640d9(0x11f)]()
          ? alert(_0x2640d9(0x141))
          : (await set(_0x3e49c2, { empid: _0x3626cd }),
            (document[_0x2640d9(0x130)]("employeeIdInput")[_0x2640d9(0x13d)] =
              ""),
            populateEmployeeTable(),
            alert("Employee\x20added\x20successfully."));
      } catch (_0x18b270) {
        console[_0x2640d9(0x137)](_0x2640d9(0x152), _0x18b270);
      }
    else alert(_0x2640d9(0x11d));
  }),
  (window[_0x5b83ae(0x15b)] = async function () {
    const _0xc4643f = _0x5b83ae,
      _0x362b75 = document[_0xc4643f(0x161)](_0xc4643f(0x158));
    _0x362b75[_0xc4643f(0x13a)] = "";
    try {
      const _0x4d07fc = await get(ref(db, "employeeIds"));
      if (_0x4d07fc["exists"]()) {
        const _0x4b5aa6 = _0x4d07fc[_0xc4643f(0x148)](),
          _0x380731 = Object["keys"](_0x4b5aa6)["map"]((_0x4176ea) => ({
            id: _0x4176ea,
            empid: _0x4b5aa6[_0x4176ea]["empid"],
          }));
        _0x380731["forEach"](function (_0x4966a5) {
          const _0x3512c5 = _0xc4643f,
            _0x407b26 = _0x362b75[_0x3512c5(0x121)](),
            _0x592bb4 = _0x407b26[_0x3512c5(0x157)]();
          _0x592bb4[_0x3512c5(0x138)] = _0x4966a5[_0x3512c5(0x169)];
          const _0x43af3b = _0x407b26[_0x3512c5(0x157)](),
            _0x59e3f5 = document[_0x3512c5(0x12c)](_0x3512c5(0x125));
          (_0x59e3f5["id"] = _0x3512c5(0x163)),
            (_0x59e3f5["textContent"] = _0x3512c5(0x112)),
            _0x59e3f5[_0x3512c5(0x126)][_0x3512c5(0x147)](_0x3512c5(0x163)),
            (_0x59e3f5[_0x3512c5(0x15e)][_0x3512c5(0x168)] = _0x4966a5["id"]),
            _0x59e3f5[_0x3512c5(0x142)](_0x3512c5(0x113), editEmployee);
          const _0x32313b = document["createElement"](_0x3512c5(0x125));
          (_0x32313b[_0x3512c5(0x138)] = "Delete"),
            _0x32313b["classList"][_0x3512c5(0x147)](_0x3512c5(0x144)),
            (_0x32313b[_0x3512c5(0x15e)]["employeeId"] = _0x4966a5["id"]),
            _0x32313b[_0x3512c5(0x142)](_0x3512c5(0x113), deleteEmployee),
            _0x43af3b[_0x3512c5(0x15d)](_0x59e3f5),
            _0x43af3b[_0x3512c5(0x15d)](_0x32313b);
        });
      } else console["log"](_0xc4643f(0x11b));
    } catch (_0x5655a8) {
      console[_0xc4643f(0x137)](_0xc4643f(0x11e), _0x5655a8);
    }
  }),
  (window[_0x5b83ae(0x12e)] = async function (_0x456a6d) {
    const _0x3a9857 = _0x5b83ae,
      _0x4436fe = _0x456a6d[_0x3a9857(0x124)][_0x3a9857(0x15e)]["employeeId"],
      _0x251925 = prompt(_0x3a9857(0x10f));
    if (_0x251925 !== null && _0x251925[_0x3a9857(0x14a)]() !== "")
      try {
        await update(ref(db, _0x3a9857(0x14f) + _0x4436fe), {
          empid: _0x251925,
        }),
          alert("Employee\x20ID\x20updated\x20successfully."),
          populateEmployeeTable();
      } catch (_0x929e13) {
        console["error"]("Error\x20updating\x20employee\x20ID:\x20", _0x929e13);
      }
  }),
  (window["deleteEmployee"] = async function (_0x133a65) {
    const _0x1a8bf0 = _0x5b83ae,
      _0x54010e =
        _0x133a65[_0x1a8bf0(0x124)][_0x1a8bf0(0x15e)][_0x1a8bf0(0x168)],
      _0x49d160 = confirm(
        "Are\x20you\x20sure\x20you\x20want\x20to\x20delete\x20this\x20employee?"
      );
    if (_0x49d160)
      try {
        await remove(ref(db, "employeeIds/" + _0x54010e)),
          alert(_0x1a8bf0(0x154)),
          populateEmployeeTable();
      } catch (_0x494822) {
        console[_0x1a8bf0(0x137)](
          "Error\x20deleting\x20employee:\x20",
          _0x494822
        );
      }
  }),
  (window[_0x5b83ae(0x129)] = function () {
    const _0x3dcede = _0x5b83ae,
      _0x17549f = document[_0x3dcede(0x130)]("searchEmployeeInput"),
      _0x57981d = _0x17549f["value"]["toUpperCase"](),
      _0xe26a5a = document[_0x3dcede(0x130)](_0x3dcede(0x165)),
      _0x5b0ae0 = _0xe26a5a[_0x3dcede(0x12a)]("tr");
    for (
      let _0x4abeda = 0x1;
      _0x4abeda < _0x5b0ae0[_0x3dcede(0x127)];
      _0x4abeda++
    ) {
      const _0x1cd08a = _0x5b0ae0[_0x4abeda][_0x3dcede(0x12a)]("td")[0x0];
      if (_0x1cd08a) {
        const _0x19cecb =
          _0x1cd08a[_0x3dcede(0x138)] || _0x1cd08a[_0x3dcede(0x15a)];
        _0x19cecb["toUpperCase"]()[_0x3dcede(0x13e)](_0x57981d) > -0x1
          ? (_0x5b0ae0[_0x4abeda][_0x3dcede(0x139)][_0x3dcede(0x10e)] = "")
          : (_0x5b0ae0[_0x4abeda][_0x3dcede(0x139)][_0x3dcede(0x10e)] =
              _0x3dcede(0x16a));
      }
    }
  }),
  document[_0x5b83ae(0x142)](_0x5b83ae(0x14d), function () {
    window["populateEmployeeTable"]();
  }),
  (window["addPartner"] = async function () {
    const _0x445189 = _0x5b83ae,
      _0x27da58 = document[_0x445189(0x130)](_0x445189(0x153)),
      _0x57281a = _0x27da58[_0x445189(0x13d)]
        [_0x445189(0x14a)]()
        [_0x445189(0x159)]();
    if (_0x57281a)
      try {
        const _0x3fa5bf = ref(db, _0x445189(0x11c) + _0x57281a),
          _0x2bc69c = await get(_0x3fa5bf);
        _0x2bc69c["exists"]()
          ? alert("Partner\x20Name\x20already\x20exists.")
          : (await set(_0x3fa5bf, {
              partnerName: _0x27da58[_0x445189(0x13d)][_0x445189(0x14a)](),
            }),
            populatePartnerTable(),
            (_0x27da58[_0x445189(0x13d)] = ""),
            alert(_0x445189(0x134)));
      } catch (_0x1ad5a2) {
        console[_0x445189(0x137)]("Error\x20adding\x20partner:\x20", _0x1ad5a2);
      }
    else alert("Please\x20enter\x20a\x20Partner\x20Name.");
  }),
  (window["populatePartnerTable"] = async function () {
    const _0x15f8ad = _0x5b83ae,
      _0x19a06d = document[_0x15f8ad(0x161)]("#partnerTable\x20tbody");
    _0x19a06d[_0x15f8ad(0x13a)] = "";
    try {
      const _0x434273 = await get(ref(db, "partnerNames"));
      if (_0x434273["exists"]()) {
        const _0x45744e = _0x434273[_0x15f8ad(0x148)](),
          _0x4adc04 = Object[_0x15f8ad(0x15c)](_0x45744e)[_0x15f8ad(0x14e)](
            (_0x1f06ae) => ({
              id: _0x1f06ae,
              partnerName: _0x45744e[_0x1f06ae][_0x15f8ad(0x145)],
            })
          );
        _0x4adc04[_0x15f8ad(0x14b)](function (_0x4eb667) {
          const _0x4a19eb = _0x15f8ad,
            _0x31e861 = _0x19a06d["insertRow"](),
            _0xb459ab = _0x31e861["insertCell"]();
          _0xb459ab[_0x4a19eb(0x138)] = _0x4eb667["partnerName"];
          const _0x276dde = _0x31e861["insertCell"](),
            _0x1a280f = document["createElement"](_0x4a19eb(0x125));
          (_0x1a280f[_0x4a19eb(0x138)] = _0x4a19eb(0x112)),
            _0x1a280f[_0x4a19eb(0x126)][_0x4a19eb(0x147)](_0x4a19eb(0x163)),
            (_0x1a280f[_0x4a19eb(0x15e)][_0x4a19eb(0x155)] = _0x4eb667["id"]),
            _0x1a280f["addEventListener"](_0x4a19eb(0x113), editPartner);
          const _0x339e56 = document[_0x4a19eb(0x12c)](_0x4a19eb(0x125));
          (_0x339e56[_0x4a19eb(0x138)] = "Delete"),
            _0x339e56[_0x4a19eb(0x126)][_0x4a19eb(0x147)]("delete-button"),
            (_0x339e56["dataset"]["partnerId"] = _0x4eb667["id"]),
            _0x339e56[_0x4a19eb(0x142)](_0x4a19eb(0x113), deletePartner),
            _0x276dde[_0x4a19eb(0x15d)](_0x1a280f),
            _0x276dde[_0x4a19eb(0x15d)](_0x339e56);
        });
      } else console[_0x15f8ad(0x135)](_0x15f8ad(0x114));
    } catch (_0x58fe52) {
      console[_0x15f8ad(0x137)](_0x15f8ad(0x12b), _0x58fe52);
    }
  }),
  (window[_0x5b83ae(0x11a)] = async function (_0xb9721b) {
    const _0x4bf9d0 = _0x5b83ae,
      _0x390dc5 = _0xb9721b["target"]["dataset"]["partnerId"],
      _0x156ac1 = prompt(_0x4bf9d0(0x160));
    if (_0x156ac1 !== null && _0x156ac1[_0x4bf9d0(0x14a)]() !== "")
      try {
        await update(ref(db, _0x4bf9d0(0x11c) + _0x390dc5), {
          partnerName: _0x156ac1,
        }),
          alert(_0x4bf9d0(0x13f)),
          populatePartnerTable();
      } catch (_0x26984e) {
        console[_0x4bf9d0(0x137)](
          "Error\x20updating\x20partner\x20name:\x20",
          _0x26984e
        );
      }
  }),
  (window[_0x5b83ae(0x118)] = async function (_0x437786) {
    const _0x529966 = _0x5b83ae,
      _0xbbfeb0 =
        _0x437786[_0x529966(0x124)][_0x529966(0x15e)][_0x529966(0x155)],
      _0x46f7eb = confirm(
        "Are\x20you\x20sure\x20you\x20want\x20to\x20delete\x20this\x20partner\x20name?"
      );
    if (_0x46f7eb)
      try {
        await remove(ref(db, _0x529966(0x11c) + _0xbbfeb0)),
          alert(_0x529966(0x122)),
          populatePartnerTable();
      } catch (_0x56897f) {
        console["error"](
          "Error\x20deleting\x20partner\x20name:\x20",
          _0x56897f
        );
      }
  }),
  (window[_0x5b83ae(0x13c)] = function () {
    const _0xd36e00 = _0x5b83ae,
      _0x44830b = document[_0xd36e00(0x130)](_0xd36e00(0x110)),
      _0x5919b1 = _0x44830b[_0xd36e00(0x13d)][_0xd36e00(0x159)](),
      _0x1e0de0 = document[_0xd36e00(0x130)]("partnerTable"),
      _0x5ae1b7 = _0x1e0de0[_0xd36e00(0x12a)]("tr");
    for (
      let _0xde276c = 0x1;
      _0xde276c < _0x5ae1b7[_0xd36e00(0x127)];
      _0xde276c++
    ) {
      const _0x29942e = _0x5ae1b7[_0xde276c][_0xd36e00(0x12a)]("td")[0x0];
      if (_0x29942e) {
        const _0x274a13 =
          _0x29942e[_0xd36e00(0x138)] || _0x29942e[_0xd36e00(0x15a)];
        _0x274a13["toUpperCase"]()[_0xd36e00(0x13e)](_0x5919b1) > -0x1
          ? (_0x5ae1b7[_0xde276c][_0xd36e00(0x139)]["display"] = "")
          : (_0x5ae1b7[_0xde276c][_0xd36e00(0x139)]["display"] =
              _0xd36e00(0x16a));
      }
    }
  }),
  document[_0x5b83ae(0x142)](_0x5b83ae(0x14d), function () {
    const _0x5d61c2 = _0x5b83ae;
    window[_0x5d61c2(0x164)]();
  }),
  (window[_0x5b83ae(0x143)] = function () {
    const _0x43f1fe = _0x5b83ae;
    window[_0x43f1fe(0x13b)][_0x43f1fe(0x156)] = _0x43f1fe(0x117);
  });
function _0x4906(_0x1d4dd6, _0x5537a4) {
  const _0x20445d = _0x2044();
  return (
    (_0x4906 = function (_0x4906b4, _0x3b66a5) {
      _0x4906b4 = _0x4906b4 - 0x10e;
      let _0x3cff46 = _0x20445d[_0x4906b4];
      return _0x3cff46;
    }),
    _0x4906(_0x1d4dd6, _0x5537a4)
  );
}
function showSection(_0x2c335c) {
  const _0x10f5cf = _0x5b83ae;
  document[_0x10f5cf(0x151)](".admin-section")[_0x10f5cf(0x14b)](function (
    _0x16fd1c
  ) {
    const _0x5d0e31 = _0x10f5cf;
    _0x16fd1c[_0x5d0e31(0x139)][_0x5d0e31(0x10e)] = _0x5d0e31(0x16a);
  }),
    (document[_0x10f5cf(0x130)](_0x2c335c)["style"][_0x10f5cf(0x10e)] =
      _0x10f5cf(0x15f));
}
function refreshIframe() {
  const _0x4f7956 = _0x5b83ae,
    _0x53b72a = document["getElementById"](_0x4f7956(0x131));
  _0x53b72a[_0x4f7956(0x146)] = _0x53b72a[_0x4f7956(0x146)];
}
document[_0x5b83ae(0x142)](_0x5b83ae(0x14d), function () {
  const _0x1e7f79 = _0x5b83ae;
  showSection(_0x1e7f79(0x150)), setInterval(refreshIframe, 0xea60);
});
