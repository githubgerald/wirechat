#!/usr/bin/python3
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime

server = Flask(__name__)
CORS(server, resources={
    r"/api/*": {
        "origins": ["http://localhost:5000", "http://127.0.0.1:5000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Helper function to create JSON file if it doesn't exist
def ensure_chat_file(chat_id):
    filepath = f"./chats/{chat_id}.json"
    if not os.path.exists(filepath):
        with open(filepath, 'w') as f:
            # Include default channel_name when creating new file
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
        
        # Make sure channel_name exists (for old JSON files)
        if 'channel_name' not in data:
            data['channel_name'] = f'Room {chat_id}'
        
        return jsonify(data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# POST: Add a new message to a chat OR rename channel
@server.route("/api/v0/chats/<int:chat_id>", methods=["POST"])
def receive_msg(chat_id):
    filepath = ensure_chat_file(chat_id)
    
    # Get the data from request
    new_data = request.json
    
    # Check if this is a channel rename request (has channel_name but no message)
    if 'channel_name' in new_data and 'message' not in new_data:
        # This is a channel rename
        new_channel_name = new_data['channel_name'].strip()
        
        # Security: sanitize the name
        if len(new_channel_name) == 0:
            return jsonify({"error": "Channel name cannot be empty"}), 400
        
        # Max 30 characters, only safe characters
        new_channel_name = new_channel_name[:30]
        new_channel_name = ''.join(c for c in new_channel_name if c.isalnum() or c in ' -_')
        
        try:
            # Read existing data
            with open(filepath, 'r') as file:
                data = json.load(file)
            
            # Update channel name
            data['channel_name'] = new_channel_name
            
            # Write back
            with open(filepath, 'w') as file:
                json.dump(data, file, indent=2)
            
            print(f"✅ Channel {chat_id} renamed to: {new_channel_name}")
            return jsonify({"success": True, "channel_name": new_channel_name}), 200
        
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    # Otherwise, it's a regular message
    # Count number of messages in chatlog (for appending uid)
    with open(filepath, 'r') as file:
        data = json.load(file)
        msg_len = len(data['messages'])

    new_data['uid'] = msg_len
    new_data['timestamp'] = datetime.now().isoformat()
    new_data['date'] = datetime.now().strftime("%d/%m/%Y")
    new_data['time'] = datetime.now().strftime("%H:%M")
    
    try:
        # Read existing messages
        with open(filepath, 'r') as file:
            data = json.load(file)
        
        # Make sure channel_name exists
        if 'channel_name' not in data:
            data['channel_name'] = f'Room {chat_id}'
        
        # Append new message
        data['messages'].append(new_data)
        
        # Write back to file
        with open(filepath, 'w') as file:
            json.dump(data, file, indent=2)
        
        print(f"✅ Message {msg_len} added to chat {chat_id}")
        return jsonify({"success": True, "message": new_data}), 201
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Serve static files
@server.route("/")
def get_webcli_index():
    return send_from_directory("static", "index.html")

@server.route("/static/<path:filename>")
def get_static(filename):
    return send_from_directory("static", filename)

@server.route("/assets/<asset_type>/<asset_file>", methods=["GET"])
def get_webcli_assets(asset_type, asset_file):
    return send_from_directory(f"assets/{asset_type}", asset_file)

if __name__ == "__main__":
    # Create chats directory if it doesn't exist
    os.makedirs("chats", exist_ok=True)
    print("=" * 50)
    print("Starting wirechat server...")
    print("Server: http://localhost:5000")
    print("=" * 50)
    server.run(debug=True, port=5000)