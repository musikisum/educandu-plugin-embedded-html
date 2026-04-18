export function extractBodyContent(html) {
  const match = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return match ? match[1].trim() : html;
}

export function stripLocalExternalTags(html) {
  return html
    .replace(/<link[^>]+href=["'](?!https?:|\/\/|cdn:\/\/)([^"']+)["'][^>]*>\s*/gi, '')
    .replace(/<script[^>]+src=["'](?!https?:|\/\/|cdn:\/\/)([^"']+)["'][^>]*><\/script>\s*/gi, '');
}

export function hasScrollbarIssues(css) {
  return /overflow(-[xy])?\s*:\s*(auto|scroll)/i.test(css);
}

export function fixScrollbarIssues(css) {
  return css.replace(/overflow(-[xy])?\s*:\s*(auto|scroll)/gi, (_, axis) => `overflow${axis || ''}: hidden`);
}
