$null = [Console]::In.ReadToEnd()   # Hook-Eingabe (JSON) verwerfen

# Nur bei Upstream-Branch und nur bei Änderungen aktiv.
# "prod" ist live auf zekun.de und wird nie automatisch gepusht.
$branch = git rev-parse --abbrev-ref HEAD 2> $null
git rev-parse --abbrev-ref --symbolic-full-name '@{u}' *> $null
if ($branch -ne 'prod' -and $LASTEXITCODE -eq 0 -and (git status --porcelain)) {
    git add -A *> $null
    git commit -m "chore: Copilot auto-commit" *> $null
    git push *> $null
}

'{}'
