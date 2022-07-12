import { render } from '@testing-library/react';

import ReportAProblem from './report-a-problem';

describe('ReportAProblem', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ReportAProblem />);
    expect(baseElement).toBeTruthy();
  });
});
