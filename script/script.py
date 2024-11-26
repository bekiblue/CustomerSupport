import requests
import sys
import os

# API endpoint
api_url = "https://api.gumroad.com/v2/licenses/decrement_uses_count"

# Command-line arguments
selectedProductID, licenseKey = sys.argv[1], sys.argv[2]

# Access tokens
access_tokens = [
    os.environ.get('ACCESS_TOKEN_1'),
    os.environ.get('ACCESS_TOKEN_2'),
    os.environ.get('ACCESS_TOKEN_3'),
    os.environ.get('ACCESS_TOKEN_4'),
    os.environ.get('ACCESS_TOKEN_5')
]

current_token_index = 0

# Function to get the next access token
def get_next_access_token():
    global current_token_index
    token = access_tokens[current_token_index]
    current_token_index = (current_token_index + 1) % len(access_tokens)
    return token

# API parameters
params = {
    "product_id": selectedProductID,
    "license_key": licenseKey
}

# Iterate until 'uses' is 0
while True:
    # Get the next access token
    params["access_token"] = get_next_access_token()

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
        print("Invalid license key or product ID.")
        sys.exit(2)
    else:
        # Print an error message and exit on a non-successful response
        print(f"API request failed with status code {response.status_code}. Exiting.")
        sys.exit(1)
