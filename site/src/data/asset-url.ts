import hashes from './asset-hashes.json';

const h = hashes as Record<string, string>;

/** 给资源 URL 加内容 hash,实现 immutable cache bust */
export function assetUrl(url: string): string {
  const hash = h[url];
  return hash ? `${url}?h=${hash}` : url;
}

/** 给 srcset 字符串里每个 URL 加 hash */
export function assetSrcset(srcset: string): string {
  return srcset
    .split(', ')
    .map((entry) => {
      const [url, descriptor] = entry.split(' ');
      return `${assetUrl(url)} ${descriptor}`;
    })
    .join(', ');
}
