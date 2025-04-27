import timedFunction from '../index';
import { describe, expect, test } from '@jest/globals';

describe('timedFunction', () => {
  test('returns result when function completes before timeout', async () => {
    const testFn = async () => 'success';
    const result = await timedFunction(testFn, 1000, 'default');
    expect(result).toBe('success');
  });

  test('returns default value when function times out', async () => {
    const testFn = async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      return 'success';
    };
    const result = await timedFunction(testFn, 100, 'default');
    expect(result).toBe('default');
  });
});