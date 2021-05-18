'use strict';
import * as model from './model';
import mapView from './views/mapView';
import formView from './views/formView';
import workoutsView from './views/workoutsView';
import dropdown from './views/dropdown';
import sortView from './views/sortView';

import 'core-js/stable';
import 'regenerator-runtime/runtime';
const controlWorkout = () => {
  const markup = sortView.generateSortSectionMarkup(model.workouts);
  mapView.updateSortSection(markup);
};
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
    mapView.preserveMarker(model.state.map.pathEnd);
    mapView.renderSpinner(form);
    await mapView.removeSetUpMarker();
    addWorkout = model.workouts[model.workouts.length - 1];
    await model.getLocation(addWorkout.startCoords, 0);
    await model.getLocation(addWorkout.endCoords, 1);
    mapView.removeSpinner();
    addWorkout.locationName = { ...model.state.locationName };
    addWorkout.Marker = mapView.addpopupToMarker(addWorkout, 1);
    model.markers.push({ id: addWorkout.id, marker: addWorkout.Marker });
    workoutsView.renderWorkout(addWorkout);
    const sortMarkup = sortView.generateSortSectionMarkup(model.workouts);
    mapView.updateSortSection(sortMarkup);
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
    mapView.preserveMarker(model.state.map.pathEnd);
    mapView.renderSpinner(form);
    await mapView.removeSetUpMarker();
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
    workoutsView.updateWorkoutMarkupOnScreen();
  } catch (err) {
    console.log(err);
  }
};
const controlWorkoutRenderPath = async e => {
  try {
    await mapView.moveToPopRoute(e, model.workouts);
  } catch (err) {
    mapView.renderError(err);
  }
};

const controlFavorites = e => {
  model.addFavorites(e, model.workouts, model.favorites);
};
const controlDropdown = (e, dropdownItem) => {
  if (dropdownItem.classList.contains('edit')) {
    model.state.edit = true;
    workoutsView.editWorkout(e, model.workouts);
  }
  if (dropdownItem.classList.contains('delete')) {
    workoutsView.deleteWorkout(e, model.workouts);
  }
};
const showDropdown = e => {
  dropdown.showDropdown(e);
};
const controlHideDropdown = e => {
  dropdown.hideDropdownClickOutside(e);
};
const controlSort = e => {};
const controlHamburger = e => {
  sortView.sortState(e);
  workoutsView.sortWorkoutType(model.state.sortType);
};
const init = async () => {
  controlWorkout();
  await controlMap();
  formView.addHandlerForm(controlForm, controlEditForm);
  workoutsView.addHandlerWorkout(controlWorkoutRenderPath);
  workoutsView.addHandlerFavorite(controlFavorites);
  dropdown.addHandlerHideDropdown(controlHideDropdown);
  dropdown.addHandlerShowDropdown(showDropdown);
  dropdown.addHandlerControlDropdown(controlDropdown);
  sortView.addHandlerSort(controlSort);
  sortView.addHandlerhamburger(controlHamburger);
};
init();
