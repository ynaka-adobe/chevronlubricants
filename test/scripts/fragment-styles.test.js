import { expect } from '@esm-bundle/chai';

const CONTENT = `<div class="section full-width-bg" style="display:block">
    <div class="default-content"><p>Hero introduction</p></div>
  </div>
  <div class="section centered" style="display:block">
    <div class="default-content"><h1>Premium Chevron Lubricants</h1><p>Fleet protection</p></div>
  </div>
  <div class="section blue-bg centered" style="display:block">
    <div class="default-content"><h2>Where to buy</h2><p>Find your distributor</p></div>
  </div>
  <div class="section grey-bg right-aligned" style="display:block">
    <div class="default-content"><h2>Trusted brands</h2><p>Brand information</p></div>
  </div>`;

function snapshot(root) {
  return [...root.children].map((section) => {
    const sectionStyle = getComputedStyle(section);
    const content = section.querySelector('.default-content');
    return {
      section: {
        background: sectionStyle.backgroundColor,
        padding: sectionStyle.padding,
        margin: [sectionStyle.marginRight, sectionStyle.marginBottom, sectionStyle.marginLeft],
      },
      content: {
        color: getComputedStyle(content).color,
        alignment: getComputedStyle(content).textAlign,
      },
      text: [...content.children].map((el) => {
        const style = getComputedStyle(el);
        return {
          size: style.fontSize,
          weight: style.fontWeight,
          alignment: style.textAlign,
          color: style.color,
          lineHeight: style.lineHeight,
          margin: style.margin,
        };
      }),
    };
  });
}

describe('Fragment section styling', () => {
  let stylesheet;

  before(async () => {
    stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/styles/styles.css';
    await new Promise((resolve, reject) => {
      stylesheet.onload = resolve;
      stylesheet.onerror = reject;
      document.head.append(stylesheet);
    });
  });

  afterEach(() => document.body.replaceChildren());
  after(() => stylesheet.remove());

  it('preserves metadata styles in plain, single-section and multi-section persona wrappers', () => {
    document.body.innerHTML = `<main id="standalone">${CONTENT}</main>
      <main><div class="fragment-content" id="fragment">${CONTENT}</div></main>
      <main><div class="persona-fragment-content" id="persona">${CONTENT}</div></main>
      <main><div class="persona-fragment-content"><div class="fragment-content" id="nested">${CONTENT}</div></div></main>`;
    document.querySelectorAll('main > div').forEach((el) => { el.style.display = 'block'; });
    const reference = snapshot(document.querySelector('#standalone'));
    ['fragment', 'persona', 'nested'].forEach((id) => {
      expect(snapshot(document.querySelector(`#${id}`))).to.deep.equal(reference);
    });
    const heading = document.querySelector('#nested h1');
    expect(getComputedStyle(heading).fontSize).to.equal('30px');
    expect(getComputedStyle(heading).fontWeight).to.equal('700');
    expect(getComputedStyle(heading).textAlign).to.equal('center');
    expect(reference[0].section.background).to.equal('rgb(0, 54, 83)');
    expect(reference[2].text[0].color).to.equal('rgb(255, 255, 255)');
    expect(reference[3].content.alignment).to.equal('right');
    expect(getComputedStyle(document.querySelector('#persona > .section + .section')).marginTop).to.equal('0px');
  });

  it('does not apply page section rules to arbitrary nested block containers', () => {
    document.body.innerHTML = `<main><div class="unrelated-block">${CONTENT}</div></main>`;
    const heading = document.querySelector('h1');
    expect(getComputedStyle(heading).fontWeight).to.equal('400');
    expect(getComputedStyle(heading).textAlign).to.equal('start');
  });

  it('keeps loading sections hidden within fragment wrappers', () => {
    document.body.innerHTML = `<main><div class="persona-fragment-content">
      <div class="fragment-content"><div class="section banner" data-status="loading" style="display:flex">
        <div class="default-content"><h1>Loading content</h1></div>
      </div></div></div></main>`;
    const section = document.querySelector('.section');
    expect(getComputedStyle(section).display).to.equal('none');
    section.removeAttribute('data-status');
    expect(getComputedStyle(section).display).to.equal('flex');
  });
});
