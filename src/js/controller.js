'use strict';
import * as model from './model';
import mapView from './views/mapView';
import formView from './views/formView';
import workoutsView from './views/workoutsView';
import dropdown from './views/dropdown';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

const controlMap = async () => {
  try {
    const map = document.querySelector('#map');
    mapView.renderLoadingSpinner(map);
    // get current position
    await model.getPosition();
    //render Map
    await mapView.loadMap(model.state.map);
    mapView.removeSpinner();
  } catch (err) {
    mapView.renderError(err);
  }
};
const controlForm = async () => {
  try {
    const form = document.querySelector('.form');
    let addWorkout;
    Object.assign(model.state, formView.getInputvalue());
    await model.getWeather(model.state.map.pathStart);
    model.addTimeToPopUp(model.state.duration);
    workoutsView.newWorkout(
      model.Running,
      model.Cycling,
      model.state,
      model.workouts
    );
    await mapView.removeStartMarker();
    await mapView.preserveMarker(model.state.map.DestinationCoords);
    addWorkout = model.workouts[model.workouts.length - 1];
    mapView.renderSpinner(form);
    await model.getLocation(addWorkout.startCoords, 0);
    await model.getLocation(addWorkout.endCoords, 1);
    mapView.removeSpinner();
    addWorkout.locationName = { ...model.state.locationName };
    mapView.addpopupToMarker(addWorkout, 1);
    workoutsView.renderWorkout(addWorkout);
  } catch (err) {
    mapView.renderError(err);
  }
};
const controlWorkoutRenderPath = e => {
  try {
    mapView.moveToPopRoute(e, model.workouts);
  } catch (err) {
    mapView.renderError(err);
  }
};
const controlWorkoutEdit = () => {};
const controlWorkoutDelete = () => {};
const controlFavorites = e => {
  model.addFavorites(e, model.workouts, model.favorites);
};
const controlDropdown = e => {
  dropdown.showDropdown(e);
};
const controlHideDropdown = e => {
  dropdown.hideDropdownClickOutside(e);
};
const init = async () => {
  await controlMap();
  formView.addHandlerForm(controlForm);
  workoutsView.addHandlerWorkout(controlWorkoutRenderPath);
  workoutsView.addHandlerFavorite(controlFavorites);
  dropdown.addHandlerHideDropdown(controlHideDropdown);
  dropdown.addHandlerDropdown(controlDropdown);
};
init();
