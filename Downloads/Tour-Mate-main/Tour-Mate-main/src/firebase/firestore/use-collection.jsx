'use client';

import { useState, useEffect } from 'react';
import { onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

/**
 * React hook to subscribe to a Firestore collection or query in real-time.
 * Handles nullable references.
 * 
 *
 * IMPORTANT! YOU MUST MEMOIZE the inputted memoizedTargetRefOrQuery or BAD THINGS WILL HAPPEN
 * use useMemo to memoize it per React guidence.  Also make sure that it's dependencies are stable
 * references
 *  
 * @param {object} memoizedTargetRefOrQuery - The Firestore CollectionReference or Query. Waits if null/undefined.
 * @returns {{data: Array<object>|null, isLoading: boolean, error: object|null}} Object with data, isLoading, error.
 */
export function useCollection(memoizedTargetRefOrQuery) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!memoizedTargetRefOrQuery) {
      setData(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    const unsubscribe = onSnapshot(
      memoizedTargetRefOrQuery,
      (snapshot) => {
        const results = [];
        for (const doc of snapshot.docs) {
          results.push({ ...doc.data(), id: doc.id });
        }
        setData(results);
        setError(null);
        setIsLoading(false);
      },
      (error) => {
        const path =
          memoizedTargetRefOrQuery.type === 'collection'
            ? memoizedTargetRefOrQuery.path
            : memoizedTargetRefOrQuery._query.path.canonicalString()

        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path,
        })

        setError(contextualError)
        setData(null)
        setIsLoading(false)

        errorEmitter.emit('permission-error', contextualError);
      }
    );

    return () => unsubscribe();
  }, [memoizedTargetRefOrQuery]);
  
  if(memoizedTargetRefOrQuery && !memoizedTargetRefOrQuery.__memo) {
    throw new Error(memoizedTargetRefOrQuery + ' was not properly memoized using useMemoFirebase');
  }
  
  return { data, isLoading, error };
}
