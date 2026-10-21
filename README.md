# szimnau.dk

Source for [szimnau.dk](https://szimnau.dk): a static Astro 7 site in English, Danish and German, deployed by Cloudflare Workers Builds on every push to `main`. Development rules are in `CLAUDE.md`.

## Set up on a new machine

1. Install Git and fnm (a Node version manager that reads `.node-version`).

   ```powershell
   winget install --id Git.Git -e
   winget install --id Schniz.fnm -e
   # Add to your PowerShell profile so it loads in every session:
   fnm env --use-on-cd --shell powershell | Out-String | Invoke-Expression
   ```

2. Clone, install the pinned Node version and build.

   ```powershell
   git clone https://github.com/RolfSzimnau/szimnau-dk.git
   cd szimnau-dk
   fnm install         # installs the version in .node-version (24)
   fnm use
   node -v             # must be v24.x
   npm ci              # also enables the pre-commit hook in .githooks/
   npm run build
   npm run validate    # must report 0 fejl
   npm run dev         # http://localhost:4321/en/
   ```

3. Optional: install Claude Code. `CLAUDE.md`, the skills in `.claude/skills/` and the session hook come with the repo.

No `.env` file or secrets are needed to build the site.

## What lives outside this repo

The code is complete in git. These settings are not, so check them after any account or project change and keep this list current.

| Where | Setting | Value |
| --- | --- | --- |
| Cloudflare, Workers project `szimnau-dk` | Git connection | `RolfSzimnau/szimnau-dk`, production branch `main` |
| | Build command | `npm run build` (without it, pagefind and the CSP are skipped) |
| | Build variables | none. Do not set `NODE_VERSION` (`.node-version` decides) |
| | Custom domains | `szimnau.dk` and `www.szimnau.dk` (the Worker redirects www to the apex) |
| | Web Analytics | on (allowed in the CSP) |
| Cloudflare, zone `szimnau.dk` | DNS records | export with **DNS > Records > Export** and store a copy outside this machine |
| | Mail DNS | SPF, DKIM and DMARC records for the mail provider |
| Domain registrar | Registration and nameservers | `<registrar-name>`, nameservers point to Cloudflare, renewal date `<yyyy-mm-dd>` |
| GitHub | Repository settings | Dependabot on, Actions enabled, branch protection on `main` if set |

## Accounts and recovery

Losing the machine is only a problem if it held the only way to sign in. For GitHub, Cloudflare, the registrar and the mail account:

- Keep the recovery codes somewhere other than this machine, such as a password manager or a printed copy.
- Use passkeys that sync (password manager or phone) or a hardware key, not a passkey stored only on this machine.
- Make sure each account has at least two sign-in methods.

## Recurring tasks

- **security.txt:** renew `Expires` in `public/.well-known/security.txt` once a year. CI fails 30 days before it expires.
- **Dependabot PRs:** merge when CI is green. Read the release notes for major versions.

## Rollback

- **Bad deploy:** revert the commit on GitHub (`git revert <commit>` and push). Cloudflare deploys the previous state. A faster fallback is to roll back to an earlier version under **Deployments** in the Cloudflare project.
- **CSP blocks something:** add the host to `scripts/build-csp.mjs`, or remove `&& node scripts/build-csp.mjs` from the `build` script to drop the CSP entirely.

## Troubleshooting

- **Cloudflare build fails on Node:** Astro 7 needs Node `>=22.23.4`. Remove any `NODE_VERSION` build variable so `.node-version` (24) applies.
- **`npm run validate` fails on security.txt:** set `Expires` one year ahead.
- **Pre-commit hook blocks a commit:** fix what it reports, or skip it once with `git commit --no-verify`.
- **CSP header missing on the live site:** the Cloudflare build command is not `npm run build`.
