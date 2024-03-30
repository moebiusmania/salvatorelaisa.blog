interface Options {
  length?: number;
  numbers?: boolean;
  symbols?: boolean;
  lowercase?: boolean;
  uppercase?: boolean;
}

type Charset = "numbers" | "symbols" | "lowercase" | "uppercase";

export const generatePassword = (_options?: Options): string => {
  const defaults: Options = {
    length: 12,
    numbers: true,
    symbols: true,
    lowercase: true,
    uppercase: true,
  };

  const sets = {
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  };

  const options = { ...defaults, ..._options };

  const charset = Object.keys(options)
    .sort()
    .filter((key) => options[key as Charset])
    .map((key) => sets[key as Charset])
    .join("");

  const pswd = Array.from(
    { length: options.length || (defaults.length as number) },
    () => charset[Math.floor(Math.random() * charset.length)]
  ).join("");

  return pswd;
};
