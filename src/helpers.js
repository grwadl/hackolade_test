import { PrimitiveTypes, ComplexTypeRegexp } from "./enums.js";
import fs from "fs";

const matchJson = (data) => typeof data === "string" && data.match(ComplexTypeRegexp.JSON);

const tryParseJson = (data) => {
  if (!matchJson(data)) return false;
  try {
    return JSON.parse(data);
  } catch (e) {
    return false;
  }
};
const isDataComplex = ({ type, exampleValue }) =>
  (type.match(ComplexTypeRegexp.ALL) || (typeof exampleValue === "object" && exampleValue !== null)) && !PrimitiveTypes[type];

const isDataPrimitiveString = ({ type }) => PrimitiveTypes[type] && PrimitiveTypes[type] === "string";

const isObject = (val) => val === Object(val);

const fileFriter = {
  write(data, fileName) {
    const resultSchemas = Array.isArray(data) ? data : [data];
    fs.writeFileSync(fileName, JSON.stringify(resultSchemas));
  },
  read(fileName, encoding = "utf-8") {
    return fs.readFileSync(fileName, { encoding });
  }
};

export { isDataComplex, isDataPrimitiveString, tryParseJson, isObject, matchJson, fileFriter };
