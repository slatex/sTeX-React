import { extractProjectIdAndFilepath } from '@stex-react/utils';

describe('extractProjectIdAndFilepath', () => {
  it('should return archive and filepath for valid url', () => {
    const result = extractProjectIdAndFilepath(
      'http://mathhub.info/problems/AI/rational-agents/quiz/rational1.en.omdoc?en?48e3e495'
    );
    expect(result[0]).toEqual('problems/AI');
    expect(result[1]).toEqual('rational-agents/quiz/rational1.en.tex');
  });
});
