import { Move } from './move.js';

/**
 * Creates a DOM element displaying all details for a move.
 * @param move The move object to display
 * @returns HTMLElement representing the move card
 */
export function createMoveCard(move: Move): HTMLElement {
  const card = document.createElement('div');
  card.style.background = '#eef2ff';
  card.style.padding = '18px 24px';
  card.style.borderRadius = '10px';
  card.style.boxShadow = '0 2px 8px #0001';
  card.style.minWidth = '260px';
  card.style.maxWidth = '340px';

  card.innerHTML = `
    <div style="font-size:1.3em;font-weight:700;color:#3730a3;margin-bottom:8px;">${move.Name}</div>
    <div style="margin-bottom:6px;"><b>Type:</b> <span style="color:#2563eb;">${move.Type}</span> &nbsp; <b>Category:</b> <span style="color:#7c3aed;">${move.Category}</span></div>
    <div style="margin-bottom:6px;"><b>Power:</b> ${move.Power ?? '-'} &nbsp; <b>Target:</b> ${move.Target ?? '-'}</div>
    <div style="margin-bottom:6px;"><b>Accuracy:</b> ${move.Accuracy1 ?? '-'}${move.Accuracy2 ? ' / ' + move.Accuracy2 : ''}</div>
    <div style="margin-bottom:6px;"><b>Damage:</b> ${move.Damage1 ?? '-'}${move.Damage2 ? ' / ' + move.Damage2 : ''}</div>
    <div style="margin-bottom:6px;"><b>Description:</b> <span style="color:#334155;">${move.Description ?? '-'}</span></div>
    ${move.Effect ? `<div style=\"margin-bottom:6px;\"><b>Effect:</b> <span style=\"color:#334155;\">${move.Effect}</span></div>` : ''}
    ${move.Attributes && Object.keys(move.Attributes).length > 0 ? `<div style=\"margin-bottom:6px;\"><b>Attributes:</b> <span style=\"color:#0e7490;\">${Object.entries(move.Attributes).filter(([k,v])=>v!==undefined&&v!==false).map(([k,v])=>k+(v===true?'':': '+v)).join(', ')}</span></div>` : ''}
    ${move.AddedEffects && Object.keys(move.AddedEffects).length > 0 ? `<div style=\"margin-bottom:6px;\"><b>Added Effects:</b> <span style=\"color:#0e7490;\">${Object.entries(move.AddedEffects).filter(([k,v])=>v!==undefined&&v!==false&&v!==null&&(!(Array.isArray(v))||v.length>0)).map(([k,v])=>k+(typeof v==='object'&&!Array.isArray(v)?'':': '+JSON.stringify(v))).join(', ')}</span></div>` : ''}
  `;
  return card;
}

/**
 * Creates a DOM element for a 'not found' move card.
 */
export function createMoveNotFoundCard(moveName: string): HTMLElement {
  const card = document.createElement('div');
  card.style.background = '#eef2ff';
  card.style.padding = '18px 24px';
  card.style.borderRadius = '10px';
  card.style.boxShadow = '0 2px 8px #0001';
  card.style.minWidth = '260px';
  card.style.maxWidth = '340px';
  card.innerHTML = `
    <div style="font-size:1.3em;font-weight:700;color:#3730a3;margin-bottom:8px;">${moveName}</div>
    <div style="color:#b91c1c;font-size:0.95em;">Move details not found.</div>
  `;
  return card;
}
