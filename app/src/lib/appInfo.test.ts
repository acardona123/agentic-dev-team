import { APP_NAME, screenTitle } from './appInfo';

describe('screenTitle', () => {
  it('returns the app name when no stage is given', () => {
    expect(screenTitle()).toBe(APP_NAME);
  });

  it('appends a stage when one is given', () => {
    expect(screenTitle('skeleton')).toBe('Almost There — skeleton');
  });

  it('ignores a blank stage', () => {
    expect(screenTitle('   ')).toBe(APP_NAME);
  });
});
