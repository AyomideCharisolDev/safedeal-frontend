

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useContext } from 'react';
import { PostContext } from '../pages/context/post_context';


const usePostContext = (): any => {
  const context = useContext(PostContext);

  if (!context) {
    throw new Error('usepostContext must be used inside an postContsxt');
  }

  return context;
};

export default usePostContext;
