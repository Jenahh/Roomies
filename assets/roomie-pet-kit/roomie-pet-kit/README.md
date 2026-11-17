# Roomie accessories and chore icons

This kit includes the existing layered pet sprites and a React Native RoomiePet component with accessory placement. Copy the folder into your project and use the same color and mood values as before.

```jsx
<RoomiePet
  mood="happy-3d"
  color="#AF98EB"
  size={220}
  accessories={['bucket-hat', 'round-glasses', 'bow-tie']}
/>
```

Pass the equipped accessory IDs from the pet's settings. The component applies tint only to the pet body. The backpack renders behind the pet, and the remaining items render in front. If two items share a slot, the last selected item wins. The bow, leaf hat (sprout-hat), beanie, and bucket hat share the head slot. The bandana and bow tie share the body slot. Glasses, the pin, and the backpack use their own slots. Broom, receipt, and meal plate share the held-item slot.

The supplied placement coordinates are normalized to the square Roomie canvas and can be adjusted in accessory-placement.json. Position them against the same canvas if adapting the renderer to a different platform.

For the Roomies web app, `accessories/layers/*-base.png` contains the grayscale, alpha-preserving shading used as the tintable accessory base. Matching `*-details.png` files preserve fixed-color components such as the backpack hardware. Keep the original accessory PNGs as the no-custom-color fallback; this retains the original palette for pets without saved accessory colors.

Use CHORE_ICONS with your chore category IDs. The included categories are sweeping, dishes, laundry, trash, vacuuming, groceries, and cooking. These are standalone icons for task rows and pickers. The meal plate doubles as a held item.
