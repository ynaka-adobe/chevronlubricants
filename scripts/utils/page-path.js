// Match the scoped CDN alias without treating compound suffixes as page extensions.
export default function normalizePagePath(pathname) {
  const path = pathname.replace(/^\/content(?=\/)/, '');
  if (/^\/en-us\/(?:blocks|scripts|styles|tools|plugins|deps|ue|icons|fonts|workers|well-known)(?:\/|\.)/.test(path)
    || /\/(?:404|head)\.html$/.test(path)) return pathname;
  return pathname.replace(/^(\/(?:content\/)?en-us\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+)\.html$/, '$1');
}
