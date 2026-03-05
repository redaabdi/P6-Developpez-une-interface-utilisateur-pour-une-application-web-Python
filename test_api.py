import requests

session = requests.Session()

response = session.get("http://localhost:8000/api/v1/titles")

data = response.json()
print(data)