import { useEffect, useState } from 'react';
import { preloadRoomieImageSources, type RoomieImageSource } from './roomiePetImageLoader';

type RoomieAssetBundle<T> = {
  key: string;
  sources: readonly RoomieImageSource[];
  value: T;
};

export function useRoomieAssetBundle<T>(bundle: RoomieAssetBundle<T>) {
  const [displayed, setDisplayed] = useState<{ key: string; value: T } | null>(null);
  const [failedKey, setFailedKey] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    const requested = bundle;
    void preloadRoomieImageSources(requested.sources).then(() => {
      if (!current) return;
      setFailedKey(null);
      setDisplayed({ key: requested.key, value: requested.value });
    }).catch(error => {
      console.error(`Failed to load Roomie sprite bundle "${requested.key}".`, error);
      if (current) setFailedKey(requested.key);
    });
    return () => { current = false; };
  }, [bundle.key]);

  const ready = displayed?.key === bundle.key;
  const failed = failedKey === bundle.key;
  return {
    value: failed ? null : displayed?.value ?? null,
    ready,
    failed,
  };
}
