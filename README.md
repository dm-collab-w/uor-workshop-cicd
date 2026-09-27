## How to use this guide

Copy commands into your terminal and YAML into the named file in your editor. Replace placeholders such as `YOUR-USERNAME` with your own details. Save files before running commands or committing.

At each **Checkpoint**, show your result to your group. If you are stuck, use [Troubleshooting](#troubleshooting) or ask a helper before moving on. Keep all work in this one repository.

[Lab 1: run locally](#lab-1--fork-clone-and-run) · [Lab 2: first CI](#lab-2--create-your-first-workflow) · [Lab 3: break](#lab-3--break-one-test-deliberately) · [Lab 4: fix](#lab-4--read-the-logs-and-fix) · [Lab 5: artifact](#lab-5--build-and-upload-an-artifact) · [Lab 6: deploy](#lab-6--deploy-to-github-pages)

## Before you start

Work in groups of 3–4. Use one GitHub account/fork and one prepared laptop per group. Rotate the driver, navigator and debugger; the fourth person reports progress. Do not share passwords.

You need Git, **Node.js 24 LTS** (with npm), an editor, and a GitHub account with Git push authentication working. No AWS account, secret, credit card or Docker installation is required for the student labs.

```sh
node --version
npm --version
git --version
```

Use Node 24 for class to match CI. On Windows, use Git Bash or PowerShell; if PowerShell blocks npm.ps1, use `npm.cmd` in place of `npm`.

## Lab 1 — Fork, clone and run

A **fork** is your group's own copy on GitHub. A **clone** downloads that copy to your laptop. You push changes to your own fork, which can publish its own website.

1. Open the repository link supplied by the presenter.
2. Click **Fork → Create fork**. Keep it public, named `cicd-workshop`, with default branch `main`.
3. On **your fork**, click Code and copy the HTTPS clone URL.
4. Replace YOUR-USERNAME below with your fork owner's username:

```sh
git clone https://github.com/YOUR-USERNAME/cicd-workshop.git
cd cicd-workshop
git remote -v
npm ci
npm test
npm start
```

Open **http://localhost:3000** in your browser. You should see the **Launch Club** page with “Make it. Break it. Ship it.” and a team release card. The remote must name your fork. Three tests should pass. npm ci checks the lockfile; there are no third-party dependencies to download.

Leave this terminal running. Open a second terminal in the same project folder for tests/Git. Stop a server with Ctrl+C. Save and refresh to see changes; this small server does not auto-reload.

Open `src/main.js`: it contains the team, version and message shown on the page. The READY TO SHIP label is ordinary display text, not a live Actions status badge.

**Checkpoint — Lab 1**

- [ ] `git remote -v` points to your group's fork.
- [ ] All three tests pass locally.
- [ ] Your browser shows the local website.

## Lab 2 — Create your first workflow

In the project root (beside `package.json`), create a folder named `.github`, then a folder inside it named `workflows`, then a file inside that named `ci.yml`. The complete path is `.github/workflows/ci.yml`. Use spaces, not tabs, in YAML. The starting repository intentionally has no active workflow: you create it now.

```yaml
name: CI
on:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          persist-credentials: false
      - uses: actions/setup-node@v7
        with:
          node-version: '24'
          package-manager-cache: false
      - run: npm ci
      - run: npm test
      - run: npm run build
```

| Word | Meaning |
|---|---|
| name | Workflow label in Actions |
| on | What starts it: a push to main |
| jobs | Work GitHub schedules |
| runs-on | The runner machine GitHub provides |
| steps | Operations performed in order |
| uses | Run an existing action: checkout or set up Node |
| run | Execute a shell command |

The build has read-only repository access. Checkout does not retain credentials; dependency caching is off because this app has no dependencies.

Save the file. In your second terminal, inside `cicd-workshop`, run:

```sh
git add .github/workflows/ci.yml
git commit -m "Add our first CI pipeline"
git push origin main
```

Open **your fork → Actions → newest run → build**. Expand npm ci, npm test and npm run build. Confirm the run matches your commit. If GitHub asks you to enable workflows, enable them. If the earlier push did not trigger, push a new commit as described in troubleshooting below.

**Checkpoint — Lab 2**

- [ ] The newest run in **your fork's Actions tab** is green.
- [ ] You can find the install, test and build steps in the `build` job.

## Lab 3 — Break one test deliberately

Open `tests/utils.test.js` in your editor. Find `assert.equal(add(2, 2), 4);` and replace that line with:

```js
assert.equal(add(2, 2), 5); // Originally 4. Five is deliberately wrong.
```

```sh
git add tests/utils.test.js
git commit -m "Break a test on purpose"
git push origin main
```

Save and push this deliberately broken test using the commands above. Open the newest Actions run. `npm test` fails: one test fails, two pass. The subsequent build step is skipped. Leave the test broken until Lab 4.

**Checkpoint — Lab 3**

- [ ] The latest Actions run is red because `npm test` failed.
- [ ] `npm run build` was skipped.

This is the expected result. There is no deployment yet; you will prove that deployment is blocked in Lab 6.

## Lab 4 — Read the logs and fix

Open **failed run → build job → npm test step**. Find the assertion and filename:

```text
AssertionError: Expected values to be strictly equal
actual: 4
expected: 5
... tests/utils.test.js ...
```

Actual means what the function returned; expected means what the test asked for. The final exit code indicates success (0) or failure (nonzero). The earlier diagnostic tells you the cause.

Change the line back to the following and save:

```js
assert.equal(add(2, 2), 4);
```

Run the tests locally, then send the fix to GitHub:

```sh
npm test
git add tests/utils.test.js
git commit -m "Fix the test expectation"
git push origin main
```

The new run should be green. Historical failed runs stay red; check the latest commit.

**Checkpoint — Lab 4**

- [ ] You found `actual: 4` and `expected: 5` in the failed log.
- [ ] Local tests and the newest Actions run are green again.

## Break — 10 minutes

Return at the time announced by the presenter. Keep your project open.

## Lab 5 — Build and upload an artifact

First, build on your laptop:

```sh
npm run build
```

Look in your editor: a `dist/` folder now contains `index.html` and `src/`. This is the website output. It is ignored by Git; do not commit it.

An artifact is the output we keep from a build. Add this step after `npm run build` in the **same ci.yml**, aligned with the other steps:

```yaml
      - uses: actions/upload-artifact@v7
        with:
          name: site-${{ github.sha }}
          path: dist/
          if-no-files-found: error
          retention-days: 7
```

```sh
git add .github/workflows/ci.yml
git commit -m "Save the built website as an artifact"
git push origin main
```

Open the successful run's summary → **Artifacts** → download `site-…`. Sign into GitHub to download, then extract the ZIP. It contains:

```text
index.html
src/
  main.js
  style.css
  utils.js
```

To preview the built output locally, stop npm start first, then:

```sh
npm run build
npm run preview
```

Open localhost:3000. Preview serves dist; rebuild before expecting source edits to appear. The build also checks JavaScript syntax, so a typo such as an unescaped apostrophe cannot silently ship a syntax-broken page.

<details>
<summary>Complete Lab 5 workflow — open if your YAML is stuck</summary>

```yaml
name: CI
on:
  push:
    branches: [main]
permissions:
  contents: read
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          persist-credentials: false
      - uses: actions/setup-node@v7
        with:
          node-version: '24'
          package-manager-cache: false
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-artifact@v7
        with:
          name: site-${{ github.sha }}
          path: dist/
          if-no-files-found: error
          retention-days: 7
```

</details>

**Checkpoint — Lab 5**

- [ ] `npm run build` creates `dist/` locally.
- [ ] Your latest GitHub run is green and has a `site-…` artifact.
- [ ] You downloaded and extracted the artifact and found `index.html` and `src/`.

## Lab 6 — Deploy to GitHub Pages

### 6.1 Configure your own fork

Open **Settings → Pages → Build and deployment → Source → GitHub Actions**. Keep main as the default branch. Do not generate another workflow from a suggested template.

Actions must be enabled, the official actions allowed by repository policy, and the `github-pages` environment must allow main. Classroom personal repositories should not require deployment reviewers. Do not bypass organisation rules; use the presenter's demo if policy blocks your fork.

### 6.2 Replace the workflow with the deployment version

Replace the complete content of `.github/workflows/ci.yml` with this final version. Keep exactly one active workflow, not a separate deploy.yml.

```yaml
name: CI and Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
concurrency:
  group: pages
  cancel-in-progress: false
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
        with:
          persist-credentials: false
      - uses: actions/setup-node@v7
        with:
          node-version: '24'
          package-manager-cache: false
      - run: npm ci
      - run: npm test
      - run: npm run build
      - name: Configure Pages
        uses: actions/configure-pages@v6
      - name: Upload tested site
        uses: actions/upload-pages-artifact@v5
        with:
          path: dist/
  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy the existing artifact
        id: deployment
        uses: actions/deploy-pages@v5
```

Tests run before build/upload. **needs: build** means deploy requires the build job to succeed. Only deploy gets Pages/OIDC write permissions. The deploy job has no checkout/build command: it deploys the artifact from this run. Concurrency avoids overlapping Pages deployments.

The Pages-specific upload replaces the generic Lab 5 upload. It packages the same dist directory using the default artifact name `github-pages`. No AWS credentials or personal token is needed.

### 6.3 Personalize and publish your team page

In `src/main.js`, edit these values without changing the surrounding code:

```js
const team = 'Team 12';
const version = '1.0.1';
const message = 'Hello university — we shipped this automatically!';
```

If your text contains a single quote, use double quotes around the string, for example `const team = "Darshana's team";`.

```sh
npm test
npm run build
git add src/main.js .github/workflows/ci.yml
git commit -m "Deploy our team website"
git push origin main
```

Open the newest run. After **build and deploy** succeed, open the environment URL shown in the run or Settings → Pages. Usually:

```text
https://YOUR-USERNAME.github.io/cicd-workshop/
```

Use GitHub's actual URL, including your repository name and trailing slash. Relative `./src/` links work with any fork owner/repository name. Wait briefly for propagation, refresh and find your new message.

### 6.4 Prove failed tests block deployment

After one successful deployment:

1. Note the current live message.
2. Change the test expectation from 4 to **5** again.
3. Change the page message to **'This message must wait for the tests to pass.'**
4. Commit and push both files:

```sh
git add tests/utils.test.js src/main.js
git commit -m "Prove a failed test blocks deployment"
git push origin main
```

Observe **build failed → deploy skipped**. Refresh the live website: the old message remains.

Restore expected **4**, leaving the new message in place:

```sh
npm test
git add tests/utils.test.js
git commit -m "Fix the test and allow deployment"
git push origin main
```

Wait for successful deployment and refresh. The new message now appears. If time is short, follow the presenter's demonstration of this proof.

**Checkpoint — Lab 6**

- [ ] Your team website has a public GitHub Pages URL.
- [ ] A deliberately failed test caused `deploy` to be skipped.
- [ ] The live page kept its previous message during that failure.
- [ ] After fixing the test, deployment succeeded and the new message appeared.

## Before you finish

Share your fork URL and live website URL as directed by the presenter. Be ready to show one green run and one failed run with deployment skipped. Your final test should expect **4**, and your latest pipeline should be green.

Discuss with your group: what triggered CI, where did it run, what was in the artifact, and which line prevented a failed build from deploying? Look for `needs: build` in your workflow.

If Docker is demonstrated, watch and compare its packaged output with `dist/`. Docker is optional for the presenter; you do not need to install it.

## Troubleshooting

| Problem | First fix |
|---|---|
| Node/npm missing or too old | Install Node 24 LTS before class and reopen terminal. During class pair with a ready laptop. |
| PowerShell blocks npm | Use npm.cmd or Git Bash. |
| npm ci cannot find package.json | Enter the cloned repository directory; run pwd to check. |
| Lockfile mismatch | Undo accidental package edits. Intentional dependency changes need npm install and both package files committed. |
| npm cache permissions | Try npm ci --cache .npm-cache; that folder is gitignored. Work in a user-owned folder; do not use sudo. |
| Port 3000 busy | Ctrl+C the previous server, or npm start -- --port 3001. Preview accepts the same flag. |
| Page stays on Loading | Use the HTTP URL, not file://. Check browser Console and run npm run build to check syntax. |
| Git identity missing | git config user.name "Your Name" and git config user.email "YOUR-EMAIL", then commit again. |
| Push denied | git remote -v must name your fork. Use normal Git credential-manager/browser authentication; never put credentials in YAML. |
| Cloned the original | Fork on GitHub, then git remote set-url origin https://github.com/YOUR-USERNAME/cicd-workshop.git. |
| Push rejected after online edit | Commit your local work, git pull --rebase origin main; ask a helper about conflicts. No force push. |
| No workflow run | Check .github/workflows/ci.yml, main branch, pushed commit and enabled Actions. |
| YAML invalid | Use spaces, not tabs; compare with the exact README block. |
| Local tests green, CI red | Check saved/committed files, newest run SHA, Node version and filename case on Linux. |
| Old run still red | Open the newest commit's run. Historical results do not change. |
| Pages configure step fails | Select GitHub Actions as Pages source on this fork, then rerun the failed workflow. |
| Pages gives 404 | Wait after successful deploy; use the actual environment URL with repository suffix. Build green alone is not deployment. |
| JS/CSS 404 | Keep ./src paths, upload dist/ with index.html at its root, and use the exact site URL. |
| Permission denied / environment waiting | Check Actions policy, pages/id-token permissions in deploy, and github-pages main/approval rules. No personal token required. |
| Artifact missing | Confirm successful build/upload and dist/. Final Pages workflow needs upload-pages-artifact. Rerun the entire workflow if its artifact expired. |
| Actions queued | Wait for the existing run; inspect logs/output while waiting instead of pushing repeatedly. |

After enabling previously disabled Actions, you can trigger a new run with:

```sh
git commit --allow-empty -m "Run CI after enabling Actions"
git push origin main
```

