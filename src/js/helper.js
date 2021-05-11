// import { TIMEOUT_SEC } from './config.js';
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
