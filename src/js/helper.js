import { TIMEOUT_SEC } from './views/config';
export const AJAX = async function (url, errMsg) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (!res.ok) throw new Error(errMsg);
    return data;
  } catch (err) {
    throw err;
  }
};
export const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};
