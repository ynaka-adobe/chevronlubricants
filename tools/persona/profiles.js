// Adapted from DuPont tools/persona, Apache-2.0. These are illustrative
// demonstration profiles, not observed visitor interests or measured analytics.
const AXES = ['Explore', 'Research', 'Compare', 'Purchase', 'Deals', 'Support'];
const profiles = [
  {
    name: 'Technical Evaluator',
    description: 'A Lead Systems Architect, Product Engineer, R&D Scientist, or Technical Specialist evaluating materials, technologies, specifications, and compatibility. Visits product pages, downloads spec sheets, and views technical documentation.',
    interests: [['Data sheets & specifications', 60], ['API/integration details', 45], ['Architecture diagrams', 35]],
    intent: [0.35, 0.85, 0.7, 0.15, 0.1, 0.45],
    summary: 'Focused on technical documentation and product performance data',
    metrics: 'spec sheet downloads · technical content engagement · webinar registrations',
    trajectory: 'trajectory: technical docs, data sheets, API/integration pages, engineering case studies',
  },
  {
    name: 'Business Decision Maker',
    description: 'A VP Innovation, Business Unit Leader, Manufacturing Executive, or Product Development Leader looking for business outcomes and strategic value. Visits solutions, strategy, innovation, ESG, and executive content.',
    interests: [['Innovation stories', 55], ['ROI & digital transformation', 50], ['Sustainability impact', 30]],
    intent: [0.6, 0.45, 0.3, 0.4, 0.15, 0.2],
    summary: 'Focused on strategic value, ROI, and digital transformation outcomes',
    metrics: 'executive content consumption · consultation requests · contact sales conversions',
    trajectory: 'trajectory: hero/executive content, transformation case studies, industry success stories',
  },
  {
    name: 'Procurement & Sourcing Manager',
    description: 'A Strategic Sourcing Manager, Procurement Director, or Vendor Manager focused on risk reduction and supplier evaluation. Visits compliance, sourcing, sustainability, and supplier pages.',
    interests: [['Sustainability credentials', 55], ['Certifications & compliance', 50], ['Supplier reliability', 40]],
    intent: [0.2, 0.6, 0.55, 0.3, 0.15, 0.5],
    summary: 'Focused on ESG credentials, compliance, and supplier reliability',
    metrics: 'supplier inquiry forms · procurement document downloads',
    trajectory: 'trajectory: sustainability/ESG content, certifications, global footprint, procurement resources',
  },
  {
    name: 'Industry Researcher',
    description: 'A student, industry analyst, sustainability researcher, individual engineer, or future customer champion in a learning and discovery mode, not purchasing. Arrives from search and consumes blogs and educational content.',
    interests: [['Educational blogs', 50], ['Sustainability stories', 45], ['Innovation showcases', 35]],
    intent: [0.75, 0.4, 0.15, 0.05, 0.1, 0.15],
    summary: 'Learning and discovery focused, not yet purchase-ready',
    metrics: 'return visits · content engagement · subscriber growth',
    trajectory: 'trajectory: search entry, blogs, videos, related articles, newsletter/webinar signups',
  },
];

function svgElement(tag, attributes = {}) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function point(index, radius) {
  const angle = ((index * 60 - 90) * Math.PI) / 180;
  return [130 + radius * Math.cos(angle), 130 + radius * Math.sin(angle)];
}

function polygon(values, className) {
  const points = values.map((value, index) => point(index, value * 95)
    .map((coordinate) => coordinate.toFixed(1)).join(',')).join(' ');
  return svgElement('polygon', { points, class: className });
}

export default function renderProfile(role) {
  const card = document.getElementById('persona-profile');
  const profile = profiles.find(({ name }) => name === role);
  card.hidden = !profile;
  if (!profile) return;
  ['name', 'description', 'summary', 'metrics', 'trajectory'].forEach((key) => {
    document.getElementById(`persona-${key}`).textContent = profile[key];
  });
  const interests = document.getElementById('persona-interests');
  interests.replaceChildren();
  profile.interests.forEach(([label, value]) => {
    const row = document.createElement('div');
    row.className = 'persona-interest';
    const text = document.createElement('span');
    text.textContent = label;
    const track = document.createElement('span');
    track.className = 'persona-interest-track';
    const fill = document.createElement('span');
    fill.className = 'persona-interest-fill';
    fill.style.width = `${value}%`;
    track.append(fill);
    const score = document.createElement('span');
    score.textContent = `${value}%`;
    row.append(text, track, score);
    interests.append(row);
  });
  const svg = document.getElementById('persona-radar');
  svg.replaceChildren();
  [0.25, 0.5, 0.75, 1].forEach((ratio) => svg.append(polygon(AXES.map(() => ratio), 'persona-radar-grid')));
  AXES.forEach((axis, index) => {
    const [x2, y2] = point(index, 95);
    svg.append(svgElement('line', {
      x1: 130, y1: 130, x2, y2, class: 'persona-radar-axis',
    }));
    const [x, y] = point(index, 111);
    const label = svgElement('text', {
      x, y, 'text-anchor': 'middle', 'dominant-baseline': 'middle', class: 'persona-radar-label',
    });
    label.textContent = axis;
    svg.append(label);
  });
  svg.append(polygon(profile.intent, 'persona-radar-shape'));
}
