import React, { useState } from 'react';
import { Alert, Button, Form, InputNumber, Upload } from 'antd';
import { CheckCircleOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Info from '@educandu/educandu/components/info.js';
import { FORM_ITEM_LAYOUT } from '@educandu/educandu/domain/constants.js';
import { sectionEditorProps } from '@educandu/educandu/ui/default-prop-types.js';
import ObjectWidthSlider from '@educandu/educandu/components/object-width-slider.js';

const SIZE_WARNING_BYTES = 1_000_000;

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
}

function extractBodyContent(html) {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match ? match[1].trim() : html;
}

function stripLocalExternalTags(html) {
  return html
    .replace(/<link[^>]+href=["'](?!https?:|\/\/|cdn:\/\/)([^"']+)["'][^>]*>\s*/gi, '')
    .replace(/<script[^>]+src=["'](?!https?:|\/\/|cdn:\/\/)([^"']+)["'][^>]*><\/script>\s*/gi, '');
}

function findLocalRefs(html) {
  const cssRefs = [];
  const jsRefs = [];
  const linkRegex = /<link[^>]+href=["']([^"']+)["'][^>]*>/gi;
  const scriptRegex = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
  let m;
  while ((m = linkRegex.exec(html)) !== null) {
    if (!m[1].match(/^(https?:|\/\/|cdn:\/\/)/)) {
      cssRefs.push(m[1].split('/').pop());
    }
  }
  while ((m = scriptRegex.exec(html)) !== null) {
    if (!m[1].match(/^(https?:|\/\/|cdn:\/\/)/)) {
      jsRefs.push(m[1].split('/').pop());
    }
  }
  return { cssRefs, jsRefs };
}

export default function EmbeddedHtmlEditor({ content, onContentChanged }) {
  const { t } = useTranslation('musikisum/educandu-plugin-embedded-html');
  const [pendingCss, setPendingCss] = useState([]);
  const [pendingJs, setPendingJs] = useState([]);
  const [draftContent, setDraftContent] = useState(null);

  const totalSize = (content.html?.length || 0) + (content.css?.length || 0) + (content.js?.length || 0);
  const hasContent = !!content.html;
  const isPending = pendingCss.length > 0 || pendingJs.length > 0;

  const handleHtmlUpload = async file => {
    const text = await readFileAsText(file);
    const body = extractBodyContent(text);
    const { cssRefs, jsRefs } = findLocalRefs(text);
    const cleanedHtml = stripLocalExternalTags(body);
    const next = { ...content, html: cleanedHtml, css: '', js: '' };

    if (cssRefs.length === 0 && jsRefs.length === 0) {
      onContentChanged(next);
    } else {
      setDraftContent(next);
      setPendingCss(cssRefs);
      setPendingJs(jsRefs);
    }
  };

  const handleCssUpload = async (file, filename) => {
    const text = await readFileAsText(file);
    const remaining = pendingCss.filter(f => f !== filename);
    const next = { ...draftContent, css: draftContent.css + text };
    if (remaining.length === 0 && pendingJs.length === 0) {
      onContentChanged(next);
      setDraftContent(null);
      setPendingCss([]);
    } else {
      setDraftContent(next);
      setPendingCss(remaining);
    }
  };

  const handleJsUpload = async (file, filename) => {
    const text = await readFileAsText(file);
    const remaining = pendingJs.filter(f => f !== filename);
    const next = { ...draftContent, js: draftContent.js + text };
    if (remaining.length === 0 && pendingCss.length === 0) {
      onContentChanged(next);
      setDraftContent(null);
      setPendingJs([]);
    } else {
      setDraftContent(next);
      setPendingJs(remaining);
    }
  };

  const handleWidthChange = value => onContentChanged({ ...content, width: value });
  const handleHeightChange = value => onContentChanged({ ...content, height: value });

  return (
    <div className="EP_Musikisum_EmbeddedHtml_Editor">
      <Form labelAlign="left">

        <Form.Item label={t('htmlFile')} {...FORM_ITEM_LAYOUT}>
          <div className="EP_Musikisum_EmbeddedHtml_Editor-uploadRow">
            <Upload
              accept=".html,.htm"
              showUploadList={false}
              beforeUpload={file => { handleHtmlUpload(file); return false; }}
            >
              <Button icon={<UploadOutlined />}>{t('uploadHtml')}</Button>
            </Upload>
            {hasContent && !isPending && (
              <CheckCircleOutlined className="EP_Musikisum_EmbeddedHtml_Editor-check" />
            )}
          </div>
        </Form.Item>

        {pendingCss.map(filename => (
          <Form.Item key={filename} label={`CSS: ${filename}`} {...FORM_ITEM_LAYOUT}>
            <Upload
              accept=".css"
              showUploadList={false}
              beforeUpload={file => { handleCssUpload(file, filename); return false; }}
            >
              <Button icon={<UploadOutlined />}>{t('uploadFile')}</Button>
            </Upload>
          </Form.Item>
        ))}

        {pendingJs.map(filename => (
          <Form.Item key={filename} label={`JS: ${filename}`} {...FORM_ITEM_LAYOUT}>
            <Upload
              accept=".js"
              showUploadList={false}
              beforeUpload={file => { handleJsUpload(file, filename); return false; }}
            >
              <Button icon={<UploadOutlined />}>{t('uploadFile')}</Button>
            </Upload>
          </Form.Item>
        ))}

        {totalSize > SIZE_WARNING_BYTES && (
          <Form.Item {...FORM_ITEM_LAYOUT}>
            <Alert type="warning" message={t('sizeWarning')} showIcon />
          </Form.Item>
        )}

        <Form.Item
          label={<Info tooltip={t('common:widthInfo')}>{t('common:width')}</Info>}
          {...FORM_ITEM_LAYOUT}
        >
          <ObjectWidthSlider value={content.width} onChange={handleWidthChange} />
        </Form.Item>

        <Form.Item
          label={<Info tooltip={t('heightInfo')}>{t('height')}</Info>}
          {...FORM_ITEM_LAYOUT}
        >
          <InputNumber
            min={50}
            value={content.height}
            onChange={handleHeightChange}
            addonAfter="px"
          />
        </Form.Item>

      </Form>
    </div>
  );
}

EmbeddedHtmlEditor.propTypes = {
  ...sectionEditorProps
};
