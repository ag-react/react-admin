import { useMemo } from 'react';
import { useQuery, UseQueryOptions, QueryObserverResult } from 'react-query';

import useAuthProvider from './useAuthProvider';
import { UserIdentity } from '../types';

const defaultIdentity = {
    id: '',
    fullName: null,
};
const defaultQueryParams = {
    staleTime: 5 * 60 * 1000,
};

/**
 * Return the current user identity by calling authProvider.getIdentity() on mount
 *
 * The return value updates according to the call state:
 *
 * - mount: { isLoading: true }
 * - success: { identity: Identity, refetch: () => {}, isLoading: false }
 * - error: { error: Error, isLoading: false }
 *
 * The implementation is left to the authProvider.
 *
 * @returns The current user identity. Destructure as { isLoading, identity, error, refetch }.
 *
 * @example
 * import { useGetIdentity, useGetOne } from 'react-admin';
 *
 * const PostDetail = ({ id }) => {
 *     const { data: post, isLoading: postLoading } = useGetOne('posts', { id });
 *     const { identity, isLoading: identityLoading } = useGetIdentity();
 *     if (postLoading || identityLoading) return <>Loading...</>;
 *     if (!post.lockedBy || post.lockedBy === identity.id) {
 *         // post isn't locked, or is locked by me
 *         return <PostEdit post={post} />
 *     } else {
 *         // post is locked by someone else and cannot be edited
 *         return <PostShow post={post} />
 *     }
 * }
 */
export const useGetIdentity = (
    queryParams: UseQueryOptions<UserIdentity, Error> = defaultQueryParams
): UseGetIdentityResult => {
    const authProvider = useAuthProvider();

    const result = useQuery(
        ['auth', 'getIdentity'],
        authProvider
            ? () => authProvider.getIdentity()
            : async () => defaultIdentity,
        queryParams
    );

    return useMemo(
        () =>
            result.isLoading
                ? { isLoading: true }
                : result.error
                ? { error: result.error, isLoading: false }
                : {
                      identity: result.data,
                      refetch: result.refetch,
                      isLoading: false,
                  },

        [result]
    );
};

export type UseGetIdentityResult =
    | {
          isLoading: true;
          identity?: undefined;
          error?: undefined;
          refetch?: undefined;
      }
    | {
          isLoading: false;
          identity?: undefined;
          error: Error;
          refetch?: undefined;
      }
    | {
          isLoading: false;
          identity: UserIdentity;
          error?: undefined;
          refetch: () => Promise<QueryObserverResult<UserIdentity, Error>>;
      };

export default useGetIdentity;
