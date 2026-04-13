import React, { useEffect, useRef, useState } from 'react';
import { sectionDisplayProps } from '@educandu/educandu/ui/default-prop-types.js';

const RESIZE_SCRIPT = [
  '<script>',
  '(function(){',
  '  function report(){',
  '    window.parent.postMessage({iframeAutoResize:true,height:document.documentElement.scrollHeight},"*");',
  '  }',
  '  window.addEventListener("load",function(){requestAnimationFrame(report);});',
  '  window.addEventListener("message",function(e){if(e.data&&e.data.iframeRequestHeight){requestAnimationFrame(report);}});',
  '  if(typeof ResizeObserver!=="undefined"){new ResizeObserver(report).observe(document.body);}',
  '})();',
  '</script>'
].join('');

export default function EmbeddedHtmlDisplay({ content }) {
  const { html, css, js, width, height } = content;
  const iframeRef = useRef(null);
  const [autoHeight, setAutoHeight] = useState(null);

  useEffect(() => {
    const iframe = iframeRef.current;

    const handleMessage = event => {
      if (event.source === iframe?.contentWindow && event.data?.iframeAutoResize) {
        setAutoHeight(event.data.height);
      }
    };
    window.addEventListener('message', handleMessage);

    const requestHeight = () => {
      iframe?.contentWindow?.postMessage({ iframeRequestHeight: true }, '*');
    };

    // Immediately request height in case the iframe already loaded before this effect ran (SSR)
    requestHeight();
    iframe?.addEventListener('load', requestHeight);

    return () => {
      window.removeEventListener('message', handleMessage);
      iframe?.removeEventListener('load', requestHeight);
    };
  }, []);

  useEffect(() => {
    setAutoHeight(null);
  }, [html, css, js]);

  const srcDoc = `<!DOCTYPE html><html><head><style>${css}</style></head><body>${html}<script>${js}</script>${RESIZE_SCRIPT}</body></html>`;

  return (
    <div className="EP_Musikisum_EmbeddedHtml_Display">
      <div className={`u-horizontally-centered u-width-${width}`}>
        <iframe
          ref={iframeRef}
          sandbox="allow-scripts"
          srcDoc={srcDoc}
          style={{ height: `${autoHeight ?? height}px` }}
          />
      </div>
    </div>
  );
}

EmbeddedHtmlDisplay.propTypes = {
  ...sectionDisplayProps
};
