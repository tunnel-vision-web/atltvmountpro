import { useEffect } from 'react';

const DEFAULT_TITLE = 'ATL TV Mount PRO';

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title || DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
};

export default usePageTitle;
