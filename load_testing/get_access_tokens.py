import requests
import json

# Define the base URL and target URL
base_url = "https://lms.voll-ki.fau.de/fake-login?fake-id={user_id}&target=https%3A%2F%2Fcourses.voll-ki.fau.de"
users = 1000  # Change this to the number of users you have

access_tokens = {}

for user_no in range(1, users + 1):
    user_id =f"loadtest_user{user_no}"
    url = base_url.format(user_id=user_id)

    # Make the GET request
    response = requests.get(url, allow_redirects=False)
    print(url)
    if response.status_code == 302:
        # Extract the access token from the Set-Cookie header
        cookies = response.cookies.get_dict()
        if 'access_token' in cookies:
            access_token = cookies['access_token']
            access_tokens[user_id] = access_token
        else:
            print(f"Access token not found for User {user_id}")
    else:
        print(response)
        print(f"Failed to retrieve access token for User {user_id} {response.status_code}")

# Save the access tokens to a JSON file
with open("access_tokens.json", "w") as json_file:
    json.dump(access_tokens, json_file)

print("Access tokens have been successfully retrieved and saved to access_tokens.json")