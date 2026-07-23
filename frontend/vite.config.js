import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

function inlineMainCss() {
  return {
    name: "inline-main-css",
    apply: "build",
    enforce: "post",

    generateBundle(options, bundle) {
      const htmlFile = bundle["index.html"];

      if (!htmlFile || htmlFile.type !== "asset") {
        return;
      }

      let html = String(htmlFile.source);

      for (const [fileName, file] of Object.entries(bundle)) {
        if (file.type !== "asset" || !fileName.endsWith(".css")) {
          continue;
        }

        const cssPath = `/${fileName}`;

        if (!html.includes(cssPath)) {
          continue;
        }

        const css =
          typeof file.source === "string"
            ? file.source
            : Buffer.from(file.source).toString("utf8");

        const linkPattern = new RegExp(
          `<link[^>]*href=["']${cssPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}["'][^>]*>`,
          "g"
        );

        html = html.replace(linkPattern, `<style>${css}</style>`);
        delete bundle[fileName];
      }

      htmlFile.source = html;
    },
  };
}

export default defineConfig({
  plugins: [react(), inlineMainCss()],
});
