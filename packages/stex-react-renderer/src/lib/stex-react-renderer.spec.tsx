import { render } from '@testing-library/react';

import { StexReactRenderer }  from './stex-react-renderer';

describe('StexReactRenderer', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<StexReactRenderer contentUrl='' />);
    expect(baseElement).toBeTruthy();
  });
});
