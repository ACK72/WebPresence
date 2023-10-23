# Check if running as administrator
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
	Write-Host "Please run this script as an administrator."
	Exit 1
}

# Remove directory and all its files
$dirPath = "$env:ProgramFiles\WebPresence"
if (Test-Path $dirPath) {
	Remove-Item $dirPath -Recurse -Force
}

# Remove registry key
$registryPath = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\ack72.webpresence"
if (Test-Path $registryPath) {
	Remove-Item $registryPath -Force
}

# Print message to user and prompt to exit
Write-Host "Uninstallation complete. Press Enter to exit."
Read-Host | Out-Null