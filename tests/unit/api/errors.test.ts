import { describe, it, expect } from 'vitest';
import { ApiError } from '@/lib/api/errors';

describe('ApiError', () => {
  it('has name set to ApiError', () => {
    const err = new ApiError(404, 'Not found');
    expect(err.name).toBe('ApiError');
  });

  it('exposes the status code', () => {
    const err = new ApiError(401, 'Unauthorized');
    expect(err.status).toBe(401);
  });

  it('exposes the detail string', () => {
    const err = new ApiError(422, 'Validation failed');
    expect(err.detail).toBe('Validation failed');
  });

  it('is an instance of Error', () => {
    const err = new ApiError(500, 'Server error');
    expect(err).toBeInstanceOf(Error);
  });

  it('sets message equal to detail', () => {
    const err = new ApiError(400, 'Bad request');
    expect(err.message).toBe('Bad request');
  });
});
