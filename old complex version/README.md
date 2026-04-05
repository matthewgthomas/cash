# cash

A tool for supporting decisions about how to distribute humanitarian cash assistance.

## Local development

Install dependencies and start the Vite dev server:

```bash
npm install
npm run dev
```

## Production build

Compile `cash.jsx` into a static site:

```bash
npm run build
```

The production files are written to `dist/`.

## GitHub Pages

The repository includes `.github/workflows/deploy.yml`, which builds and deploys the site on pushes to `main` and from manual workflow runs.

Before the workflow can publish, set the repository's Pages source to `GitHub Actions` in the GitHub Pages settings.

The Vite `base` path is inferred automatically during GitHub Actions builds from `GITHUB_REPOSITORY`, so the generated asset URLs work when the site is served from `https://<user>.github.io/<repo>/`. If you need a different deploy path, set `BASE_PATH` when building.
