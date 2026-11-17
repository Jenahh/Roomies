import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import RoomiePet from './RoomiePet';

describe('RoomiePet action sprites', () => {
  const actions = [
    ['chores', 'broom'],
    ['expenses', 'receipt'],
    ['dinner', 'food'],
    ['calendar', 'calendar'],
  ] as const;
  const moods = [
    ['Happy', 'happy'],
    ['Attention', 'annoyed'],
    ['Stressed', 'stressed'],
  ] as const;

  it.each(actions.flatMap(([action, sprite]) => moods.map(([mood, face]) => [action, sprite, mood, face] as const)))(
    'renders the %s prop with the %s face for %s mood',
    (action, sprite, mood, face) => {
      const markup = renderToStaticMarkup(createElement(RoomiePet, { action, color: 'pink', mood, size: 48 }));
      const imageLayers = [...markup.matchAll(/<img[^>]+>/g)].map(([image]) => image);
      const detailsIndex = imageLayers.findIndex(image => image.includes(`${sprite}-mood-details`));
      const faceIndex = imageLayers.findIndex(image => image.includes(`${sprite}-face-${face}`));

      expect(markup).toContain(`${sprite}-mood-body`);
      expect(detailsIndex).toBeGreaterThanOrEqual(0);
      expect(faceIndex).toBeGreaterThan(detailsIndex);
      expect(markup).toContain('background-color:#EF9DB9');
      expect(imageLayers.every(image => !image.includes('background-color'))).toBe(true);
      for (const otherFace of ['happy', 'annoyed', 'stressed'] as const) {
        if (otherFace !== face) expect(markup).not.toContain(`${sprite}-face-${otherFace}`);
      }
    },
  );

  it('maps lowercase mood names to the matching action expression', () => {
    const markup = renderToStaticMarkup(createElement(RoomiePet, { action: 'chores', mood: 'stressed', size: 48 }));
    expect(markup).toContain('broom-face-stressed');
  });
});
