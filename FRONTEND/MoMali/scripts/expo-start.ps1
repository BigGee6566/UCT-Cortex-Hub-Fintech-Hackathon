param(
  [Parameter(ValueFromRemainingArguments = $true)]
  [string[]]$Args
)

$ErrorActionPreference = 'Stop'
# Prefer IPv4 to avoid undici IPv6 timeouts on networks without IPv6 routing.
$env:NODE_OPTIONS = '--dns-result-order=ipv4first'

npx expo start @Args
