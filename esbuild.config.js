const esbuild = require("esbuild");
const fs = require("fs");
const path = require("path");
const isWatch = process.argv.includes("--watch");

/** @type {esbuild.BuildOptions} */
const base = {
  bundle: true,
  sourcemap: true,
  target: "es2018",
  loader: {
    ".tsx": "tsx",
    ".ts": "ts",
    ".html": "text"
  }
};

async function buildOnce() {
  // 1) Build UI bundle first
  await esbuild.build({
    entryPoints: ["src/ui.tsx"],
    outfile: "dist/ui.js",
    platform: "browser",
    format: "iife",
    bundle: true,
    sourcemap: true,
    target: "es2018"
  });

  const uiJs = fs.readFileSync(path.resolve("dist/ui.js"), "utf8");
  const uiCss = fs.readFileSync(path.resolve("src/ui.css"), "utf8");
  const inlineHtml = [
    "<!doctype html>",
    '<html lang=\"en\">',
    "<head>",
    '<meta charset=\"UTF-8\" />',
    '<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />',
    "<title>WCAG 2.2 Checker</title>",
    "<style>",
    uiCss,
    "</style>",
    "</head>",
    "<body>",
    '<div id=\"root\"></div>',
    "<script>",
    uiJs,
    "</script>",
    "</body>",
    "</html>"
  ].join("");

  // also write an inline HTML file for debugging / manifest UI if needed
  const distDir = path.resolve("dist");
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true });
  fs.writeFileSync(path.join(distDir, "ui.html"), inlineHtml, "utf8");

  // 2) Build main, injecting inline UI string
  await esbuild.build({
    entryPoints: ["src/code.ts"],
    outfile: "dist/code.js",
    platform: "node",
    bundle: true,
    sourcemap: true,
    target: "es2018",
    define: {
      __UI_HTML__: JSON.stringify(inlineHtml)
    },
    loader: { ".html": "text" }
  });
}

async function buildWatch() {
  await buildOnce();
  // naive watch: rebuild everything when any source changes
  const ctx = await esbuild.context({
    entryPoints: ["src/code.ts"],
    outfile: "dist/code.js",
    platform: "node",
    bundle: true,
    sourcemap: true,
    target: "es2018",
    define: {
      __UI_HTML__: JSON.stringify(fs.readFileSync(path.resolve("dist/ui.html"), "utf8"))
    },
    loader: { ".html": "text" }
  });
  await ctx.watch();

  const uiCtx = await esbuild.context({
    entryPoints: ["src/ui.tsx"],
    outfile: "dist/ui.js",
    platform: "browser",
    format: "iife",
    bundle: true,
    sourcemap: true,
    target: "es2018"
  });
  await uiCtx.watch();
}

if (isWatch) {
  buildWatch().catch((err) => {
    console.error(err);
    process.exit(1);
  });
} else {
  buildOnce().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
