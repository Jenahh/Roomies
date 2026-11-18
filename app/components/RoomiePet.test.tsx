import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import RoomiePet from './RoomiePet';
import { RoomiePetContext } from './RoomiePetContext';
import type { ResidentData } from '../hooks/useResidentData';
import { getRoomieAccessoryFrame, ROOMIE_ACCESSORY_PLACEMENTS } from '../data/roomiePetAccessories';

function renderSavedPet(accessories: NonNullable<ResidentData['pet']>['accessories']) {
  return renderToStaticMarkup(
    <RoomiePetContext.Provider value={{ name: 'Pip', lastAttention: null, accessories }}>
      <RoomiePet action="expenses" />
      <RoomiePet action="chores" />
      <RoomiePet action="calendar" />
      <RoomiePet />
    </RoomiePetContext.Provider>,
  );
}

describe('saved Roomie accessories', () => {
  it('fits the new glasses asset without distortion and shifts it right in every mood', () => {
    const happyFrame = getRoomieAccessoryFrame('round-glasses', 128, 'happy');
    const annoyedFrame = getRoomieAccessoryFrame('round-glasses', 128, 'annoyed');

    expect(happyFrame[2]).toBe(happyFrame[3]);
    expect(happyFrame[0]).toBeGreaterThan(ROOMIE_ACCESSORY_PLACEMENTS['round-glasses'][0] * 128);
    expect(annoyedFrame[1]).toBeGreaterThan(happyFrame[1]);
    expect(annoyedFrame.slice(2)).toEqual(happyFrame.slice(2));
  });

  it('sizes and centers glasses to the face on action pets', () => {
    const happyFrame = getRoomieAccessoryFrame('round-glasses', 128, 'happy');
    const choresFrame = getRoomieAccessoryFrame('round-glasses', 128, 'happy', 'chores');
    const expensesFrame = getRoomieAccessoryFrame('round-glasses', 128, 'happy', 'expenses');
    const calendarFrame = getRoomieAccessoryFrame('round-glasses', 128, 'happy', 'calendar');
    const centerX = (frame: number[]) => (frame[0] + frame[2] * 0.4984) / 128;

    expect(choresFrame[2]).toBeCloseTo(happyFrame[2] * 0.85);
    expect(expensesFrame[2]).toBeCloseTo(happyFrame[2] * 0.85);
    expect(centerX(choresFrame)).toBeCloseTo(0.4472, 3);
    expect(centerX(expensesFrame)).toBeCloseTo(0.4472, 3);
    expect(centerX(calendarFrame)).toBeCloseTo(0.4795, 3);
    expect(getRoomieAccessoryFrame('round-glasses', 128, 'annoyed', 'chores')).toEqual(choresFrame);
  });

  it('applies saved accessories to every action and regular pet icon', () => {
    expect(renderSavedPet(['beanie']).match(/<img[^>]+src="[^"]*accessories\/beanie.png/g)).toHaveLength(4);
    expect(renderSavedPet([])).not.toContain('accessories/beanie.png');
    expect(renderSavedPet(['bow']).match(/<img[^>]+src="[^"]*accessories\/bow.png/g)).toHaveLength(4);
  });

  it('allows previews to override the saved accessories, including removing all', () => {
    const markup = renderToStaticMarkup(
      <RoomiePetContext.Provider value={{ name: 'Pip', lastAttention: null, accessories: ['beanie'] }}>
        <RoomiePet accessories={['bow']} />
        <RoomiePet accessories={[]} />
        <RoomiePet role="assistant" />
      </RoomiePetContext.Provider>,
    );
    expect(markup).not.toContain('accessories/beanie.png');
    expect(markup.match(/<img[^>]+src="[^"]*accessories\/bow.png/g)).toHaveLength(1);
  });
});
