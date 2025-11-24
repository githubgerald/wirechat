#!/usr/bin/python3
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime

server = Flask(__name__)
CORS(server, resources={  # Allow POST/GET reqs from localhost to localhost
    r"/api/*": {
        "origins": ["http://localhost:5000", "http://127.0.0.1:5000", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

### Authenticate users via JSON POST ###
@server.route("/api/v0/auth/login", methods=["POST"])
def userAuth():
    credentials = request.get_json(silent=True)
    if not credentials:  # Check it's in json format/not malformed
        return jsonify({"success": False, "error": "Invalid JSON body"}), 400
    username = (credentials.get('username') or '').strip()
    password = (credentials.get('password') or '').strip()
    if not username or not password:  # Return 400 if missing data
        return jsonify({"success": False, "error": "Username and password required"}), 400
        
    # CHECK IF USER EXISTS IN USER SECTION OF USERS.JSON
    # Open as read, load into "data" variable, check each username
    try:
        users_file = os.path.join(os.path.dirname(__file__), 'data', 'users', 'users.json')
        with open(users_file, 'r') as file:
            data = json.load(file)
        user_found = None
        for user in data.get('users', []):
            if user.get('username') == username:
                user_found = user
                break
        # If found, and if the db password matches the inputted password, provide a token using timestamp
        if user_found and user_found.get('password') == password:
            token = f"user_{username}_{int(datetime.now().timestamp())}"
            return jsonify({
                "success": True,
                "message": "Successful login",
                "username": username,
                "token": token,
                "profile": user_found.get('profile', {}),
                "settings": user_found.get('settings', {}),
                # TO-DO, probably not secure depending on what we use it for?
                "permissions": user_found.get('permissions', []) 
            }), 200
        else:  # so we can display a nice lil error
            return jsonify({"success": False, "error": "Invalid username or password"}), 401
    except FileNotFoundError:
        return jsonify({"success": False, "error": "User database not found"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

### RECEIVE UPDATE & SAVE USER SETTINGS/PROFILE BACK TO USERS.JSON ### certified githubgerald section
@server.route("/api/v0/auth/save-settings", methods=["POST"])
def saveUserSettings():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"success": False, "error": "Invalid JSON body"}), 400
    username = (data.get('username') or '').strip()
    if not username:
        return jsonify({"success": False, "error": "Username required"}), 400
    try:
        users_file = os.path.join(os.path.dirname(__file__), 'data', 'users', 'users.json')
        with open(users_file, 'r') as file:
            users_data = json.load(file)
        user_found = False
        for user in users_data.get('users', []):
            if user.get('username') == username:
                user_found = True
                # Update settings if provided
                if 'settings' in data:
                    user['settings'] = data['settings']
                # Update profile if provided
                if 'profile' in data:
                    user['profile'] = data['profile']
                break
        
        if not user_found:
            return jsonify({"success": False, "error": "User not found"}), 404
        
        # Write back to file
        with open(users_file, 'w') as file:
            json.dump(users_data, file, indent=2)
        
        return jsonify({"success": True, "message": "Settings saved"}), 200
    except FileNotFoundError:
        return jsonify({"success": False, "error": "User database not found"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

### RETURN PUBLIC USER INFO (PROFILE + SETTINGS) BY USERNAME ###
@server.route("/api/v0/users/<username>", methods=["GET"])
def get_user_info(username):
    username = username.strip()
    if not username:
        return jsonify({"success": False, "error": "Username required"}), 400
    try:
        users_file = os.path.join(os.path.dirname(__file__), 'data', 'users', 'users.json')
        with open(users_file, 'r') as file:
            users_data = json.load(file)

        for user in users_data.get('users', []):
            if user.get('username') == username:
                # Return public info only (no password)
                return jsonify({
                    "success": True,
                    "username": user.get('username'),
                    "profile": user.get('profile', {}),
                    "settings": user.get('settings', {}),
                    # TO-DO, probably not secure depending on what we use it for?
                    "permissions": user.get('permissions', [])
                }), 200

        return jsonify({"success": False, "error": "User not found"}), 404
    except FileNotFoundError:
        return jsonify({"success": False, "error": "User database not found"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

### CREATE CHAT FILE IF IT DOESN'T EXIST ### (probably temporary and we'll turn this into a POST req later)
def ensure_chat_file(chat_id):
    filepath = f"./chats/{chat_id}.json"
    if not os.path.exists(filepath):
        with open(filepath, 'w') as f:
            json.dump({
                "channel_name": f"Room {chat_id}",
                "messages": []
            }, f, indent=2)
    return filepath

### SERVE ENTIRE CHATLOG ### feels a bit scuffed but we'll find a more secure way to do it eventually
@server.route("/api/v0/chats/<int:chat_id>", methods=["GET"])  # int for now but might do alphanumeric
def get_chat(chat_id):
    filepath = ensure_chat_file(chat_id)
    try:
        with open(filepath, 'r') as file:
            data = json.load(file)
        if 'channel_name' not in data:  # For older json files, this adds the channel_name field to it
            data['channel_name'] = f'Room {chat_id}'  # probably not really needed now but nice to have
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

### ADD NEW MESSAGE TO CHAT *OR* RENAME CHAT ###
@server.route("/api/v0/chats/<int:chat_id>", methods=["POST"])
def receive_msg(chat_id):
    filepath = ensure_chat_file(chat_id)
    new_data = request.json
    # Check if this is a channel rename request
    if 'channel_name' in new_data and 'message' not in new_data:
        new_channel_name = new_data['channel_name'].strip()
        if len(new_channel_name) == 0:
            return jsonify({"error": "Channel name cannot be empty"}), 400
        # no illegal chars and max length
        new_channel_name = new_channel_name[:30]
        new_channel_name = ''.join(c for c in new_channel_name if c.isalnum() or c in ' -_')
        
        try:
            with open(filepath, 'r') as file:
                data = json.load(file)
            data['channel_name'] = new_channel_name
            with open(filepath, 'w') as file:
                json.dump(data, file, indent=2)
            print(f"✅ Channel {chat_id} renamed to: {new_channel_name}")
            return jsonify({"success": True, "channel_name": new_channel_name}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    # For actual new messages
    with open(filepath, 'r') as file:
        data = json.load(file)
        msg_len = len(data['messages'])  # for UID
    new_data['uid'] = msg_len
    new_data['timestamp'] = datetime.now().isoformat()
    new_data['date'] = datetime.now().strftime("%d/%m/%Y")
    new_data['time'] = datetime.now().strftime("%H:%M")
    
    try:
        with open(filepath, 'r') as file:
            data = json.load(file)
        if 'channel_name' not in data:
            data['channel_name'] = f'Room {chat_id}'  # add channel name if missing
        data['messages'].append(new_data)       
        with open(filepath, 'w') as file:
            json.dump(data, file, indent=2)
        print(f"✅ Message {msg_len} added to chat {chat_id}")
        return jsonify({"success": True, "message": new_data}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

### SERVE WEBCLI ###
# Serve React buil files (for prod)
@server.route("/")
def serve_react_app():
    return send_from_directory("dist", "index.html")
@server.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory("dist", filename)

# Temporary - will be handled by nginx most likely
@server.route("/static/<path:filename>")
def serve_static_files(filename):
    return send_from_directory("static", filename)
@server.route("/assets/<asset_type>/<asset_file>", methods=["GET"])
def get_webcli_assets(asset_type, asset_file):
    return send_from_directory(f"assets/{asset_type}", asset_file)
# Serve user profile pictures from public/user_pfp
@server.route("/user_pfp/<filename>", methods=["GET"])
def get_user_pfp(filename):
    return send_from_directory("public/user_pfp", filename)

if __name__ == "__main__":
    # Create chats directory if it doesn't exist
    os.makedirs("chats", exist_ok=True)
    print("=" * 50)
    print("Starting wirechat server...")
    print("Server: http://localhost:5000")
    print("=" * 50)
    server.run(debug=True, port=5000)
