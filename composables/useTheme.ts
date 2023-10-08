export const useTheme = () => {
  const route = useRoute();
  const current: string = route.query.theme as string;
  return useState("theme", () => (current === "dark" ? `?theme=dark` : ""));
};
