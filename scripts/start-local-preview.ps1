param(
  [int]$Port = 3900
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $ProjectRoot

$Node = (Get-Command node.exe).Source
$NextBin = Join-Path $ProjectRoot "node_modules\next\dist\bin\next"

& $Node $NextBin start -p $Port
