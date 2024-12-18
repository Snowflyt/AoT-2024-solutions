export const createStreetLight = <Color extends string>(
  colors: Color[],
  defaultColor: NoInfer<Color>,
) => {
  console.log(colors);
  return defaultColor;
};
