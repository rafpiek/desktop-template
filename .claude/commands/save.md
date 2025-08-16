When the user types `/save`, execute the following:
1. Check git status to see what files have changed
2. Add all modified files to staging
3. Create a commit with a descriptive message based on the changes
4. Push the commit to the remote repository (origin/main)

Example workflow:
```bash
git add -A
git commit -m "feat/fix/style: descriptive message based on changes"
git push origin main
```

The commit message should follow conventional commits format and be descriptive of the actual changes made.
