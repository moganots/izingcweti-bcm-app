export enum CacheEvictionPolicy {
  LRU = 'lru',
  LFU = 'lfu',
  FIFO = 'fifo',
  TTL = 'ttl',
}

export enum CacheCompressionAlgorithm {
  NONE = 'none',
  GZIP = 'gzip',
  LZ4 = 'lz4',
}
