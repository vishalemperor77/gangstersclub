import { renderHook } from '@testing-library/react';
import { usePageTitle } from '../hooks/usePageTitle';

describe('usePageTitle', () => {
  it('sets "<page> — GANGSTERS CLUB" as the document title', () => {
    renderHook(() => usePageTitle('Vault'));
    expect(document.title).toBe('Vault — GANGSTERS CLUB');
  });

  it('falls back to the club name alone when no title is passed', () => {
    renderHook(() => usePageTitle());
    expect(document.title).toBe('GANGSTERS CLUB');
  });

  it('updates when the title argument changes', () => {
    const { rerender } = renderHook(({ t }) => usePageTitle(t), {
      initialProps: { t: 'About' },
    });
    expect(document.title).toBe('About — GANGSTERS CLUB');
    rerender({ t: 'Membership' });
    expect(document.title).toBe('Membership — GANGSTERS CLUB');
  });
});
