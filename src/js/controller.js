'use strict';
//////////////////////////////////////////////////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
class App {
  //Private class properties
  #map;
  #mapEvent;
  #mapZoomLevel = 13;
  #workouts = [];
  constructor() {
    //Immediately call When instance created.So, when Page load the function will be invoked.
    this._getPostion();
    //Event listner
    form.addEventListener('submit', this._newWorkout);
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener('click', this._moveToPopup);
  }
  _getPostion = () => {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(this._loadMap, () =>
        alert(`Could not get your position`)
      );
  };
  _loadMap = position => {
    const { latitude } = position.coords;
    const { longitude } = position.coords;

    const coords = [latitude, longitude];
    this.#map = L.map('map').setView(coords, 13); //13 is zoom value

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    //Handling click on Map
    this.#map.on('click', this._showForm);

    //When we get the localStorageDATA,we need to render the marker，but it has to be after this.#map load.
    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  };
  _showForm = mapE => {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
  };
}

const app = new App();
console.log(app);
