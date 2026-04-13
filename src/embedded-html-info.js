import joi from 'joi';
import React from 'react';
import { CodeOutlined } from '@ant-design/icons';
import cloneDeep from '@educandu/educandu/utils/clone-deep.js';
import { PLUGIN_GROUP } from '@educandu/educandu/domain/constants.js';
import { couldAccessUrlFromRoom } from '@educandu/educandu/utils/source-utils.js';

const CDN_URL_REGEX = /cdn:\/\/[^\s"'>]+/g;

class EmbeddedHtmlInfo {
  static typeName = 'musikisum/educandu-plugin-embedded-html';

  allowsInput = false;

  getDisplayName(t) {
    return t('musikisum/educandu-plugin-embedded-html:name');
  }

  getIcon() {
    return <CodeOutlined />;
  }

  getGroups() {
    return [PLUGIN_GROUP.mostUsed, PLUGIN_GROUP.other];
  }

  async resolveDisplayComponent() {
    return (await import('./embedded-html-display.js')).default;
  }

  async resolveEditorComponent() {
    return (await import('./embedded-html-editor.js')).default;
  }

  getDefaultContent() {
    return {
      html: '',
      css: '',
      js: '',
      width: 100,
      height: 600
    };
  }

  validateContent(content) {
    const schema = joi.object({
      html: joi.string().allow('').required(),
      css: joi.string().allow('').required(),
      js: joi.string().allow('').required(),
      width: joi.number().min(0).max(100).required(),
      height: joi.number().min(50).required()
    });

    joi.attempt(content, schema, { abortEarly: false, convert: false, noDefaults: true });
  }

  cloneContent(content) {
    return cloneDeep(content);
  }

  redactContent(content, targetRoomId) {
    const redactedContent = cloneDeep(content);

    const redact = text => text.replace(CDN_URL_REGEX, url =>
      couldAccessUrlFromRoom(url, targetRoomId) ? url : ''
    );

    redactedContent.html = redact(redactedContent.html);
    redactedContent.css = redact(redactedContent.css);

    return redactedContent;
  }

  getCdnResources(content) {
    return [
      ...(content.html.match(CDN_URL_REGEX) || []),
      ...(content.css.match(CDN_URL_REGEX) || [])
    ];
  }
}

export default EmbeddedHtmlInfo;
