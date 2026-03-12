import requests
import time

# Use a ticker that previously failed due to length
ticker = "AMZN"
form_type = "10-Q"
url = f"http://127.0.0.1:8000/api/company/{ticker}/filing/{form_type}"

print(f"Testing large extraction and DB storage for {ticker} {form_type}...")
start = time.time()
try:
    response = requests.get(url, timeout=300)
    end = time.time()
    print(f"Status Code: {response.status_code}")
    print(f"Time Taken: {end - start:.2f}s")
    if response.status_code == 200:
        data = response.json()
        print(f"Successfully retrieved and stored {ticker} {form_type}")
        print(f"Data length: {len(data.get('text', ''))} characters")
    else:
        print(f"Failed: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
