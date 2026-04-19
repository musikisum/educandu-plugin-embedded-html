import { describe, expect, it } from 'vitest';
import { extractBodyContent, extractInlineScripts, extractStyles, fixScrollbarIssues, hasScrollbarIssues, stripExtractedTags, stripLocalExternalTags } from './embedded-html-utils.js';

describe('extractStyles', () => {
  it('should extract content from a single style tag', () => {
    expect(extractStyles('<style>body { color: red; }</style>')).toBe('body { color: red; }');
  });

  it('should extract and join multiple style tags', () => {
    expect(extractStyles('<style>a { color: red; }</style><style>b { color: blue; }</style>')).toBe('a { color: red; }\nb { color: blue; }');
  });

  it('should extract styles from head and body', () => {
    const html = '<html><head><style>h1 { font-size: 2rem; }</style></head><body><style>p { margin: 0; }</style></body></html>';
    expect(extractStyles(html)).toBe('h1 { font-size: 2rem; }\np { margin: 0; }');
  });

  it('should return empty string when no style tags are present', () => {
    expect(extractStyles('<p>Hello</p>')).toBe('');
  });

  it('should ignore empty style tags', () => {
    expect(extractStyles('<style>  </style><style>body { color: red; }</style>')).toBe('body { color: red; }');
  });
});

describe('extractInlineScripts', () => {
  it('should extract content from an inline script tag', () => {
    expect(extractInlineScripts('<script>console.log(1);</script>')).toBe('console.log(1);');
  });

  it('should extract and join multiple inline script tags', () => {
    expect(extractInlineScripts('<script>var a = 1;</script><script>var b = 2;</script>')).toBe('var a = 1;\nvar b = 2;');
  });

  it('should not extract scripts with a src attribute', () => {
    expect(extractInlineScripts('<script src="https://example.com/lib.js"></script>')).toBe('');
  });

  it('should extract inline scripts but skip external ones', () => {
    const html = '<script src="https://cdn.com/lib.js"></script><script>var x = 1;</script>';
    expect(extractInlineScripts(html)).toBe('var x = 1;');
  });

  it('should return empty string when no inline scripts are present', () => {
    expect(extractInlineScripts('<p>Hello</p>')).toBe('');
  });
});

describe('stripExtractedTags', () => {
  it('should remove style tags', () => {
    expect(stripExtractedTags('<style>body { color: red; }</style><p>Hello</p>')).toBe('<p>Hello</p>');
  });

  it('should remove inline script tags', () => {
    expect(stripExtractedTags('<p>Hello</p><script>var x = 1;</script>')).toBe('<p>Hello</p>');
  });

  it('should keep script tags with src attribute', () => {
    const tag = '<script src="https://example.com/lib.js"></script>';
    expect(stripExtractedTags(tag)).toBe(tag);
  });

  it('should remove both style and inline script tags', () => {
    const input = '<style>body{}</style><p>Hello</p><script>var x=1;</script>';
    expect(stripExtractedTags(input)).toBe('<p>Hello</p>');
  });
});

describe('extractBodyContent', () => {
  it('should extract content between body tags', () => {
    expect(extractBodyContent('<html><body><p>Hello</p></body></html>')).toBe('<p>Hello</p>');
  });

  it('should extract content from body tag with attributes', () => {
    expect(extractBodyContent('<body class="foo"><p>Hello</p></body>')).toBe('<p>Hello</p>');
  });

  it('should return the full input if no body tag is present', () => {
    expect(extractBodyContent('<p>Hello</p>')).toBe('<p>Hello</p>');
  });

  it('should trim whitespace around body content', () => {
    expect(extractBodyContent('<body>  <p>Hello</p>  </body>')).toBe('<p>Hello</p>');
  });

  it('should handle multiline body content', () => {
    const input = '<body>\n  <p>A</p>\n  <p>B</p>\n</body>';
    expect(extractBodyContent(input)).toBe('<p>A</p>\n  <p>B</p>');
  });
});

describe('stripLocalExternalTags', () => {
  it('should remove link tags with local href', () => {
    expect(stripLocalExternalTags('<link rel="stylesheet" href="style.css">')).toBe('');
  });

  it('should remove script tags with local src', () => {
    expect(stripLocalExternalTags('<script src="game.js"></script>')).toBe('');
  });

  it('should keep link tags with https href', () => {
    const tag = '<link rel="stylesheet" href="https://example.com/style.css">';
    expect(stripLocalExternalTags(tag)).toBe(tag);
  });

  it('should keep script tags with https src', () => {
    const tag = '<script src="https://example.com/game.js"></script>';
    expect(stripLocalExternalTags(tag)).toBe(tag);
  });

  it('should keep link tags with cdn:// href', () => {
    const tag = '<link rel="stylesheet" href="cdn://media-library/abc/style.css">';
    expect(stripLocalExternalTags(tag)).toBe(tag);
  });

  it('should remove local but keep external tags in mixed input', () => {
    const input = '<link href="local.css"><link href="https://cdn.com/remote.css">';
    expect(stripLocalExternalTags(input)).toBe('<link href="https://cdn.com/remote.css">');
  });
});

describe('hasScrollbarIssues', () => {
  it('should detect overflow: auto', () => {
    expect(hasScrollbarIssues('body { overflow: auto; }')).toBe(true);
  });

  it('should detect overflow: scroll', () => {
    expect(hasScrollbarIssues('body { overflow: scroll; }')).toBe(true);
  });

  it('should detect overflow-x: auto', () => {
    expect(hasScrollbarIssues('body { overflow-x: auto; }')).toBe(true);
  });

  it('should detect overflow-y: scroll', () => {
    expect(hasScrollbarIssues('body { overflow-y: scroll; }')).toBe(true);
  });

  it('should be case-insensitive', () => {
    expect(hasScrollbarIssues('body { Overflow: Auto; }')).toBe(true);
  });

  it('should return false for overflow: hidden', () => {
    expect(hasScrollbarIssues('body { overflow: hidden; }')).toBe(false);
  });

  it('should return false for empty css', () => {
    expect(hasScrollbarIssues('')).toBe(false);
  });

  it('should return consistent results when called multiple times', () => {
    const css = 'body { overflow: auto; }';
    expect(hasScrollbarIssues(css)).toBe(true);
    expect(hasScrollbarIssues(css)).toBe(true);
    expect(hasScrollbarIssues(css)).toBe(true);
  });
});

describe('fixScrollbarIssues', () => {
  it('should replace overflow: auto with overflow: hidden', () => {
    expect(fixScrollbarIssues('body { overflow: auto; }')).toBe('body { overflow: hidden; }');
  });

  it('should replace overflow: scroll with overflow: hidden', () => {
    expect(fixScrollbarIssues('body { overflow: scroll; }')).toBe('body { overflow: hidden; }');
  });

  it('should replace overflow-x: auto with overflow-x: hidden', () => {
    expect(fixScrollbarIssues('body { overflow-x: auto; }')).toBe('body { overflow-x: hidden; }');
  });

  it('should replace overflow-y: scroll with overflow-y: hidden', () => {
    expect(fixScrollbarIssues('body { overflow-y: scroll; }')).toBe('body { overflow-y: hidden; }');
  });

  it('should replace all occurrences in the css', () => {
    const input = '.a { overflow: auto; } .b { overflow-y: scroll; }';
    const expected = '.a { overflow: hidden; } .b { overflow-y: hidden; }';
    expect(fixScrollbarIssues(input)).toBe(expected);
  });

  it('should not modify overflow: hidden', () => {
    const css = 'body { overflow: hidden; }';
    expect(fixScrollbarIssues(css)).toBe(css);
  });
});
