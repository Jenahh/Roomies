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
