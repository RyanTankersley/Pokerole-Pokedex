// sliderComponent.ts
// A reusable slider component for attribute/social/skill sliders
// Usage: createSlider({ label, value, min, max, remaining, onChange })

export interface SliderOptions {
  label: string;
  value: number;
  min: number;
  max: number;
  remaining: number; // points left in the pool
  onChange: (newValue: number) => void;
  disabled?: boolean; // disables both buttons
}

export function createSlider(options: SliderOptions): HTMLDivElement {
  const { label, value, min, max, remaining, onChange, disabled } = options;
  const wrapper = document.createElement('div');
  wrapper.style.display = 'flex';
  wrapper.style.flexDirection = 'column';
  wrapper.style.alignItems = 'flex-start';
  wrapper.style.marginBottom = '8px';

  // Label
  const labelEl = document.createElement('span');
  labelEl.textContent = label;
  labelEl.style.fontWeight = '600';
  labelEl.style.marginBottom = '4px';
  labelEl.style.textAlign = 'left';
  wrapper.appendChild(labelEl);

  // Row for minus, bubbles, plus
  const row = document.createElement('div');
  row.style.display = 'flex';
  row.style.alignItems = 'center';
  row.style.justifyContent = 'flex-start';

  // Minus button
  const minusBtn = document.createElement('button');
  minusBtn.textContent = '-';
  minusBtn.style.marginRight = '8px';
  minusBtn.disabled = disabled || value <= min;
  minusBtn.onclick = () => {
    if (value > min && !minusBtn.disabled) {
      onChange(value - 1);
    }
  };
  row.appendChild(minusBtn);

  // Bubbles
  for (let i = 0; i < max; i++) {
    const bubble = document.createElement('span');
    bubble.style.display = 'inline-block';
    bubble.style.width = '20px';
    bubble.style.height = '20px';
    bubble.style.margin = '0 2px';
    bubble.style.borderRadius = '50%';
    bubble.style.border = '2px solid #6366f1';
    bubble.style.background = i + 1 <= value ? '#6366f1' : 'transparent';
    bubble.style.transition = 'background 0.2s';
    row.appendChild(bubble);
  }

  // Plus button
  const plusBtn = document.createElement('button');
  plusBtn.textContent = '+';
  plusBtn.style.marginLeft = '8px';
  plusBtn.disabled = disabled || value >= max || remaining <= 0;
  plusBtn.onclick = () => {
    if (value < max && remaining > 0 && !plusBtn.disabled) {
      onChange(value + 1);
    }
  };
  row.appendChild(plusBtn);

  wrapper.appendChild(row);
  return wrapper;
}
