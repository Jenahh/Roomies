import placement from './accessory-placement.json';

const images = {
  backpack: require('./accessories/backpack.png'),
  bow: require('./accessories/bow.png'),
  'sprout-hat': require('./accessories/sprout-hat.png'),
  'round-glasses': require('./accessories/round-glasses.png'),
  'star-pin': require('./accessories/star-pin.png'),
  broom: require('./accessories/broom.png'),
  receipt: require('./accessories/receipt.png'),
  beanie: require('./accessories/beanie.png'),
  'bucket-hat': require('./accessories/bucket-hat.png'),
  bandana: require('./accessories/bandana.png'),
  'bow-tie': require('./accessories/bow-tie.png'),
  food: require('./accessories/food.png'),
};

export const ROOMIE_ACCESSORIES = Object.keys(images);

export function accessoryLayers(equipped, behindPet) {
  const bySlot = new Map();
  for (const id of equipped) {
    if (!Object.prototype.hasOwnProperty.call(images, id)) continue;
    const { slot, frame } = placement[id];
    if ((slot === 'back') !== behindPet) continue;
    bySlot.set(slot, { id, image: images[id], frame, slot });
  }
  return [...bySlot.values()];
}
