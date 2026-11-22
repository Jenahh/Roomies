export function getImageSource(image: string | number) {
  return typeof image === 'number' ? image : { uri: image };
}
