import { PrimitiveTypes, ComplexTypeRegexp } from "./enums.js";

const matchJson = (data) =>
  typeof data === "string" && data.match(ComplexTypeRegexp.JSON);

const tryParseJson = (data) => {
  if (!matchJson(data)) return false;
  try {
    return JSON.parse(data);
  } catch (e) {
    return false;
  }
};
const isDataComplex = ({ type, exampleValue }) =>
  type.match(ComplexTypeRegexp.ALL) || typeof exampleValue === "object";

const isDataPrimitiveString = ({ type }) =>
  PrimitiveTypes[type] && PrimitiveTypes[type] === "string";

const isObject = (val) => val === Object(val);

export {
  isDataComplex,
  isDataPrimitiveString,
  tryParseJson,
  isObject,
  matchJson,
};
