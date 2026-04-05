# New subject / grade content checklist

1. Copy `skilltree.template.json` into `content/<locale>/<subject>/<grade>/skilltree.json`
2. Rename placeholder IDs (`subject-skill-*`) to stable IDs
3. Keep titles/descriptions child-friendly and parent-readable
4. Make `prerequisites` point only to earlier skills
5. Tune `mastery.passScore` + `mastery.repetitions` per skill
6. If you need fixed item pools, copy `exercises.template.json`
7. Keep files small; split by grade instead of one giant content blob
8. Run the validator before merging if available in the repo workflow
