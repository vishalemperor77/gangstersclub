import { useEffect } from 'react';

const SUFFIX = 'GANGSTERS CLUB';

/**
 * Sets the document title for a page. Pass the page-specific part only —
 * the club name is appended automatically. Keep this out of the section
 * layouts for pages that set their own title, because a parent effect runs
 * after a child effect and would overwrite it.
 */
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — ${SUFFIX}` : SUFFIX;
  }, [title]);
}