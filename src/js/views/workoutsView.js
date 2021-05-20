import icons from 'url:../../img/sprite.svg';
import img from 'url:../../img/icon.png';
import mapView from './mapView';
import * as model from '../model';
import sortView from './sortView';
class workoutsView {
  #form = document.querySelector('.form');
  #containerWorkouts = document.querySelector('.workouts');
  #inputType = document.querySelector('.form__input--type');
  #StartPositionType = document.querySelector('.form__input--route-type');
  #selection = document.querySelector('.form__input--cadence');
  #inputElevation = document.querySelector('.form__input--elevation');
  #inputCadence = document.querySelector('.form__input--cadence');
  #duration = document.querySelector('.form__input--duration');

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
    if (!data.edit) {
      // ADD NEW OBJECT TO WORKOUTS ARRAY
      workouts.push(workout);
    } else {
      return workout;
    }

    console.log(workouts);
  };

  renderWorkout = workout => {
    const markup = this.generateMarkup(workout);
    this.#form.insertAdjacentHTML('afterend', markup);
  };
  editWorkout = async (e, workouts) => {
    const workoutEl = e.target.closest('.workout');
    const form = document.querySelector('.form');
    const editWorkout = workouts.find(work => work.id === workoutEl.dataset.id);
    const editWorkoutIndex = workouts.findIndex(
      work => work.id === workoutEl.dataset.id
    );
    workoutEl.classList.add('editing');
    //Show Form
    form.classList.remove('hidden');
    //Show Workout Type and vlaue
    this.#inputType.value = `${editWorkout.type}`;
    this.#selection =
      this.#inputType.value == 'running'
        ? this.#inputCadence
        : this.#inputElevation;
    this.#selection.value =
      editWorkout.type == 'running'
        ? +editWorkout.cadence
        : +editWorkout.elevationGain;
    if (editWorkout.type == 'running') {
      this.#inputElevation
        .closest('.form__row')
        .classList.add('form__row--hidden');
      this.#inputCadence
        .closest('.form__row')
        .classList.remove('form__row--hidden');
    } else {
      this.#inputElevation
        .closest('.form__row')
        .classList.remove('form__row--hidden');
      this.#inputCadence
        .closest('.form__row')
        .classList.add('form__row--hidden');
    }

    //Show Workout duration;
    this.#duration.value = +editWorkout.duration;
    //Show from position
    this.#StartPositionType.value = `NP`;
    //Show Start Marker on startCoords
    // mapView.InitializeStartMarker();
    mapView.renderMarker(editWorkout.startCoords, 1);
    //Show End Marker on endCoords
    mapView.renderMarker(editWorkout.endCoords, 2);
    //Remove workout Marker
    mapView.editMarkerInit(editWorkout);
    //Show route
    await mapView.renderPath(editWorkout.startCoords, editWorkout.endCoords);
    //showDataOnInput
    mapView.showDataOnInput();
    model.state.editIndex = editWorkoutIndex;
  };
  deleteWorkout = async (e, workouts) => {
    const workoutEl = e.target.closest('.workout');
    const deleteWorkout = workouts.find(
      work => work.id === workoutEl.dataset.id
    );
    const deleteWorkoutIndex = workouts.findIndex(
      work => work.id === workoutEl.dataset.id
    );
    const deleteMarkerIndex = model.markers.findIndex(
      marker => marker.id === workoutEl.dataset.id
    );
    workoutEl.remove();
    //Remove workout Marker from map
    mapView.editMarkerInit(deleteWorkout);
    //Remove path
    await mapView.removeSetUpMarker();
    //Remove workout Marker from model
    model.markers.splice(deleteMarkerIndex, 1);
    workouts.splice(deleteWorkoutIndex, 1);
    //Set Center View
    await mapView.setCenterViewToCurrentPosition();
    model.setLocalStorage(model.workouts);
    this.sortWorkoutType(model.state.sortType);
  };

  sortWorkoutType = sortType => {
    this.#containerWorkouts.querySelectorAll('.workout').forEach(workout => {
      workout.remove();
    });
    if (sortType == ' All') {
      model.workouts.forEach(workout => {
        this.renderWorkout(workout);
      });
      const markup = sortView.generateSortSectionMarkup(model.workouts);
      mapView.updateSortSection(markup);
    }
    if (sortType == '🏃‍♂️ Running') {
      const runningWorkouts = model.workouts.filter(workout => {
        return workout.type === 'running';
      });
      runningWorkouts.forEach(workout => {
        this.renderWorkout(workout);
      });
      const markup = sortView.generateSortSectionMarkup(runningWorkouts);
      mapView.updateSortSection(markup);
    }
    if (sortType == '🚴‍♀️ Cycling') {
      const cyclingWorkouts = model.workouts.filter(workout => {
        return workout.type === 'cycling';
      });
      cyclingWorkouts.forEach(workout => {
        this.renderWorkout(workout);
      });
      const markup = sortView.generateSortSectionMarkup(cyclingWorkouts);
      mapView.updateSortSection(markup);
    }
    if (sortType == '⭐ Favorites') {
      model.favorites.forEach(workout => {
        this.renderWorkout(workout);
      });
      const markup = sortView.generateSortSectionMarkup(model.favorites);
      mapView.updateSortSection(markup);
    }
  };

  workoutsOnView = () => {
    let idOnScreen = [];
    const workoutsOnScreen = Array.from(document.querySelectorAll('.workout'));
    idOnScreen = workoutsOnScreen.map(workout => {
      return workout.dataset.id;
    });
    return model.workouts.filter(workout => {
      return idOnScreen.includes(workout.id);
    });
  };
  sortWorkoutOption = option => {
    const workoutEl = document.querySelector('.workout');
    if (!workoutEl) return;
    let Workouts = this.workoutsOnView();
    let workoutsSortRender;
    if (option == 'SC') {
      workoutsSortRender = [...Workouts].sort((a, b) => {
        a = a.speed ? +a.speed : +a.pace;
        b = b.speed ? +b.speed : +b.pace;
        return b - a;
      });
    }
    if (option == 'duration') {
      workoutsSortRender = [...Workouts].sort((a, b) => {
        return b.duration - a.duration;
      });
    }

    if (option == 'distance') {
      workoutsSortRender = [...Workouts].sort((a, b) => {
        return b.distance - a.distance;
      });
    }

    if (option == 'reset') {
      workoutsSortRender = [...Workouts].sort((a, b) => {
        return b.time.startMs - a.time.startMs;
      });
      console.log(
        [...Workouts].sort((a, b) => {
          return b.time.startMs - a.time.startMs;
        })
      );
    }
    let workoutMarkup = workoutsSortRender.reduce((markup, workout) => {
      return (markup += this.generateMarkup(workout));
    }, '');

    // console.log(workoutsSortRender);
    mapView.updateWorkout(workoutMarkup);
  };
  updateWorkoutMarkupOnScreen = () => {
    let idOnScreen = [];
    const workoutsOnScreen = Array.from(document.querySelectorAll('.workout'));
    idOnScreen = workoutsOnScreen.map(workout => {
      return workout.dataset.id;
    });
    //compare workout on screen with model.workouts ,find workouts on screen with same ID
    let workoutsArray = [...model.workouts].reverse();
    let markupWorkouts = workoutsArray.filter(workout => {
      return idOnScreen.includes(workout.id);
    });

    const workoutMarkup = markupWorkouts.reduce((markup, workout) => {
      return (markup += this.generateMarkup(workout));
    }, '');
    this.sortWorkoutType(model.state.sortType);
    mapView.updateWorkout(workoutMarkup);
  };
  initializeDataView = async () => {
    if (model.state.edit) return;
    const workEl = document.querySelector('.workout');
    if (!workEl) return;
    model.workouts.forEach(workout => {
      mapView.editMarkerInit(workout);
    });
    await mapView.initializeMapRoute();
    const workoutLists = document.querySelectorAll('.workout');
    workoutLists.forEach(workout => (workout.style.display = 'none'));
    model.workouts = [];
    model.markers = [];
    model.setLocalStorage(model.workouts);
    this.sortWorkoutType(model.state.sortType);
    await mapView.setCenterViewToCurrentPosition();
  };
  generateMarkup = workout => {
    const index = workout.type == 'running' ? 0 : 1;
    if (index == 0) {
      return `
      <li class="workout workout--running" data-id=${workout.id}>
      <ul class="dropdown hidden" id="dropdown">
    <li class="dropdown__items edit">
      <svg class="dropdown__icon" id="icon_item">
        <use xlink:href="${icons}#icon-new-message"></use>
      </svg>
      <span class="dropdown__icon-name ">Edit</span>
    </li>
    <li class="dropdown__items delete">
      <svg class="dropdown__icon" id="icon_item">
        <use xlink:href="${icons}#icon-trash"></use>
      </svg>
      <span class="dropdown__icon-name ">Delete</span>
    </li>
  </ul>
      <h2 class="workout__title ${workout.favorites ? 'bookmark' : ''}">
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
      return `<li class="workout workout--cycling" data-id=${workout.id}>
      <ul class="dropdown hidden" id="dropdown">
    <li class="dropdown__items edit">
      <svg class="dropdown__icon" id="icon_item">
        <use xlink:href="${icons}#icon-new-message"></use>
      </svg>
      <span class="dropdown__icon-name">Edit</span>
    </li>
    <li class="dropdown__items delete">
      <svg class="dropdown__icon" id="icon_item">
        <use xlink:href="${icons}#icon-trash"></use>
      </svg>
      <span class="dropdown__icon-name">Delete</span>
    </li>
  </ul>
      <h2 class="workout__title ${workout.favorites ? 'bookmark' : ''}">
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
    </li>
    `;
    }
  };
}

export default new workoutsView();
