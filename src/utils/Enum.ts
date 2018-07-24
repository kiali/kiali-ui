export const fromValue = <EnumType, EnumValue extends keyof EnumType>(
  enumType: EnumType,
  value: any,
  defaultValue: any
) => {
  const found: EnumValue = enumType[value] as EnumValue;
  if (found !== undefined) {
    return enumType[found];
  }
  return defaultValue;
};
