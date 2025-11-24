#!/usr/bin/python3
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

server = Flask(__name__)
CORS(server)  # https://stackoverflow.com/a/46637194

# serverside for sending chatlog
@server.route("/api/v0/chats/<int:chat_id>", methods=["GET"])
def get_chat(chat_id):
    response = []  # for reading chatlog into temporary array
    with open("./chats/" + str(chat_id) + ".txt") as file:
        for line in file:  # for every line in the file
            response.append(line.rstrip())  # append line to response[] array
    return jsonify({"messages": response})  # return array in json form to client
# serverside for receiving messages
@server.route("/api/v0/chats/<int:chat_id>", methods=["POST"])
def receive_msg(chat_id):
    new_msg = request.json["msg"]  # reads "msg" value from client POST request
    chOpen = open("./chats/" + str(chat_id) + ".txt", "a")  # opens relevant chat in append mode
    chOpen.write(new_msg + "\n")  # writes and adds newline
    chOpen.close()
    return jsonify({"messaged": new_msg}), 201  # confirms sent message

# provides clientside html, css and js
@server.route("/")
def get_webcli_index():
    return send_from_directory("static", "index.html")
# provides assets, e.g. GET /assets/fonts/OpenSans-Regular.ttf
@server.route("/assets/<asset_type>/<asset_file>", methods=["GET"])
def get_webcli_assets(asset_type, asset_file):  
    return send_from_directory("assets/"+asset_type, asset_file)

if __name__ == "__main__":
    server.run(debug=False)
