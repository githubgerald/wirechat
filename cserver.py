#!/usr/bin/python3
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime

server = Flask(__name__)
CORS(server, resources={
    r"/api/*": {
        "origins": ["http://localhost:5000", "http://127.0.0.1:5000", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Authenticate users via JSON POST
@server.route("/api/v0/auth/login", methods=["POST"])
def userAuth():
    credentials = request.get_json(silent=True)
    if not credentials:
        return jsonify({"success": False, "error": "Invalid JSON body"}), 400
    
    username = (credentials.get('username') or '').strip()
    password = (credentials.get('password') or '').strip()
    
    if not username or not password:
        return jsonify({"success": False, "error": "Username and password required"}), 400
    
    try:
        users_file = os.path.join(os.path.dirname(__file__), 'data', 'users', 'users.json')
        with open(users_file, 'r') as file:
            data = json.load(file)
        
        # Find user in the users array
        user_found = None
        for user in data.get('users', []):
            if user.get('username') == username:
                user_found = user
                break
        
        if user_found and user_found.get('password') == password:
            token = f"user_{username}_{int(datetime.now().timestamp())}"
            return jsonify({
                "success": True,
                "message": "Successful login",
                "username": username,
                "token": token,
                "profile": user_found.get('profile', {}),
                "settings": user_found.get('settings', {}),
                "permissions": user_found.get('permissions', [])
            }), 200
        else:
            return jsonify({"success": False, "error": "Invalid username or password"}), 401
    except FileNotFoundError:
        return jsonify({"success": False, "error": "User database not found"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# Save user settings/profile back to users.json
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
        
        # Find and update user
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


# Return public user info (profile + basic settings) by username
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
                    "permissions": user.get('permissions', [])
                }), 200

        return jsonify({"success": False, "error": "User not found"}), 404
    except FileNotFoundError:
        return jsonify({"success": False, "error": "User database not found"}), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
def ensure_chat_file(chat_id):
    filepath = f"./chats/{chat_id}.json"
    if not os.path.exists(filepath):
        with open(filepath, 'w') as f:
            json.dump({
                "channel_name": f"Room {chat_id}",
                "messages": []
            }, f, indent=2)
    return filepath

# GET: Retrieve all messages from a chat
@server.route("/api/v0/chats/<int:chat_id>", methods=["GET"])
def get_chat(chat_id):
    filepath = ensure_chat_file(chat_id)
    try:
        with open(filepath, 'r') as file:
            data = json.load(file)
        
        if 'channel_name' not in data:
            data['channel_name'] = f'Room {chat_id}'
        
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# POST: Add a new message to a chat OR rename channel
@server.route("/api/v0/chats/<int:chat_id>", methods=["POST"])
def receive_msg(chat_id):
    filepath = ensure_chat_file(chat_id)
    new_data = request.json
    
    # Check if this is a channel rename request
    if 'channel_name' in new_data and 'message' not in new_data:
        new_channel_name = new_data['channel_name'].strip()
        
        if len(new_channel_name) == 0:
            return jsonify({"error": "Channel name cannot be empty"}), 400
        
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
    
    # Regular message
    with open(filepath, 'r') as file:
        data = json.load(file)
        msg_len = len(data['messages'])

    new_data['uid'] = msg_len
    new_data['timestamp'] = datetime.now().isoformat()
    new_data['date'] = datetime.now().strftime("%d/%m/%Y")
    new_data['time'] = datetime.now().strftime("%H:%M")
    
    try:
        with open(filepath, 'r') as file:
            data = json.load(file)
        
        if 'channel_name' not in data:
            data['channel_name'] = f'Room {chat_id}'
        
        data['messages'].append(new_data)
        
        with open(filepath, 'w') as file:
            json.dump(data, file, indent=2)
        
        print(f"✅ Message {msg_len} added to chat {chat_id}")
        return jsonify({"success": True, "message": new_data}), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Serve React build files (for production)
@server.route("/")
def serve_react_app():
    return send_from_directory("dist", "index.html")

@server.route("/<path:filename>")
def serve_static(filename):
    return send_from_directory("dist", filename)

# For development - also serve from static if needed
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