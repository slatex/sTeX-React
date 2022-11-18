import { render } from '@testing-library/react';

import ReactUtils from './react-utils';

describe('ReactUtils', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReactUtils />);
    expect(baseElement).toBeTruthy();
  });
});
