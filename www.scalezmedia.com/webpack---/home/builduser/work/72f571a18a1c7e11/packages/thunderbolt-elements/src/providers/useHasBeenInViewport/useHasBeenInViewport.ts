import * as React from 'react';
import { useInViewport } from '../useInViewport/useInViewport';

export const useHasBeenInViewport = (ref: React.RefObject<any>) => {
  const [hasBeenInViewport, setHasBeenInViewport] = React.useState(false);

  const isInViewport = useInViewport(ref, true);
  React.useEffect(() => {
    if (isInViewport) {
      setHasBeenInViewport(true);
    }
  }, [isInViewport]);

  return hasBeenInViewport;
};
