import type { Plugin } from "vite";

function escapeHtml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function page(content: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Static forge</title><link rel="stylesheet" href="/dist/styles.css"><link rel="stylesheet" href="/dist/styles/forms.css"></head><body><div class="ui-shell"><aside class="ui-side"><div class="ui-side-top"><a class="ui-side-brand" href="/static-forge">Forge</a></div><div class="ui-side-body"><nav class="ui-side-nav" aria-label="Main"><a href="/static-forge">Repositories</a></nav></div></aside><main class="ui-main" id="main">${content}</main></div></body></html>`;
}

export function staticForge(): Plugin {
  let name = "Alpha";
  return {
    name: "fixture-static-forge",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? "/", "http://localhost");
        if (url.pathname !== "/static-forge" && !url.pathname.startsWith("/static-forge/")) { next(); return; }
        if (url.pathname === "/static-forge/alpha/settings" && request.method === "POST") {
          let body = "";
          request.setEncoding("utf8");
          request.on("data", chunk => { body += chunk; if (body.length > 4096) request.destroy(); });
          request.on("end", () => {
            const value = new URLSearchParams(body).get("name")?.trim();
            if (!value || value.length > 100) { response.writeHead(400).end("Invalid name"); return; }
            name = value;
            response.writeHead(303, { Location: "/static-forge/alpha" }).end();
          });
          return;
        }
        if (request.method !== "GET") { response.writeHead(405).end(); return; }
        const safeName = escapeHtml(name);
        let content: string;
        if (url.pathname === "/static-forge") {
          const query = url.searchParams.get("q") ?? "";
          const records = [{ id: "alpha", name, status: "Open" }, { id: "beta", name: "Beta", status: "Closed" }].filter(record => record.name.toLowerCase().includes(query.toLowerCase()));
          const rows = records.map(record => `<tr><td><a href="/static-forge/${record.id}">${escapeHtml(record.name)}</a></td><td>${record.status}</td></tr>`).join("");
          content = `<h1>Repositories</h1><form class="ui-table-toolbar" action="/static-forge" method="get"><label class="ui-search">Search repositories <input type="search" name="q" value="${escapeHtml(query)}"></label><button class="ui-btn" type="submit">Search</button></form><div class="ui-table-scroll"><table class="ui-data-table"><thead><tr><th>Repository</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div>`;
        } else if (url.pathname === "/static-forge/alpha") {
          content = `<h1>${safeName}</h1><p>Open repository</p><a href="/static-forge/alpha/settings">Repository settings</a>`;
        } else if (url.pathname === "/static-forge/alpha/settings") {
          content = `<h1>Repository settings</h1><form method="post" action="/static-forge/alpha/settings"><label class="ui-field" for="repository-name"><span class="ui-field-label">Repository name</span><input class="ui-text-field" id="repository-name" name="name" value="${safeName}" maxlength="100" required></label><button class="ui-btn" type="submit">Save repository</button></form>`;
        } else { response.writeHead(404).end("Not found"); return; }
        response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(page(content));
      });
    },
  };
}
