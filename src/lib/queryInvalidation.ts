'use client';

import { queryClient } from './queryClient';
import { queryKeys } from './queryKeys';

export const invalidateHostelQueries = async (hostelId: string) => {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.hostels.lists() }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.hostels.detail(hostelId),
      exact: true,
    }),
    queryClient.invalidateQueries({
      queryKey: queryKeys.hostels.popular(),
      exact: true,
    }),
  ]);
};

export const invalidateWishlistQueries = async () => {
  await queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.all });
};
