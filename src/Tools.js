// @flow

const pointDistance = function(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
};

const degreToAlpha = function(d: number): number {
  const a = ((d % 360) + 360) % 360;
  return (a / 360.0) * 2 * Math.PI;
};

const radianToDegre = function(r: number): number {
  const d = (r * 360.0) / (2 * Math.PI);
  return ((d % 360) + 360) % 360;
};

const float2 = function(x: number): number {
  return Math.floor(x * 100) / 100;
};

const checkEquality = function(
  name1: string,
  value1: number,
  name2: string,
  value2: number,
  eps: number = 0.03
): boolean {
  if (Math.abs(value1 - value2) / Math.max(value1, value2) > eps) {
    console.log(`${name1} = ${value1} ${name2} = ${value2}`);
    return false;
  }
  return true;
};

export { pointDistance, degreToAlpha, float2 };
