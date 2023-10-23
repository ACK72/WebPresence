#!/bin/bash

# Detect the host OS
if [[ "$OSTYPE" == "darwin"* ]]; then
	# macOS
	FILEPATH="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts/ack72.webpresence.json"
	DOWNLOAD_URL="https://github.com/ACK72/WebPresence/releases/latest/download/WebPresence.macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
	# Linux
	FILEPATH="$HOME/.config/google-chrome/NativeMessagingHosts/ack72.webpresence.json"
	DOWNLOAD_URL="https://github.com/ACK72/WebPresence/releases/latest/download/WebPresence.linux"
else
	# Unsupported OS
	echo "Error: Unsupported OS"
	exit 1
fi

# Write the JSON data to the file
cat <<EOF > "$FILEPATH"
{
	"name": "ack72.webpresence",
	"description": "WebPresence Native Messaging Host",
	"path": "$HOME/.WebPresence/WebPresence",
	"type": "stdio",
	"allowed_origins": [
		"chrome-extension://ebgfklknblpignmbjefmohcbebnnnidi/"
	]
}
EOF

# Download the file from the URL to the path
mkdir -p "$(dirname "$HOME/.WebPresence")"
curl -o "$HOME/.WebPresence/WebPresence" "$DOWNLOAD_URL"
chmod +x "$HOME/.WebPresence/WebPresence"

# Inform user that installation is finished
echo "Installation finished. Press enter to exit."
read