/** Express 5 tipa `req.params` como `string | string[]` em alguns casos. */
export function paramAsString(
  value: string | string[] | undefined,
): string | undefined {
  if (value === undefined) return undefined;
  const v = Array.isArray(value) ? value[0] : value;
  return typeof v === "string" && v.length > 0 ? v : undefined;
}
