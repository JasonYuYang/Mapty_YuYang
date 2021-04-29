'use strict';
import * as model from './model';
import mapView from './views/mapView';
import icons from 'url:../img/sprite.svg';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

const controlMap = async () => {
  // get current position
  model.getPosition();
  //render Map
  mapView.render(model.state.map);
  // console.log(model.state.map);
  console.log(model.state.map.currentPosition);
};

const init = () => {
  controlMap();
};
init();

//////////////////////////////////////////////////////////////////////////////////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputStart = document.querySelector('.start');
const inputEnd = document.querySelector('.end');
const inputElevation = document.querySelector('.form__input--elevation');
