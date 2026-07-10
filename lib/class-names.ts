type ClassValue = string | false | null | undefined;

// Ordered matchers that map a Tailwind utility to a conflict "group".
// Two classes conflict only when they share the same variant prefix and group,
// in which case the later class wins. This is intentionally a lightweight,
// dependency-free subset covering the utilities we actually override.
const GROUP_MATCHERS: Array<[RegExp, string]> = [
  [/^rounded(-|$)/, 'rounded'],
  [/^shadow(-|$)/, 'shadow'],
  [/^bg-/, 'bg'],
  [/^px-/, 'px'],
  [/^py-/, 'py'],
  [/^pt-/, 'pt'],
  [/^pr-/, 'pr'],
  [/^pb-/, 'pb'],
  [/^pl-/, 'pl'],
  [/^ps-/, 'ps'],
  [/^pe-/, 'pe'],
  [/^p-/, 'p'],
  [/^-?mx-/, 'mx'],
  [/^-?my-/, 'my'],
  [/^-?mt-/, 'mt'],
  [/^-?mr-/, 'mr'],
  [/^-?mb-/, 'mb'],
  [/^-?ml-/, 'ml'],
  [/^-?m-/, 'm'],
  [/^min-h-/, 'min-h'],
  [/^max-h-/, 'max-h'],
  [/^min-w-/, 'min-w'],
  [/^max-w-/, 'max-w'],
  [/^w-/, 'w'],
  [/^h-/, 'h'],
  [/^text-(xs|sm|base|lg|xl|[2-9]xl)$/, 'text-size'],
  [/^font-(thin|extralight|light|normal|medium|semibold|bold|extrabold|black)$/, 'font-weight'],
];

function groupKeyFor(token: string): string | null {
  const lastColon = token.lastIndexOf(':');
  const variant = lastColon === -1 ? '' : token.slice(0, lastColon + 1);
  const base = lastColon === -1 ? token : token.slice(lastColon + 1);

  for (const [matcher, group] of GROUP_MATCHERS) {
    if (matcher.test(base)) return `${variant}${group}`;
  }
  return null;
}

export function cn(...classes: ClassValue[]) {
  const tokens = classes
    .filter((value): value is string => Boolean(value))
    .flatMap((value) => value.split(/\s+/))
    .filter(Boolean);

  const output: string[] = [];
  const groupIndex = new Map<string, number>();
  const seen = new Set<string>();

  for (const token of tokens) {
    const key = groupKeyFor(token);

    if (key) {
      const existing = groupIndex.get(key);
      if (existing !== undefined) {
        output[existing] = token;
        continue;
      }
      groupIndex.set(key, output.length);
      output.push(token);
      continue;
    }

    if (seen.has(token)) continue;
    seen.add(token);
    output.push(token);
  }

  return output.filter(Boolean).join(' ');
}
