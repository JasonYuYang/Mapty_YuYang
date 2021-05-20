import { async } from 'regenerator-runtime';
import { AJAX } from './helper.js';
import { EDIT_TOGGLE } from './views/config';
import { SORT_OPTION } from './views/config';
export const state = {
  map: {},
  weatherData: {},
  locationName: {},
  time: {},
  edit: EDIT_TOGGLE,
  sortType: ' All',
  sortOptions: SORT_OPTION,
};
export const workouts = [];
export const favorites = [];
export const markers = [];

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
export const getWeather = async coords => {
  try {
    const mykey = '4146e46406289a97e4f9d1d324df1c4b';
    const [lon, lat] = coords;
    const weatherData = await AJAX(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${mykey}`,
      'Failed to get data from openweathermap !!'
    );

    const iconCode = weatherData.weather[0].icon;
    state.weatherData.weatherIcon = `http://openweathermap.org/img/wn/${iconCode}@2x.png`;
    state.weatherData.IconDescription = weatherData.weather[0].description;
    state.weatherData.currentTemp = weatherData.main.temp;
  } catch (err) {
    throw err;
  }
};
export const getLocation = async (coords, index) => {
  try {
    const [lng, lat] = coords;
    const data = await AJAX(
      `https://geocode.xyz/${lat},${lng}?geoit=json`,
      'Please try to reload the page again. Unfortunately, this api what I am using now can not read all datas at once and I am not willing to pay for the API. Error occurs from this reason.'
    );
    if (index == 0) {
      state.locationName.startLocationIn = data.osmtags.is_in;
      state.locationName.startLocationStreet = data.staddress;
    }
    if (index == 1) {
      state.locationName.endLocationIn = data.osmtags.is_in;
      state.locationName.endLocationStreet = data.staddress;
    }
  } catch (err) {
    throw err;
  }
};
export const addTimeToPopUp = async (min, startSeconds) => {
  let ms = +min * 60 * 1000;
  let now = startSeconds ? startSeconds : Date.now();
  state.time.startMs = now;
  let outputTime = now + ms;
  state.time.endMs = outputTime;
  let startTime = new Date(now);

  let endTime = new Date(outputTime);
  // prettier-ignore
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  state.time.dateNow = `${months[startTime.getMonth()]} ${startTime.getDate()}`;
  state.time.timeNow = `${
    startTime.getHours() > 12 ? startTime.getHours() - 12 : startTime.getHours()
  }:${startTime.getMinutes() < 10 ? '0' : ''}${startTime.getMinutes()} ${
    startTime.getHours() > 12 ? 'PM' : 'AM'
  }`;
  state.time.dateEnd = `${months[endTime.getMonth()]} ${endTime.getDate()}`;
  state.time.timeEnd = `${
    endTime.getHours() > 12 ? endTime.getHours() - 12 : endTime.getHours()
  }:${endTime.getMinutes() < 10 ? '0' : ''}${endTime.getMinutes()} ${
    endTime.getHours() > 12 ? 'PM' : 'AM'
  }`;
};

export class Workout {
  #date = new Date();
  #id = (Date.now() + '').slice(-10);
  //Create ID as last 10 characters  from date
  constructor(startCoords, endCoords, distance, duration, weather, time) {
    this.id = this.#id;
    this.startCoords = startCoords;
    this.endCoords = endCoords; // [lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
    this.weather = weather;
    this.time = time;
  }
  _setDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return `${months[this.#date.getMonth()]} ${this.#date.getDate()}`;
  }
}
export class Running extends Workout {
  #type = 'running';
  constructor(
    startCoords,
    endCoords,
    distance,
    duration,
    weather,
    time,
    cadence
  ) {
    super(startCoords, endCoords, distance, duration, weather, time);
    this.cadence = cadence;
    this.description = `${this.#type[0].toUpperCase()}${this.#type.slice(
      1
    )} on ${this._setDescription()}`;
    this._calcPace();
    this.type = this.#type;
  }
  _calcPace() {
    // min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}
export class Cycling extends Workout {
  #type = 'cycling';
  constructor(
    startCoords,
    endCoords,
    distance,
    duration,
    weather,
    time,
    elevationGain
  ) {
    super(startCoords, endCoords, distance, duration, weather, time);
    this.elevationGain = elevationGain;
    this.description = `${this.#type[0].toUpperCase()}${this.#type.slice(
      1
    )} on ${this._setDescription()}`;
    this._calcSpeed();
    this.type = this.#type;
  }
  _calcSpeed() {
    // km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

export const addFavorites = (e, workouts, favorites) => {
  const workoutEl = e.target.closest('.workout');
  if (!workoutEl) return;
  const bookmarkBtn = e.target.closest('.workout__title');
  if (!bookmarkBtn) return;
  const workout = workouts.find(work => work.id === workoutEl.dataset.id);

  if (bookmarkBtn.classList.contains('bookmark')) {
    workout.favorites = false;
    bookmarkBtn.classList.remove('bookmark');
    const workoutIndex = favorites.findIndex(
      work => work.id === workoutEl.dataset.id
    );
    favorites.splice(workoutIndex, 1);
  } else {
    bookmarkBtn.classList.add('bookmark');
    workout.favorites = true;
    favorites.push(workout);
  }
};

export const initialFavorites = workouts => {
  workouts.forEach(workout => {
    if (workout.favorites) {
      favorites.push(workout);
    }
  });
  const workoutsOnScreen = Array.from(document.querySelectorAll('.workout'));
  let idFavorites = [];
  idFavorites = favorites.map(workout => {
    return workout.id;
  });
  let favoritesOnScreen = workoutsOnScreen.filter(workout => {
    return idFavorites.includes(workout.dataset.id);
  });
  favoritesOnScreen.forEach(favorite => {
    favorite.querySelector('.workout__title').classList.add('bookmark');
  });
};

export const setLocalStorage = workouts => {
  localStorage.setItem('workouts', JSON.stringify(workouts));
};

export const getLocalStorage = workouts => {
  const data = JSON.parse(localStorage.getItem('workouts'));
  if (!data) return;
  data.forEach(workout => {
    workout =
      workout.type === 'running'
        ? Object.setPrototypeOf(workout, Running.prototype)
        : Object.setPrototypeOf(workout, Cycling.prototype);
  });
  workouts = data;
};
