import { render } from '@testing-library/react';

import Comments from './comments';

describe('Comments', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<Comments />);
    expect(baseElement).toBeTruthy();
  });
});
