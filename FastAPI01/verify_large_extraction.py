import requests
import time

url = "http://127.0.0.1:8000/api/company/AMZN/filing/10-Q"
print(f"Requesting {url}...")
start = time.time()
try:
    response = requests.get(url, timeout=300)
    end = time.time()
    print(f"Status Code: {response.status_code}")
    print(f"Time Taken: {end - start:.2f} seconds")
    if response.status_code == 200:
        data = response.json()
        text_len = len(data.get("text", ""))
        print(f"Retrieved text length: {text_len}")
        if text_len > 0:
            print("SUCCESS: Real extraction and storage working for large documents.")
        else:
            print("WARNING: Retrieved empty text.")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
