import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import RoomiePet from './RoomiePet';
import { RoomiePetContext } from './RoomiePetContext';
import type { ResidentData } from '../hooks/useResidentData';

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
