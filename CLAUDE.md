# educandu-plugin-embedded-html

## Projektübersicht
Plugin für educandu, das statische Websites (HTML + CSS + JS) in einem sicheren iframe hostet.

- **GitHub:** https://github.com/musikisum/educandu-plugin-embedded-html
- **npm:** `@musikisum/educandu-plugin-embedded-html`

## Naming-Konventionen
- **typeName:** `musikisum/educandu-plugin-embedded-html`
- **CSS-Prefix:** `EP_Musikisum_EmbeddedHtml_`
- **Dateien:** `embedded-html-info.js`, `embedded-html-display.js`, `embedded-html-editor.js`, `embedded-html-controller.js`, `embedded-html.less`, `embedded-html.yml`

## Content-Modell (DB)
```js
{
  html: '<body>...</body>',  // Text, CDN-URLs bereits eingebaut
  css: 'body { ... }',       // Text
  js: 'console.log(...)',    // Text
  width: 100
}
```
Warnung im Editor ab 1 MB Gesamtgröße.

## Display-Komponente
Baut `srcdoc` aus den drei Feldern zusammen:
```html
<iframe
  sandbox="allow-scripts"
  srcdoc="<!DOCTYPE html><html><head><style>...css...</style></head><body>...html...<script>...js...</script></body></html>"
/>
```
**Wichtig:** KEIN `allow-same-origin` → iframe läuft auf Null-Origin, kein Zugriff auf Session/Cookies der Hauptdomain. CSP nicht nötig (Community-Vertrauen, Sandbox reicht).

## Editor-Komponente (Upload-Workflow)
1. User lädt HTML-Datei hoch → Plugin liest Text, speichert in DB
2. Plugin parst HTML nach lokalen Referenzen: `<img src="...">`, `<link href="...">`, `<script src="...">`
3. Für jede lokale Referenz: Upload-Prompt anzeigen ("Diese Datei wird benötigt: photo.jpg")
4. User lädt Datei hoch → CDN → Plugin ersetzt relativen Pfad durch CDN-URL im gespeicherten HTML
5. CSS- und JS-Dateien werden als Text in die DB übernommen
6. Kein Code-Editor — nur File-Upload, danach kein Bearbeiten mehr

## CDN-Tracking
```js
getCdnResources(content) {
  const regex = /cdn:\/\/[^\s"'>]+/g;
  return [
    ...(content.html.match(regex) || []),
    ...(content.css.match(regex) || [])
  ];
}
```

## Sicherheit
- `sandbox="allow-scripts"` ohne `allow-same-origin`
- Moderation: Vertrauen auf Community, keine Redaktions-Freigabe

## Zugriff
Jeder angemeldete User darf das Plugin anlegen.

## Nächste Schritte (Implementierung)
1. `embedded-html-info.js` — `validateContent`, `getCdnResources` fertigstellen
2. `embedded-html-display.js` — srcdoc-Assembly, iframe-Rendering
3. `embedded-html-editor.js` — Upload-UI: HTML-Upload, Referenz-Erkennung, Asset-Upload-Prompts, Größenwarnung
4. `embedded-html.less` — Styling für Editor und Display
5. `embedded-html.yml` — Übersetzungen (de/en)
6. `embedded-html-controller.js` — prüfen ob nötig, ggf. entfernen
