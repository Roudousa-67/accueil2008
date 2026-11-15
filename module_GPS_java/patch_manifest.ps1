# Ajoute au manifeste : les permissions d'encastrement et le module GpsDockInit
param([string]$Path)
$x = [IO.File]::ReadAllText($Path)
if ($x -match 'GpsDockInit') { Write-Host "Manifeste deja modifie"; exit 0 }
$perms = @(
  'android.permission.ACTIVITY_EMBEDDING',
  'android.permission.MANAGE_ACTIVITY_STACKS',
  'android.permission.INTERACT_ACROSS_USERS',
  'android.permission.INJECT_EVENTS'
) | ForEach-Object { '    <uses-permission android:name="' + $_ + '"/>' }
$x = $x -replace '(<application\b)', (($perms -join "`r`n") + "`r`n    `$1")
$prov = '        <provider android:name="fr.gtline.accueil2008.GpsDockInit" android:authorities="fr.gtline.accueil2008.gpsdock" android:exported="false"/>'
$x = $x -replace '(</application>)', ($prov + "`r`n    `$1")
if ($x -notmatch 'GpsDockInit') { Write-Host "ERREUR : balise application introuvable"; exit 1 }
[IO.File]::WriteAllText($Path, $x, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Manifeste modifie"
