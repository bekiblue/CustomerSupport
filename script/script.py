import requests
import sys
import os

# API endpoint
api_url = "https://api.gumroad.com/v2/licenses/decrement_uses_count"

selectedProductID, licenseKey = sys.argv[1], sys.argv[2]

# API parameters
params = {
    "access_token": os.environ.get('access_token'),
    "product_id": selectedProductID,
    "license_key": licenseKey
}


# Iterate until 'uses' is 0
while True:
    # Make the API request
    response = requests.put(api_url, data=params)
   
    # Check for successful response
    if response.status_code == 200:
        # Parse the JSON response
        result = response.json()
        
        # Check the 'uses' value
        uses_count = result.get("uses", 0)
        print(f"Current uses count: {uses_count}")

        # Break the loop if 'uses' is 0
        if uses_count == 0:
            print("All uses have been decremented. Exiting the loop.")
            break
    elif response.status_code == 404:
        sys.exit(2)
    else:
        # Print an error message and break the loop on non-successful response
        print(f"API request failed with status code {response.status_code}. Exiting the loop.")
        sys.exit(1)
        break