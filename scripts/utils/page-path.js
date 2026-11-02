import { reportError } from '../martech/consent.js';

// Match the scoped CDN alias without treating compound suffixes as page extensions.
export default function normalizePagePath(pathname) {
  let path;
  try {
    path = decodeURI(pathname.replace(/^\/content(?=\/)/, ''));
  } catch {
    reportError('Invalid encoded page path left unchanged', new Error('Path could not be decoded'));
    return pathname;
  }
  if (/^\/en-us\/(?:blocks|scripts|styles|tools|plugins|deps|ue|icons|fonts|workers|well-known)(?:\/|\.)/.test(path)
    || /\/(?:404|head)\.html$/.test(path)) return pathname;
  return /^\/en-us\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_-]+\.html$/.test(path)
    ? pathname.replace(/\.html$/, '') : pathname;
}
