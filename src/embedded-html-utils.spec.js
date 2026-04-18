import { describe, expect, it } from 'vitest';
import { extractBodyContent, fixScrollbarIssues, hasScrollbarIssues, stripLocalExternalTags } from './embedded-html-utils.js';

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
