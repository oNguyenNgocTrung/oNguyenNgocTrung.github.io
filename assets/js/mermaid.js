/* ---------------------------------------------------------------------------
   Renders ```mermaid fenced blocks as diagrams. Loaded on every page via
   `site-js` in _config.yml, but Mermaid itself (~1 MB) is only fetched on
   pages that actually contain such a block.

   kramdown + rouge turn a ```mermaid fence into
   <div class="language-mermaid highlighter-rouge"><div class="highlight">
   <pre class="highlight"><code>…</code></pre></div></div>; Mermaid wants a
   bare <pre class="mermaid"> holding the source text, so each wrapper is
   swapped for one before rendering.
   --------------------------------------------------------------------------- */

(function () {
  var blocks = document.querySelectorAll("div.language-mermaid, pre > code.language-mermaid");
  if (blocks.length === 0) return;

  blocks.forEach(function (block) {
    var wrapper = block.tagName === "CODE" ? block.parentElement : block;
    var diagram = document.createElement("pre");
    diagram.className = "mermaid";
    diagram.textContent = block.textContent;
    wrapper.replaceWith(diagram);
  });

  import("https://cdn.jsdelivr.net/npm/mermaid@11.4.1/dist/mermaid.esm.min.mjs").then(function (module) {
    var mermaid = module.default;
    mermaid.initialize({ startOnLoad: false, theme: "default" });
    mermaid.run({ querySelector: "pre.mermaid" });
  });
})();
