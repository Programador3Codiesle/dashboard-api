export async function mapInBatches<T, R>(
  items: T[],
  batchSize: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const size = Math.max(1, batchSize);
  const result: R[] = [];
  for (let i = 0; i < items.length; i += size) {
    const chunk = items.slice(i, i + size);
    const mapped = await Promise.all(
      chunk.map((item, offset) => mapper(item, i + offset)),
    );
    result.push(...mapped);
  }
  return result;
}
