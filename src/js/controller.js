'use strict';
import * as model from './model';
import mapView from './views/mapView';
import formView from './views/formView';
import icons from 'url:../img/sprite.svg';
import 'core-js/stable';
import 'regenerator-runtime/runtime';

const controlMap = async () => {
  try {
    // get current position
    await model.getPosition();
    await model.getLocation();

    //render Map
    mapView.loadMap(model.state.map);
  } catch (err) {
    mapView.renderError(err);
  }
};
// const controlForm = (){

// };
const init = () => {
  controlMap();
  // formView.addHandlerForm(controlForm)
};
init();
