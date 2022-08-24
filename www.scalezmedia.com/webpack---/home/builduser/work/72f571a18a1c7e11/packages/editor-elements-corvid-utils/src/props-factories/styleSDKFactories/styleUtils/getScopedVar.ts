export const getScopedVar = ({
  name,
  prefix,
}: {
  name: string;
  prefix?: string;
}): string => {
  return prefix ? `--${prefix}-corvid-${name}` : `--corvid-${name}`;
};
