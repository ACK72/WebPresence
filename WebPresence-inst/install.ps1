# Check if running as administrator
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
	Write-Host "Please run this script as an administrator."
	Exit 1
}

# Create WebPresence directory in Program Files
$programFilesPath = [Environment]::GetFolderPath("ProgramFiles")
$webPresencePath = Join-Path $programFilesPath "WebPresence"
if (-not (Test-Path $webPresencePath)) {
	New-Item -ItemType Directory -Path $webPresencePath | Out-Null
}

# Download executable into WebPresence directory
$webPresenceExcutableUrl = "https://github.com/ACK72/WebPresence/releases/latest/download/WebPresence.exe"
$webPresenceExcutablePath = Join-Path $webPresencePath "WebPresence.exe"
Invoke-WebRequest -Uri $webPresenceExcutableUrl -OutFile $webPresenceExcutablePath

# Write manifest.json into WebPresence directory
$manifestRaw = @{
	"name" = "ack72.webpresence"
	"description" = "WebPresence Native Messaging Host"
	"path" = "WebPresence.exe"
	"type" = "stdio"
	"allowed_origins" = @("chrome-extension://ebgfklknblpignmbjefmohcbebnnnidi/")
}
$manifestJson = ConvertTo-Json $manifestRaw
$webPresenceManifestPath = Join-Path $webPresencePath "manifest.json"
Set-Content -Path $webPresenceManifestPath -Value $manifestJson

# Register registry key
$registryPath = "HKCU:\Software\Google\Chrome\NativeMessagingHosts\ack72.webpresence"
$manifestPath = Join-Path $env:ProgramFiles "WebPresence\manifest.json"
New-Item -Path $registryPath -Force | Out-Null
New-ItemProperty -Path $registryPath -Name "(Default)" -Value $manifestPath -PropertyType String -Force | Out-Null

# Print message to user and prompt to exit
Write-Host "Installation complete. Press Enter to exit."
Read-Host | Out-Null