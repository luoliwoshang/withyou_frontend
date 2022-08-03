import moment from "moment";

/**
 * 响应式重置 (vue3)
 * @param {Object} _react
 * @param {Object} _origin
 */
export function reset_obj(_react, _origin) {
  // stateData.pageProp = { ...defaultPage } 错误
  const keys = Object.keys(_origin);
  let obj = {};
  keys.forEach((item) => {
    obj[item] = _origin[item];
  });
  Object.assign(_react, obj);
  console.log(_react);
}
/**
 * objectid转换时间
 * @param {ObjectId} id
 */
export function id_to_time(id, format = "yyyy年M月DD日 HH:mm:ss") {
  let timeHex = id.slice(0, 8);
  return moment(parseInt(timeHex, 16) * 1000).format(format);
}
