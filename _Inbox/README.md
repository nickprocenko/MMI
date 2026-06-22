# _Inbox — File Drop Zone

Drop any files or links here and ask Claude to **process the inbox**. Files will be read, identified, moved to the correct course folder, and the relevant README checklist will be updated automatically.

## How to Add Files

| What you have | What to do |
|---|---|
| PDF / Word doc / letter | Drag and drop into this folder via GitHub or commit directly |
| Web page / government page | Paste the URL into `links.txt` in this folder |
| Scanned document | Upload the image or PDF here |

## How to Trigger Processing

Just message Claude:
> "process the inbox"

Claude will:
1. Read every file and URL in this folder
2. Identify what each item is (course letter, directive, regulation, etc.)
3. Move it to the correct folder (`Documents/`, `Codebooks/`, `Study_Materials/`, etc.)
4. Tick the matching checklist item in the course README
5. Report back what was sorted and what is still missing

## links.txt Format

Paste one URL per line:

```
https://laws-lois.justice.gc.ca/eng/acts/W-6/
https://ised-isde.canada.ca/site/measurement-canada/en/...
```

## Currently Waiting

*(Claude will update this section after each processing run)*

| File / URL | Status |
|---|---|
| — | Inbox is empty |
