<div align="center">

# Git Roast

**Brutally honest analysis of your Git habits.**

Your commits tell a story. Git Roast makes sure it's a comedy.

[![npm version](https://img.shields.io/npm/v/gitroast.svg?style=flat-square)](https://www.npmjs.com/package/gitroast)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16-brightgreen.svg?style=flat-square)](https://nodejs.org)

</div>

---

## What is this?

Git Roast scans your **entire repository** — every branch, every author, every commit — and roasts you for your habits. It looks at:

- **When** you commit — 3 AM pushes don't go unnoticed
- **What** you write in commit messages — or the lack thereof
- **How** consistently you commit — streaks, droughts, the works
- **What** you change — 100 files in one commit? bold move

You get a score, a grade, and a set of personalized roasts.

## Usage

### Option 1: npx (Recommended)

No install needed — just run it inside any Git repository:

```bash
npx gitroast
```

By default, gitroast analyzes the **entire repo** across all branches. Use flags to narrow it down:

```bash
# Roast a specific author
npx gitroast --author "John Doe"

# Only analyze a specific branch
npx gitroast --branch main

# Only analyze commits after a certain date
npx gitroast --since "6 months ago"

# Roast a repo in a different directory
npx gitroast --path /path/to/repo

# Use AI-powered roasts
npx gitroast --ai

# Combine flags
npx gitroast --branch dev --author "Jane" --since "2024-01-01"
```

### Option 2: Run from Source

Clone the repo and run it locally:

```bash
# Install dependencies and build
npm install
npm run build

# Link it globally so you can run `gitroast` anywhere
npm link
```

Then use it like any other command:

```bash
gitroast
gitroast --author "Jane"
gitroast --since "2024-01-01"
gitroast --path /path/to/some/other/repo
```

To unlink later:

```bash
npm unlink -g gitroast
```

## Options

| Flag                  | Description                          | Example                     |
| --------------------- | ------------------------------------ | --------------------------- |
| `-a, --author <name>` | Filter commits by a specific author  | `gitroast -a "Jane"`        |
| `-b, --branch <name>` | Only analyze a specific branch       | `gitroast -b main`          |
| `-s, --since <date>`  | Only analyze commits after this date | `gitroast -s "2024-01-01"`  |
| `-p, --path <dir>`    | Path to a Git repository             | `gitroast -p ../other-repo` |
| `--ai`                | Use an LLM to generate roasts        | `gitroast --ai`             |
| `-V, --version`       | Show version number                  | `gitroast -V`               |
| `-h, --help`          | Show help                            | `gitroast -h`               |

## Example Output

```
  ┌─────────────────────────────────────────────┐
  │                                             │
  │   🔥  G I T   R O A S T  🍖              │
  │   Brutally honest Git analysis              │
  │                                             │
  └─────────────────────────────────────────────┘

  📊 Stats for: cadzchua @ my-project
     Total Commits: 342 | First: Jan 3, 2024 | Active Days: 89

  ┌──────────────────────┬──────────┬────────────┐
  │ Category             │  Grade   │  Score     │
  ├──────────────────────┼──────────┼────────────┤
  │ ⏰ Timing            │   C-     │ 42/100     │
  │ 💬 Messages          │   D      │ 31/100     │
  │ 📈 Patterns          │   B+     │ 78/100     │
  │ 📁 Files             │   B      │ 71/100     │
  └──────────────────────┴──────────┴────────────┘

  🏆 Overall: 🎲 CHAOTIC NEUTRAL (55/100)

  ═══════════════════════════════════════════

  🔥 YOUR ROASTS:

  ⏰ 73% of your commits are after midnight. Your code has
     insomnia and so do your bugs. [SAVAGE]

  💬 Your average commit message is 4 characters. A sneeze
     contains more information. [SAVAGE]

  📈 You mass-committed 187 files on a Friday at 5:47 PM.
     We all know what happened there. [SAVAGE]

  📁 You've deleted more lines than you've added. Are you
     building something or just destroying evidence? [SAVAGE]
```

## Scoring

| Level            | Score  | Description                                         |
| ---------------- | ------ | --------------------------------------------------- |
| Golden Developer | 80-100 | You're suspiciously good. Are you even human?       |
| Decent Human     | 60-79  | Normal dev. Some bad habits, but who doesn't?       |
| Chaotic Neutral  | 40-59  | You commit crimes against Git. Sometimes literally. |
| Code Gremlin     | 20-39  | Your Git history is a crime scene.                  |
| Absolute Menace  | 0-19   | You should be banned from version control.          |

## AI-Powered Roasts

The built-in roasts are fun, but if you want something more creative you can plug in your own LLM. Pass the `--ai` flag and gitroast will send your stats to an OpenAI-compatible API and let the model write the roasts for you.

### Setup

Create a `.env` file in the directory where you run gitroast:

```bash
# Required — your API key
GITROAST_API_KEY=sk-your-api-key-here

# Optional — defaults to gpt-4o-mini
GITROAST_MODEL=gpt-4o-mini

# Optional — defaults to OpenAI, but any compatible endpoint works
GITROAST_API_BASE=https://api.openai.com/v1
```

Then run:

```bash
gitroast --ai
```

### Compatible Providers

Anything that speaks the OpenAI chat completions format works. Just swap the base URL:

| Provider    | Base URL                              | Example Model                 |
| ----------- | ------------------------------------- | ----------------------------- |
| OpenAI      | `https://api.openai.com/v1` (default) | `gpt-4o-mini`                 |
| Groq        | `https://api.groq.com/openai/v1`      | `llama-3.3-70b-versatile`     |
| Ollama      | `http://localhost:11434/v1`           | `llama3`                      |
| Together AI | `https://api.together.xyz/v1`         | `meta-llama/Meta-Llama-3-70B` |

If the API call fails for any reason, gitroast falls back to the built-in template roasts automatically.

## Contributing

Contributions are welcome — new roast templates, bug fixes, features, whatever.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/savage-roasts`)
3. Make your changes
4. Commit with a good message (we'll know if you don't)
5. Open a PR

## License

MIT © [cadzchua](https://github.com/cadzchua)

---

<div align="center">

**If this made you laugh (or cry), leave a star.**

[Report Bug](https://github.com/cadzchua/gitroast/issues) · [Request Feature](https://github.com/cadzchua/gitroast/issues)

</div>
