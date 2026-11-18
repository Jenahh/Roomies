# Roomie UI icons

Six icons, each with blue active and gray inactive versions. PNGs are supplied at 24, 48, and 72 pixels using React Native's standard filename suffixes. Matching editable SVG sources are included.

Copy this entire folder into your app. Import ROOMIE_UI_ICONS from icons.js, then select the source using the navigation state.

```jsx
<Image
  source={ROOMIE_UI_ICONS.home[focused ? 'active' : 'inactive']}
  style={{ width: 24, height: 24 }}
  resizeMode="contain"
/>
```

Require the base PNG filename. React Native selects the corresponding @2x or @3x file automatically. For Expo Router tabBarIcon, return the Image above from the existing tabBarIcon callback using its focused argument.

The expense icon is a wallet. The circled check represents chores. Draw any active pill background, notification dot, labels, and touch targets through the existing UI styles around the icon.
