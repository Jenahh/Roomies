export type RoomieImageSource = string | number;

const imageLoads = new Map<string, Promise<void>>();

function preloadImage(uri: string): Promise<void> {
  const cached = imageLoads.get(uri);
  if (cached) return cached;

  const request = new Promise<void>((resolve, reject) => {
    const image = new globalThis.Image();
    let settled = false;
    const fail = () => {
      if (settled) return;
      settled = true;
      reject(new Error(`Unable to load Roomie image: ${uri}`));
    };
    const loaded = () => {
      if (settled) return;
      if (typeof image.decode === 'function') {
        image.decode().then(() => {
          if (settled) return;
          settled = true;
          resolve();
        }, fail);
      } else {
        settled = true;
        resolve();
      }
    };

    image.onload = loaded;
    image.onerror = fail;
    image.src = uri;
    if (image.complete) {
      if (image.naturalWidth > 0) loaded();
      else fail();
    }
  });

  imageLoads.set(uri, request);
  void request.catch(() => {
    if (imageLoads.get(uri) === request) imageLoads.delete(uri);
  });
  return request;
}

export function preloadRoomieImageSources(sources: readonly RoomieImageSource[]): Promise<void> {
  const uris = [...new Set(sources)].map(source => {
    if (typeof source !== 'string') throw new Error(`Expected a web image URI, received asset ID ${source}.`);
    return source;
  });
  return Promise.all(uris.map(preloadImage)).then(() => undefined);
}
