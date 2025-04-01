const _0x1eec6b = _0x302e;
function _0x302e(_0x4fb439, _0xcb53a2) {
  const _0x7b294c = _0x7b29();
  return (
    (_0x302e = function (_0x302efd, _0x2955ae) {
      _0x302efd = _0x302efd - 0x1ef;
      let _0x4ed78c = _0x7b294c[_0x302efd];
      return _0x4ed78c;
    }),
    _0x302e(_0x4fb439, _0xcb53a2)
  );
}
(function (_0x20cb89, _0x435e7f) {
  const _0x3a112f = _0x302e,
    _0x5c7ac8 = _0x20cb89();
  while (!![]) {
    try {
      const _0xbee70c =
        (parseInt(_0x3a112f(0x20f)) / 0x1) *
          (-parseInt(_0x3a112f(0x20a)) / 0x2) +
        (-parseInt(_0x3a112f(0x1ef)) / 0x3) *
          (parseInt(_0x3a112f(0x1f2)) / 0x4) +
        (parseInt(_0x3a112f(0x1f5)) / 0x5) *
          (-parseInt(_0x3a112f(0x1fd)) / 0x6) +
        -parseInt(_0x3a112f(0x209)) / 0x7 +
        (-parseInt(_0x3a112f(0x1f1)) / 0x8) *
          (-parseInt(_0x3a112f(0x1f9)) / 0x9) +
        (parseInt(_0x3a112f(0x1f7)) / 0xa) *
          (parseInt(_0x3a112f(0x1fe)) / 0xb) +
        (parseInt(_0x3a112f(0x1f6)) / 0xc) * (parseInt(_0x3a112f(0x200)) / 0xd);
      if (_0xbee70c === _0x435e7f) break;
      else _0x5c7ac8["push"](_0x5c7ac8["shift"]());
    } catch (_0x45e4db) {
      _0x5c7ac8["push"](_0x5c7ac8["shift"]());
    }
  }
})(_0x7b29, 0x94c0d);
const users = [
    { username: "v", password: "1" },
    { username: _0x1eec6b(0x1f3), password: _0x1eec6b(0x1f8) },
    { username: _0x1eec6b(0x205), password: "123456" },
    { username: _0x1eec6b(0x204), password: _0x1eec6b(0x1fb) },
  ],
  admins = [
    { username: "a", password: "1" },
    { username: "admin2", password: _0x1eec6b(0x1f0) },
    { username: _0x1eec6b(0x207), password: _0x1eec6b(0x1f0) },
    { username: _0x1eec6b(0x1ff), password: _0x1eec6b(0x1fb) },
    { username: _0x1eec6b(0x204), password: _0x1eec6b(0x1fb) },
    { username: _0x1eec6b(0x20d), password: _0x1eec6b(0x1fb) },
  ],
  admin2 = [{ username: "s", password: "1" }];
function login() {
  const _0x4ccae8 = _0x1eec6b,
    _0x1896a3 = document[_0x4ccae8(0x201)]("username")["value"],
    _0x3f378a = document[_0x4ccae8(0x201)](_0x4ccae8(0x210))[_0x4ccae8(0x206)],
    _0x491b28 = users[_0x4ccae8(0x211)](
      (_0x18b1f3) =>
        _0x18b1f3["username"] === _0x1896a3 &&
        _0x18b1f3[_0x4ccae8(0x210)] === _0x3f378a
    ),
    _0x5e8ad1 = admins["find"](
      (_0x52102a) =>
        _0x52102a[_0x4ccae8(0x1fa)] === _0x1896a3 &&
        _0x52102a[_0x4ccae8(0x210)] === _0x3f378a
    );
  if (_0x491b28)
    sessionStorage[_0x4ccae8(0x208)](_0x4ccae8(0x1f4), _0x4ccae8(0x202)),
      (window["location"][_0x4ccae8(0x20e)] = _0x4ccae8(0x1fc));
  else
    _0x5e8ad1
      ? (sessionStorage["setItem"]("loggedIn", _0x4ccae8(0x202)),
        (window[_0x4ccae8(0x203)][_0x4ccae8(0x20e)] = _0x4ccae8(0x20b)))
      : alert("Invalid\x20username\x20or\x20password");
}
function logout() {
  const _0x504ee0 = _0x1eec6b;
  window[_0x504ee0(0x203)][_0x504ee0(0x20e)] = _0x504ee0(0x20c);
}
function _0x7b29() {
  const _0x4b8d64 = [
    "admin2",
    "setItem",
    "846559CMxgEg",
    "2epzvsn",
    "admin.html",
    "index.html",
    "sidharth",
    "href",
    "385914ZqDMUI",
    "password",
    "find",
    "24630HhXDUJ",
    "adminpass2",
    "112bfOTVm",
    "424IETrfT",
    "user2",
    "loggedIn",
    "5260595aJyCwS",
    "12HOdloJ",
    "2043700mjNzuR",
    "pass2",
    "657513TGgzMZ",
    "username",
    "123456",
    "Mswasth.html",
    "6fiSyOw",
    "55vPSPLz",
    "prakash",
    "12920375rdlaye",
    "getElementById",
    "true",
    "location",
    "test",
    "abhishek",
    "value",
  ];
  _0x7b29 = function () {
    return _0x4b8d64;
  };
  return _0x7b29();
}
