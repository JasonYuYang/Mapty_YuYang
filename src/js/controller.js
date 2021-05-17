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
    addWorkout.Marker = mapView.addpopupToMarker(addWorkout, 1);
    model.markers.push({ id: addWorkout.id, marker: addWorkout.Marker });
    workoutsView.renderWorkout(addWorkout);
  } catch (err) {
    console.log(err);
    mapView.renderError(err);
  }
};
const controlEditForm = async () => {
  try {
    const form = document.querySelector('.form');
    Object.assign(model.state, formView.getInputvalue());
    let editWorkout;
    model.state.weatherData = model.workouts[model.state.editIndex].weather;
    let startSeconds = model.workouts[model.state.editIndex].time.startMs;
    model.addTimeToPopUp(model.state.duration, startSeconds);
    editWorkout = workoutsView.newWorkout(
      model.Running,
      model.Cycling,
      model.state,
      model.workouts
    );
    editWorkout.description = `${editWorkout.type[0].toUpperCase()}${editWorkout.type.slice(
      1
    )} on ${editWorkout.time.dateNow}`;
    editWorkout.id = model.workouts[model.state.editIndex].id;
    await mapView.removeStartMarker();
    await mapView.preserveMarker(model.state.map.DestinationCoords);
    mapView.renderSpinner(form);
    await model.getLocation(editWorkout.startCoords, 0);
    await model.getLocation(editWorkout.endCoords, 1);
    mapView.removeSpinner();
    editWorkout.locationName = { ...model.state.locationName };
    model.workouts.splice(model.state.editIndex, 1, editWorkout);
    const markerIndex = model.markers.findIndex(
      marker => marker.id === editWorkout.id
    );
    model.markers.splice(markerIndex, 1);
    editWorkout.Marker = mapView.addpopupToMarker(editWorkout, 1);
    model.markers.push({ id: editWorkout.id, marker: editWorkout.Marker });
    delete model.state.editIndex;
    let workoutsReverse = model.workouts.reverse();
    let editWorkoutMarkup = workoutsReverse.reduce((markup, work) => {
      return (markup += workoutsView.generateMarkup(work));
    }, '');
    mapView.updateWorkout(editWorkoutMarkup);
    console.log(model.state);
  } catch (err) {
    console.log(err);
  }
};
const controlWorkoutRenderPath = e => {
  try {
    mapView.moveToPopRoute(e, model.workouts);
  } catch (err) {
    mapView.renderError(err);
  }
};

const controlFavorites = e => {
  model.addFavorites(e, model.workouts, model.favorites);
};
const controlDropdown = (e, dropdownItem) => {
  console.log(dropdownItem);
  if (dropdownItem.classList.contains('edit')) {
    model.state.edit = true;
    workoutsView.editWorkout(e, model.workouts);
  }
};
const showDropdown = e => {
  dropdown.showDropdown(e);
};
const controlHideDropdown = e => {
  dropdown.hideDropdownClickOutside(e);
};

const init = async () => {
  await controlMap();
  formView.addHandlerForm(controlForm, controlEditForm);
  workoutsView.addHandlerWorkout(controlWorkoutRenderPath);
  workoutsView.addHandlerFavorite(controlFavorites);
  dropdown.addHandlerHideDropdown(controlHideDropdown);
  dropdown.addHandlerShowDropdown(showDropdown);
  dropdown.addHandlerControlDropdown(controlDropdown);
};
init();
