import { fillInValueToStartEndNum } from './quiz-utils';

describe('fillInValueToStartEndNum', () => {
  it('should return startNum and endNum when given a valid range string', () => {
    const rangeString = '10-20';
    const result = fillInValueToStartEndNum(rangeString);
    expect(result.startNum).toEqual(10);
    expect(result.endNum).toEqual(20);
  });

  it('should return undefined for startNum and endNum when given an invalid range string', () => {
    const rangeString = 'invalid';
    const result = fillInValueToStartEndNum(rangeString);
    expect(result.startNum).toBeUndefined();
    expect(result.endNum).toBeUndefined();
  });

  it('should handle range strings with leading and trailing spaces', () => {
    const rangeString = '  -10 - 20 ';
    const result = fillInValueToStartEndNum(rangeString);
    expect(result.startNum).toEqual(-10);
    expect(result.endNum).toEqual(20);
  });

  it('should handle range strings with square brackets', () => {
    const rangeString = '[5, -15.6]';
    const result = fillInValueToStartEndNum(rangeString);
    expect(result.startNum).toEqual(5);
    expect(result.endNum).toEqual(-15.6);
  });

  it('should handle range strings with comma separator', () => {
    const rangeString = '5,10';
    const result = fillInValueToStartEndNum(rangeString);
    expect(result.startNum).toEqual(5);
    expect(result.endNum).toEqual(10);
  });
  it('should handle negative numbers', () => {
    const rangeString = '-10--5';
    const result = fillInValueToStartEndNum(rangeString);
    expect(result.startNum).toEqual(-10);
    expect(result.endNum).toEqual(-5);
  });
  it('Should handle empty start or end', () => {
    const rangeString = '10-';
    const result = fillInValueToStartEndNum(rangeString);
    expect(result.startNum).toEqual(10);
    expect(result.endNum).toBeNaN();

    const rangeString2 = '--3.5';
    const result2 = fillInValueToStartEndNum(rangeString2);
    expect(result2.startNum).toBeNaN();
    expect(result2.endNum).toEqual(-3.5);
  });

  it ('Should handle decimals', () => {
    const rangeString = '-3.5-10.5';
    const result = fillInValueToStartEndNum(rangeString);
    expect(result.startNum).toEqual(-3.5);
    expect(result.endNum).toEqual(10.5);
  });
});
