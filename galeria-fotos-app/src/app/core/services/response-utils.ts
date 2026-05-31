export function extractItems<T>(response: T[] | { items?: T[]; data?: T[]; value?: T[]; results?: T[] }): T[] {
  if (Array.isArray(response)) {
    return response;
  }

  return response.items ?? response.data ?? response.value ?? response.results ?? [];
}
