import observe from '../../scripts/utils/observer.js';

function toKey(text) {
  return text.trim().toLowerCase().replace(/\s+/g, '-');
}

function readConfig(block) {
  const config = {};
  [...block.querySelectorAll(':scope > div')].forEach((row) => {
    const [keyCell, valueCell] = [...row.children];
    if (!keyCell || !valueCell) return;
    const key = toKey(keyCell.textContent);
    const link = valueCell.querySelector('a[href]');
    if (key) config[key] = (key === 'url' && link) ? link.href : valueCell.textContent.trim();
  });
  return config;
}

function toUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

function toPixels(value) {
  const px = parseInt(value, 10);
  return px > 0 ? px : null;
}

function loadFrame(frame) {
  const iframe = document.createElement('iframe');
  iframe.src = frame.dataset.src;
  iframe.title = frame.dataset.title;
  iframe.loading = 'lazy';
  frame.append(iframe);
}

export default function init(block) {
  const config = readConfig(block);
  const url = toUrl(config.url);
  if (!url) {
    block.remove();
    return;
  }

  const frame = document.createElement('div');
  frame.className = 'tool-embed-frame';
  frame.dataset.src = url.href;
  frame.dataset.title = config.title || url.hostname;
  const width = toPixels(config.width);
  const height = toPixels(config.height);
  if (width) frame.style.maxWidth = `${width}px`;
  if (height) frame.style.setProperty('--tool-embed-height', `${height}px`);

  block.replaceChildren(frame);
  observe(frame, loadFrame);
}
