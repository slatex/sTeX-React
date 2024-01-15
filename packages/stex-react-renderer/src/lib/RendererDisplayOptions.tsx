import { createContext } from 'react';

export const RenderOptions = createContext({
  renderOptions: { noFrills: false },
  setRenderOptions: (options: {
    noFrills: boolean;
    // eslint-disable-next-line @typescript-eslint/no-empty-function
  }) => {},
});

export enum StringOptions {}
