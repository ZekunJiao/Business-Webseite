$null = [Console]::In.ReadToEnd()   # Hook-Eingabe (JSON) verwerfen

# Nur bei Upstream-Branch und nur bei Änderungen aktiv
git rev-parse --abbrev-ref --symbolic-full-name '@{u}' *> $null
if ($LASTEXITCODE -eq 0 -and (git status --porcelain)) {
    git add -A *> $null
    git commit -m "chore: Copilot auto-commit" *> $null
    git push *> $null
}

'{}'
