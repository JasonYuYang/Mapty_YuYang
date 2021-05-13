import icons from 'url:../../img/sprite.svg';
import img from 'url:../../img/icon.png';
class workoutsView {
  #form = document.querySelector('.form');
  #containerWorkouts = document.querySelector('.workouts');
  #inputType = document.querySelector('.form__input--type');
  #inputStart = document.querySelector('.start');
  #inputEnd = document.querySelector('.end');
  #inputElevation = document.querySelector('.form__input--elevation');
  #map = document.querySelector('#map');

  addHandlerWorkout = handler => {
    this.#containerWorkouts.addEventListener('click', e => {
      handler(e);
    });
  };
  addHandlerFavorite = handler => {
    this.#containerWorkouts.addEventListener('click', e => {
      handler(e);
    });
  };

  newWorkout = (running, cycling, data, workouts) => {
    let workout;

    if (data.type === 'running') {
      workout = new running(
        data.map.pathStart,
        data.map.pathEnd,
        data.map.pathDistance,
        data.duration,
        { ...data.weatherData },
        { ...data.time },
        data.cadence
      );
    }
    if (data.type === 'cycling') {
      workout = new cycling(
        data.map.pathStart,
        data.map.pathEnd,
        data.map.pathDistance,
        data.duration,
        { ...data.weatherData },
        { ...data.time },
        data.elevation
      );
    }
    // ADD NEW OBJECT TO WORKOUTS ARRAY
    workouts.push(workout);
    console.log(workouts);
  };
  renderWorkout = workout => {
    const index = workout.type == 'running' ? 0 : 1;
    const markup = this.generateMarkup(workout, index);
    this.#form.insertAdjacentHTML('afterend', markup);
  };
  generateMarkup = (workout, index) => {
    if (index == 0) {
      return `<li class="workout workout--running" data-id=${workout.id}>
      <h2 class="workout__title">
        <div class="workout__favorite"><span>&#9733;</span></div>
        ${workout.description}
      </h2>
      <svg class="workout__icon--expand">
        <use
          xlink:href="${icons}#icon-dots-three-horizontal"
        ></use>
      </svg>

      <div class="workout__details">
        <span class="workout__icon">🏃‍♂️</span>
        <span class="workout__value">${(workout.distance / 1000).toFixed(
          2
        )}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${
          workout.duration > 60
            ? (workout.duration / 60).toFixed(1)
            : workout.duration
        }</span>
        <span class="workout__unit">${
          workout.duration > 60 ? 'h' : 'min'
        }</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace.toFixed(1)}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">👟</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
      <div class="workout__data">
        <div class="workout__address">
          <span class="workout__icon"><img src="${img}" /></span>
          <div class="workout__address--details">
            <span class="workout__street">${
              workout.locationName.endLocationStreet
            }</span>
            <span class="workout__in">${
              workout.locationName.endLocationIn
            }</span>
          </div>
        </div>
        <div class="workout__details align--center">
          <span class="weather__icon"
            ><img
              src=${workout.weather.weatherIcon}
              height="10px"
              alt = ${workout.weather.IconDescription}
          /></span>
          <span class="workout__value">${Math.round(
            workout.weather.currentTemp
          )}</span>
          <span class="workout__unit">°C</span>
        </div>

        <div class="workout__details align--center">
          <span class="workout__timer"
            ><svg>
              <use xlink:href="${icons}#icon-clock"></use></svg
          ></span>
          <span class="workout__value">${
            workout.time.timeNow.split(' ')[0]
          }</span>
          <span class="workout__unit">${
            workout.time.timeNow.split(' ')[1]
          }</span>
        </div>
      </div>
    </li>`;
    }
    if (index == 1) {
      return `<li class="workout workout--running" data-id=${workout.id}>
      <h2 class="workout__title">
        <div class="workout__favorite"><span>&#9733;</span></div>
        ${workout.description}
      </h2>
      <svg class="workout__icon--expand">
        <use
          xlink:href="${icons}#icon-dots-three-horizontal"
        ></use>
      </svg>

      <div class="workout__details">
        <span class="workout__icon">🚴‍♀️</span>
        <span class="workout__value">${(workout.distance / 1000).toFixed(
          2
        )}</span>
        <span class="workout__unit">km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⏱</span>
        <span class="workout__value">${
          workout.duration > 60
            ? (workout.duration / 60).toFixed(1)
            : workout.duration
        }</span>
        <span class="workout__unit">${
          workout.duration > 60 ? 'h' : 'min'
        }</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">spm</span>
      </div>
      <div class="workout__data">
        <div class="workout__address">
          <span class="workout__icon"><img src="${img}" /></span>
          <div class="workout__address--details">
            <span class="workout__street">${
              workout.locationName.endLocationStreet
            }</span>
            <span class="workout__in">${
              workout.locationName.endLocationIn
            }</span>
          </div>
        </div>
        <div class="workout__details align--center">
          <span class="weather__icon"
            ><img
              src=${workout.weather.weatherIcon}
              height="10px"
              alt = ${workout.weather.IconDescription}
          /></span>
          <span class="workout__value">${Math.round(
            workout.weather.currentTemp
          )}</span>
          <span class="workout__unit">°C</span>
        </div>

        <div class="workout__details align--center">
          <span class="workout__timer"
            ><svg>
              <use xlink:href="${icons}#icon-clock"></use></svg
          ></span>
          <span class="workout__value">${
            workout.time.timeNow.split(' ')[0]
          }</span>
          <span class="workout__unit">${
            workout.time.timeNow.split(' ')[1]
          }</span>
        </div>
      </div>
    </li>`;
    }
  };
}

export default new workoutsView();
