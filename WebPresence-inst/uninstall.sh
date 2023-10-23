#!/bin/bash

# Detect the host OS
if [[ "$OSTYPE" == "darwin"* ]]; then
	# macOS
	FILEPATH="$HOME/Library/Application Support/Google/Chrome/NativeMessagingHosts/ack72.webpresence.json"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
	# Linux
	FILEPATH="$HOME/.config/google-chrome/NativeMessagingHosts/ack72.webpresence.json"
else
	# Unsupported OS
	echo "Error: Unsupported OS"
	exit 1
fi

# Remove files
rm "$FILEPATH"
rm -rf "$HOME/.WebPresence"

# Inform user that uninstallation is finished
echo "Uninstallation finished. Press enter to exit."
read