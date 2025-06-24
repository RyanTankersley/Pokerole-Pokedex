// sliderSectionComponent.ts
// A reusable section component for a group of sliders (attributes, social, skills, etc)
// Usage: createSliderSection({
//   sectionLabel, sliders: [{ label, value, min, max, remaining, onChange, disabled }],
//   columns
// })

import { createSlider, SliderOptions } from './sliderComponent.js';

export interface SliderSectionOptions {
  sectionLabel: string;
  sliders: SliderOptions[];
  columns?: number; // default 2
  remainingLabel?: string; // e.g. 'Points left'
  remaining?: number;
  allowed?: number;
  remainingColor?: string; // e.g. '#16a34a' or '#dc2626'
}

export function createSliderSection(options: SliderSectionOptions): HTMLDivElement {
  const {
    sectionLabel,
    sliders,
    columns = 2,
    remainingLabel = '',
    remaining,
    allowed,
    remainingColor = '#16a34a',
  } = options;

  const section = document.createElement('div');
  // Section header
  const header = document.createElement('div');
  header.style.fontWeight = '600';
  header.style.color = '#6366f1';
  header.style.marginBottom = '8px';
  header.textContent = sectionLabel;
  if (typeof remaining === 'number' && typeof allowed === 'number') {
    header.innerHTML = `${sectionLabel} <span style='font-weight:400;font-size:0.95em;color:#444;'>(${remainingLabel}: <span style='color:${remaining < 0 ? '#dc2626' : remainingColor}'>${remaining}</span> / ${allowed})</span>`;
  }
  section.appendChild(header);

  // Sliders grid
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
  grid.style.gap = '12px';
  sliders.forEach(sliderOpts => {
    grid.appendChild(createSlider(sliderOpts));
  });
  section.appendChild(grid);
  return section;
}
