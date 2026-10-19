/* ---------------------------------------------------------------------------
   Makes marked code blocks runnable, in any language Codapi has a sandbox for.
   Loaded on every page via `site-js` in _config.yml, but Codapi's widget is
   only fetched on pages that contain a runnable block.

   In Markdown, mark a fenced block with an IAL on the line after the fence:

     ```go
     fmt.Println("hi")
     ```
     {: .runnable}

   The sandbox comes from the fence language (see SANDBOXES for aliases);
   `{: .runnable data-sandbox="postgres"}` overrides it. kramdown + rouge put
   both the class and the attribute on the block's outer
   <div class="language-go runnable highlighter-rouge">.

   Code runs on the Codapi cloud (api.codapi.org): free tier, 1,000 runs a
   month across all readers. JavaScript runs in the reader's browser instead.
   --------------------------------------------------------------------------- */

(function () {
  var blocks = document.querySelectorAll("div.runnable[class*='language-']");
  if (blocks.length === 0) return;

  var CODAPI = "https://unpkg.com/@antonz/codapi@0.20.1/dist/snippet.js";
  var SANDBOXES = {
    golang: "go",
    py: "python", python3: "python",
    rb: "ruby",
    js: "javascript",
    ts: "typescript",
    sh: "bash", shell: "bash", console: "bash",
    rs: "rust",
    "c++": "cpp"
  };
  var IN_BROWSER = { javascript: true };

  blocks.forEach(function (block) {
    var language = (block.className.match(/language-(\S+)/) || [])[1];
    var sandbox = block.getAttribute("data-sandbox") || SANDBOXES[language] || language;
    if (!sandbox) return;

    var snippet = document.createElement("codapi-snippet");
    snippet.setAttribute("sandbox", sandbox);
    snippet.setAttribute("editor", "basic");
    if (IN_BROWSER[sandbox]) snippet.setAttribute("engine", "browser");
    block.insertAdjacentElement("afterend", snippet);
  });

  var script = document.createElement("script");
  script.src = CODAPI;
  document.body.appendChild(script);
})();
