import React, { useEffect, useState } from 'react';
import { Alert, Button, Collapse, Form, Input, InputNumber, Select, Tabs, Upload } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, CodeOutlined, UploadOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Info from '@educandu/educandu/components/info.js';
import { FORM_ITEM_LAYOUT } from '@educandu/educandu/domain/constants.js';
import { sectionEditorProps } from '@educandu/educandu/ui/default-prop-types.js';
import ObjectWidthSlider from '@educandu/educandu/components/object-width-slider.js';
import { extractBodyContent, extractInlineScripts, extractStyles, fixScrollbarIssues, hasScrollbarIssues, stripExtractedTags, stripLocalExternalTags } from './embedded-html-utils.js';
import examples from './embedded-html-examples.js';

const SIZE_WARNING_BYTES = 1_000_000;

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
}

export default function EmbeddedHtmlEditor({ content, onContentChanged }) {
  const { t } = useTranslation('musikisum/educandu-plugin-embedded-html');
  const [previewSrcDoc, setPreviewSrcDoc] = useState(null);

  useEffect(() => {
    if (!content.html && !content.css) {
      setPreviewSrcDoc(null);
      return () => {};
    }
    const timer = setTimeout(() => {
      setPreviewSrcDoc(
        `<!DOCTYPE html><html><head><style>html,body{overflow:hidden;}${content.css}</style></head><body>${content.html}<script>${content.js}</script></body></html>`
      );
    }, 500);
    return () => clearTimeout(timer);
  }, [content.html, content.css, content.js]);

  const totalSize = (content.html?.length || 0) + (content.css?.length || 0) + (content.js?.length || 0);
  const hasContent = !!content.html;

  const handleHtmlUpload = async file => {
    try {
      const text = await readFileAsText(file);
      const css = extractStyles(text);
      const js = extractInlineScripts(text);
      const body = extractBodyContent(text);
      const html = stripExtractedTags(stripLocalExternalTags(body));
      onContentChanged({ ...content, html, css, cssOriginal: null, js });
    } catch {
      // file could not be read — ignore silently, content unchanged
    }
  };

  const handleCssUpload = async file => {
    try {
      const text = await readFileAsText(file);
      onContentChanged({ ...content, css: text, cssOriginal: null });
    } catch {
      // file could not be read — ignore silently, content unchanged
    }
  };

  const handleJsUpload = async file => {
    try {
      const text = await readFileAsText(file);
      onContentChanged({ ...content, js: text });
    } catch {
      // file could not be read — ignore silently, content unchanged
    }
  };

  const handleFixScrollbars = () => {
    onContentChanged({ ...content, cssOriginal: content.css, css: fixScrollbarIssues(content.css) });
  };

  const handleUndoScrollbarFix = () => {
    onContentChanged({ ...content, css: content.cssOriginal, cssOriginal: null });
  };

  const handleHtmlChange = e => onContentChanged({ ...content, html: e.target.value });
  const handleCssChange = e => onContentChanged({ ...content, css: e.target.value, cssOriginal: null });
  const handleJsChange = e => onContentChanged({ ...content, js: e.target.value });
  const handleWidthChange = value => onContentChanged({ ...content, width: value });
  const handleHeightChange = value => onContentChanged({ ...content, height: value });

  const handleClear = () => {
    onContentChanged({ ...content, html: '', css: '', cssOriginal: null, js: '' });
  };

  const handleLoadExample = key => {
    const example = examples.find(e => e.key === key);
    if (example) {
      const update = { ...content, html: example.html, css: example.css, cssOriginal: null, js: example.js };
      if (example.height) {
        update.height = example.height;
      }
      onContentChanged(update);
    }
  };

  const showScrollbarWarning = !!content.css && !content.cssOriginal && hasScrollbarIssues(content.css);

  return (
    <div className="EP_Musikisum_EmbeddedHtml_Editor">
      <Form labelAlign="left">

        <Form.Item label={t('uploads')} {...FORM_ITEM_LAYOUT}>
          <div className="EP_Musikisum_EmbeddedHtml_Editor-uploadRow">
            <Upload
              accept=".html,.htm"
              showUploadList={false}
              beforeUpload={file => { handleHtmlUpload(file); return false; }}
              >
              <Button icon={<UploadOutlined />}>HTML</Button>
            </Upload>
            <Upload
              accept=".css"
              showUploadList={false}
              beforeUpload={file => { handleCssUpload(file); return false; }}
              >
              <Button icon={<UploadOutlined />}>CSS</Button>
            </Upload>
            <Upload
              accept=".js"
              showUploadList={false}
              beforeUpload={file => { handleJsUpload(file); return false; }}
              >
              <Button icon={<UploadOutlined />}>JS</Button>
            </Upload>
            {hasContent ? <CheckCircleOutlined className="EP_Musikisum_EmbeddedHtml_Editor-check" /> : null}
            {hasContent
              ? (
                <Button
                  size="small"
                  icon={<CloseCircleOutlined />}
                  onClick={handleClear}
                  title={t('clearContent')}
                  />
              )
              : null}
            <Select
              value={null}
              placeholder={t('loadExample')}
              className="EP_Musikisum_EmbeddedHtml_Editor-exampleSelect"
              onChange={handleLoadExample}
              options={examples.map(e => ({ value: e.key, label: t(`example_${e.key}`) }))}
              />
          </div>
        </Form.Item>

        {showScrollbarWarning
          ? (
            <Form.Item {...FORM_ITEM_LAYOUT}>
              <Alert
                type="warning"
                showIcon
                message={t('scrollbarWarning')}
                action={<Button size="small" onClick={handleFixScrollbars}>{t('scrollbarFix')}</Button>}
                />
            </Form.Item>
          )
          : null}

        {!!content.cssOriginal && (
          <Form.Item {...FORM_ITEM_LAYOUT}>
            <Alert
              type="info"
              showIcon
              message={t('scrollbarFixed')}
              action={<Button size="small" onClick={handleUndoScrollbarFix}>{t('scrollbarUndo')}</Button>}
              />
          </Form.Item>
        )}

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

        <Form.Item>
          <Collapse
            ghost
            items={[{
              key: 'source',
              label: <span><CodeOutlined /> {t('sourceCode')}</span>,
              children: (
                <div className="EP_Musikisum_EmbeddedHtml_Editor-sourcePanel">
                  <Tabs
                    className="EP_Musikisum_EmbeddedHtml_Editor-codeTabs"
                    items={[
                      {
                        key: 'html',
                        label: 'HTML',
                        children: (
                          <Input.TextArea
                            value={content.html}
                            onChange={handleHtmlChange}
                            autoSize={{ minRows: 8, maxRows: 20 }}
                            className="EP_Musikisum_EmbeddedHtml_Editor-codeArea"
                            />
                        )
                      },
                      {
                        key: 'css',
                        label: 'CSS',
                        children: (
                          <Input.TextArea
                            value={content.css}
                            onChange={handleCssChange}
                            autoSize={{ minRows: 8, maxRows: 20 }}
                            className="EP_Musikisum_EmbeddedHtml_Editor-codeArea"
                            />
                        )
                      },
                      {
                        key: 'js',
                        label: 'JS',
                        children: (
                          <Input.TextArea
                            value={content.js}
                            onChange={handleJsChange}
                            autoSize={{ minRows: 8, maxRows: 20 }}
                            className="EP_Musikisum_EmbeddedHtml_Editor-codeArea"
                            />
                        )
                      }
                    ]}
                    />
                  {!!previewSrcDoc && (
                    <div className="EP_Musikisum_EmbeddedHtml_Editor-previewWrapper">
                      <iframe
                        sandbox="allow-scripts"
                        srcDoc={previewSrcDoc}
                        className="EP_Musikisum_EmbeddedHtml_Editor-previewIframe"
                        />
                    </div>
                  )}
                </div>
              )
            }]}
            />
        </Form.Item>

      </Form>
    </div>
  );
}

EmbeddedHtmlEditor.propTypes = {
  ...sectionEditorProps
};
