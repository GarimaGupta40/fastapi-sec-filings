import asyncio
from sec_client import sec_client

async def main():
    cik = "0000019617" # JPM CIK
    data = await sec_client.get(f"https://data.sec.gov/submissions/CIK{cik}.json")
    files = data.get("filings", {}).get("files", [])
    print("Files found:", len(files))
    for f in files:
        url = f"https://data.sec.gov/submissions/{f['name']}"
        fdata = await sec_client.get(url)
        forms = fdata.get("form", [])
        k_forms = [form for form in forms if form.startswith("10-K")]
        print("In", f['name'], "found", len(k_forms), "10-Ks")
    await sec_client.close()

if __name__ == "__main__":
    asyncio.run(main())
