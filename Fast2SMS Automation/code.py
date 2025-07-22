import os, requests, pandas as pd, time, io
from google.colab import files

API_KEY = "api key here"
BASE    = "https://www.fast2sms.com/dev"
ALLOWED = [118457,# message id will come here]

# --- Wallet check --------------------------------------------------------
bal = float(requests.get(f"{BASE}/wallet",
                         params={"authorization":API_KEY}).json()["wallet"])  # Fast2SMS wallet endpoint :contentReference[oaicite:4]{index=4}
print(f"Current wallet ₹{bal}")
if bal < 1000:
    raise SystemExit("⛔  Balance below ₹1 000 – top‑up before sending")

# --- Template pull -------------------------------------------------------
def get_templates():
    r = requests.get(f"{BASE}/dlt_manager",
                     params={"authorization":API_KEY,"type":"template"},
                     timeout=15).json()
    if not r.get("success"):
        raise RuntimeError(r)
    rows = []
    for s in r["data"]:
        for t in s["templates"]:
            if int(t["message_id"]) in ALLOWED:
                rows.append({"id":int(t["message_id"]),
                             "sender":s["sender_id"],
                             "vars":int(t["var_count"]),
                             "text":t["message"]})
    return pd.DataFrame(rows)

tpl_df = get_templates()
print("Available IDs:", list(tpl_df.id))

###############################################################################################################################################################################################################

msg_id = int(input("Enter Message‑ID from the list above: "))
row    = tpl_df.set_index("id").loc[msg_id]
print(f"\nSender: {row.sender} | Vars needed: {row.vars}\n{row.text}")

cols = ["mobile"] + [f"v{i}" for i in range(1, row.vars+1)]
pd.DataFrame({c: [] for c in cols}).to_csv(f"sample_{msg_id}.csv", index=False)
files.download(f"sample_{msg_id}.csv")

###############################################################################################################################################################################################################

print("📤 Select the filled CSV / Excel file …")
up = files.upload()
fname = next(iter(up))
df = (pd.read_csv if fname.endswith(".csv") else pd.read_excel)(fname, dtype=str)
need_cols = ["mobile"] + [f"v{i}" for i in range(1, row.vars+1)]
missing = [c for c in need_cols if c not in df.columns]
if missing:
    raise ValueError(f"Missing columns: {missing}")
df = df.fillna("")
print(f"Loaded {len(df)} rows.")
df.head()


###############################################################################################################################################################################################################

def send_with_retry(payload, tries=3, base_pause=0.9):
    for a in range(tries):
        try:
            j = requests.post(f"{BASE}/bulkV2",
                              json=payload,
                              headers={"authorization":API_KEY},
                              timeout=10).json()
            if j.get("return"):
                return True, j["request_id"]
            err = j
        except Exception as e:
            err = e
        time.sleep(base_pause * 2**a)   # 0.9 → 1.8 → 3.6
    return False, err

ok = fail = 0
req_ids = []
for i, r in df.iterrows():
    vars_pipe = "|".join(r[f"v{j}"] for j in range(1, row.vars+1))
    payload = {"route":"dlt","sender_id":row.sender,"message":str(msg_id),
               "variables_values":vars_pipe,"numbers":str(r.mobile).strip()}
    if any(ord(ch) > 127 for ch in row.text):        # Hindi/emoji → unicode :contentReference[oaicite:5]{index=5}
        payload["language"] = "unicode"

    sent, info = send_with_retry(payload)
    if sent:
        ok += 1; req_ids.append(info); print("OK", i+1, info)
    else:
        fail += 1; print("FAIL", i+1, info)

print(f"\nQueued → success={ok}, fail={fail}")


###############################################################################################################################################################################################################
