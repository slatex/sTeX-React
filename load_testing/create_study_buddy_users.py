import requests
import json

def make_post_request(url, auth_token, body):
    headers = {
        'Authorization': 'JWT ' + auth_token,
        'Content-Type': 'application/json'
    }
    try:
        response = requests.post(url, headers=headers, json=body)
        if response.status_code == 200:
            print(f"POST request successful for AuthToken: {auth_token}")
        else:
            print(f"POST request failed for AuthToken: {auth_token}. Status code: {response.status_code}")
    except requests.RequestException as e:
        print(f"Request failed for AuthToken: {auth_token}. Error: {e}")

def main():
    url = 'http://localhost:4200/api/study-buddy/update-info/ai-1'
    auth_file_path = './tokens.json'  # JSON file containing auth tokens
    body_file_path = './buddy_info.json'  # JSON file containing request bodies

    with open(auth_file_path, 'r') as auth_file:
        auth_data = json.load(auth_file)

    with open(body_file_path, 'r') as body_file:
        body_data = json.load(body_file)

    for user, auth_token in auth_data.items():
        if user in body_data:
            body = body_data[user]
            make_post_request(url, auth_token, body)
        else:
            print(f"No body found for user: {user}")

if __name__ == "__main__":
    main()
