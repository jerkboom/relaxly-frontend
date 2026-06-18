export const queryKeys = {
  hostels: {
    all: ['hostels'] as const,
    lists: () => [...queryKeys.hostels.all, 'list'] as const,
    list: (params: Record<string, unknown>) =>
      [...queryKeys.hostels.lists(), params] as const,
    detail: (id: string) => [...queryKeys.hostels.all, 'detail', id] as const,
    popular: () => [...queryKeys.hostels.all, 'popular'] as const,
    activeUniversities: () => [...queryKeys.hostels.all, 'active-universities'] as const,
  },
  universities: {
    all: ['universities'] as const,
    lists: () => [...queryKeys.universities.all, 'list'] as const,
  },
  wishlist: {
    all: ['wishlist'] as const,
  },
};
