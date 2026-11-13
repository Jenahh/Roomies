# Recolorable 3D Roomies holding props

The assets folder includes four sprites: broom, food, receipt, and calendar. Each has an original PNG and two aligned recoloring layers.

Register each pair in the existing RoomiePet sprite map. For example:

```jsx
'holding-broom-3d': {
  body: require('./assets/broom-body.png'),
  details: require('./assets/broom-details.png'),
},
```

Draw the body layer with the Roomie’s selected tint, then draw the details layer over it without tint. Give both layers the same size and position. The details layer preserves the face, lighting, and prop colors. Use the original PNG to show the original periwinkle render.

## Swap the expression independently

For Quick Add and other action icons, use these three aligned PNG layers in back-to-front order. All layers share a 1254 × 1254 canvas.

1. `{prop}-mood-body.png` receives the user's Roomie tint.
2. `{prop}-mood-details.png` adds the 3D lighting and prop.
3. `{prop}-face-{mood}.png` adds the expression. Draw exactly one face, using the current mood from the same state as the main pet.

Props are `broom`, `food`, `receipt`, and `calendar`. Mood names are `happy`, `annoyed`, and `stressed`. Map `attention` to `annoyed` if your app uses that name.

For example, a Stressed chores icon uses `broom-mood-body.png`, `broom-mood-details.png`, and `broom-face-stressed.png`. Use static PNG imports or requires for each prop and mood when integrating into React Native. Give all three layers identical positioning and dimensions, and tint only the first layer.

The preview shows broom, food, receipt, and calendar from left to right. Rows show Happy, Annoyed, and Stressed.
