# educandu-plugin-embedded-html

[![codecov](https://codecov.io/gh/musikisum/educandu-plugin-embedded-html/branch/main/graph/badge.svg)](https://codecov.io/gh/musikisum/educandu-plugin-embedded-html)

An embedded HTML plugin for educandu

## Prerequisites

* node.js ^20.0.0
* optional: globally installed gulp: `npm i -g gulp-cli`

The output of this repository is an npm package (`@musikisum/educandu-plugin-embedded-html`).

## Development

* Clone this repository
* Run `yarn install`
* Use `gulp build` to build the plugin

## Usage

Import the published package into your educandu driven website:

~~~ sh
$ yarn add @musikisum/educandu-plugin-embedded-html
~~~

Add the plugin info to the application's custom resolvers module:

~~~ js
import EmbeddedHtmlPlugin from '@musikisum/educandu-plugin-embedded-html';

export default {
  resolveCustomPageTemplate: null,
  resolveCustomHomePageTemplate: null,
  resolveCustomSiteLogo: null,
  resolveCustomPluginInfos: () => [EmbeddedHtmlPlugin]
};
~~~

Add the plugin name, the translations and any additional controllers to your server config:

~~~ js
import educandu from '@educandu/educandu';
import { createRequire } from 'node:module';
import EmbeddedHtmlController from '@musikisum/educandu-plugin-embedded-html/embedded-html-controller.js';

const require = createRequire(import.meta.url);
const embeddedHtmlPluginTranslationsPath = require.resolve('@musikisum/educandu-plugin-embedded-html/translations.json');

educandu({
  plugins: [/* your other plugins here */, 'musikisum/educandu-plugin-embedded-html'],
  resources: [/* your other translations here */, embeddedHtmlPluginTranslationsPath],
  additionalControllers: [/* your other additional controllers here */, EmbeddedHtmlController],
  /* your other server config here */
});
~~~

Import the plugin styles to your main LESS entry point:

~~~ less
// Base styles from Educandu:
@import url('@educandu/educandu/styles/main.less');

// Styles for the custom plugin:
@import url('@musikisum/educandu-plugin-embedded-html/embedded-html.less');

// Other styles here
~~~

## Naming conventions

* **Namespace:** `musikisum`
* **Plugin name:** `embedded-html`
* **npm / GitHub name:** `musikisum/educandu-plugin-embedded-html`
* **CSS class prefix:** `EP_Musikisum_EmbeddedHtml_`
* **typeName:** `musikisum/educandu-plugin-embedded-html`

---

## OER learning platform for music

Funded by 'Stiftung Innovation in der Hochschullehre'

<img src="https://stiftung-hochschullehre.de/wp-content/uploads/2020/07/logo_stiftung_hochschullehre_screenshot.jpg)" alt="Logo der Stiftung Innovation in der Hochschullehre" width="200"/>

A Project of the 'Hochschule für Musik und Theater München' (University for Music and Performing Arts)

<img src="https://upload.wikimedia.org/wikipedia/commons/d/d8/Logo_Hochschule_f%C3%BCr_Musik_und_Theater_M%C3%BCnchen_.png" alt="Logo der Hochschule für Musik und Theater München" width="200"/>

Project owner: Hochschule für Musik und Theater München\
Project management: Ulrich Kaiser
