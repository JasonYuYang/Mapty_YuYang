import { async } from 'regenerator-runtime';
import { AJAX } from './helper.js';
export const state = { map: {}, workoutData: {} };

export const getPosition = async () => {
  return new Promise((resolve, reject) => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords;
          const coords = [longitude, latitude];
          state.map.currentPosition = coords;
          resolve(coords);
        });
      }
    } catch (err) {
      throw err;
    }
  });
};
export const getWeather = async () => {
  try {
    const mykey = '4146e46406289a97e4f9d1d324df1c4b';
    const [lat, lon] = state.map.currentPosition;
    const weatherData = await AJAX(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${mykey}`,
      'Failed to get data from openweathermap !!'
    );
    console.log(weatherData);
    const iconCode = weatherData.weather[0].icon;
    state.workoutData.weatherIcon = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    state.workoutData.IconDescripttion = weatherData.weather[0].description;
  } catch (err) {
    throw err;
  }
};
export const getLocation = async () => {
  try {
    const [lat, lng] = state.map.currentPosition;
    const data = await AJAX(
      `https://geocode.xyz/${lat},${lng}?geoit=json`,
      'Please try to reload the page again. Unfortunately, this api what I am using now can not read all datas at once and I am not willing to pay for the API. Error occurs from this reason.'
    );
    console.log(data);
    state.workoutData.locationName = data.osmtags.name;
    state.workoutData.locationIn = data.osmtags.is_in;
  } catch (err) {
    // err =
    //   'Please try to reload the page again. Unfortunately,the geocode api I am using now can not read all datas at once and I am not willing to pay for the API. Error occurs from this reason.';
    console.error(err);
  }
};
