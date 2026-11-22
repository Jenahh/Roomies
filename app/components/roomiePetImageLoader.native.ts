import { Asset } from 'expo-asset';
import { Image } from 'react-native';

export type RoomieImageSource = string | number;

const imageLoads = new Map<RoomieImageSource, Promise<void>>();

function preloadImage(source: RoomieImageSource): Promise<void> {
  const cached = imageLoads.get(source);
  if (cached) return cached;

  const request = (async () => {
    let uri: string | null = null;
    if (typeof source === 'number') {
      const [asset] = await Asset.loadAsync(source);
      uri = asset?.localUri ?? asset?.uri ?? null;
    } else {
      uri = source;
    }
    if (!uri) throw new Error(`Unable to resolve Roomie asset ${source}.`);
    const loaded = await Image.prefetch(uri);
    if (!loaded) throw new Error(`Unable to preload Roomie image: ${uri}`);
  })();

  imageLoads.set(source, request);
  void request.catch(() => {
    if (imageLoads.get(source) === request) imageLoads.delete(source);
  });
  return request;
}

export function preloadRoomieImageSources(sources: readonly RoomieImageSource[]): Promise<void> {
  return Promise.all([...new Set(sources)].map(preloadImage)).then(() => undefined);
}
