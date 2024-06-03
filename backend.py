from flask import Flask, request, jsonify
import requests
import os
from time import sleep

app = Flask(__name__, static_folder='build', static_url_path='/')

@app.after_request
def add_custom_header(response):
  response.headers['Access-Control-Allow-Origin'] = '*'
  response.headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS'
  return response

@app.route('/message', methods=['POST'])
def bot_response():
  url = "https://api.openai.com/v1"
  thread_id = "your_thread_id"
  headers = {
    "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
    "Content-Type": "application/json",
    "OpenAI-Beta": "assistants=v2"
  }

  if 'thread' in request.json and request.json['thread']:
    thread_id = request.json['thread']
  else:
    thread_response = requests.post(f"{url}/threads", headers=headers)
    thread_id = thread_response.json()["id"]
    requests.post(f"{url}/threads/{thread_id}/messages", headers=headers, json={"role": "assistant", "content": "Hi there, and welcome to Master of Code Global! 👋I'm your virtual assistant, here to help you answer questions about MOCG, navigate this website, and more. How can I help you today?"},)

  user_message = request.json['message']
  requests.post(f"{url}/threads/{thread_id}/messages", headers=headers, json={"role": "user", "content": user_message})
  run_response = requests.post(f"{url}/threads/{thread_id}/runs", headers=headers, json={"assistant_id": os.getenv('OPENAI_ASSISTANT')})
  run_id = run_response.json()["id"]

  completed = False
  while not completed:
    sleep(2)
    status_response = requests.get(f"{url}/threads/{thread_id}/runs/{run_id}", headers=headers)
    completed = status_response.json()["status"] == "completed"

  answer_response = requests.get(f"{url}/threads/{thread_id}/messages", headers=headers)
  bot_message = answer_response.json()["data"][0]["content"][0]["text"]["value"]

  return jsonify({'message': bot_message,'thread': thread_id})

# @app.route('/', defaults={'path': ''})
# @app.route('/<path:path>')
# def forward_request(path):
#   print(path)
#   response = requests.request(
#     method='GET',
#     url=f"http://localhost:3000/{path}",
#     headers=request.headers,
#     allow_redirects=False
#   )
#   excluded_headers = {'transfer-encoding', 'content-encoding'}
#   forwarded_headers = {k: v for k, v in response.headers.items() if k.lower() not in excluded_headers}

#   return response.content, response.status_code, forwarded_headers

if __name__ == '__main__':
  app.run(debug=True, host='0.0.0.0')