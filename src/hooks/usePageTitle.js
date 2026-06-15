import { useEffect } from 'react';

const DEFAULT_TITLE = 'Atlanta TV Mount Pro';

const usePageTitle = (title) => {
  useEffect(() => {
    document.title = title || DEFAULT_TITLE;
    return () => {
      document.title = DEFAULT_TITLE;
    };
  }, [title]);
};

export default usePageTitle;
