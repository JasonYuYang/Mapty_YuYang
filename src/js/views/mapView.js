import * as config from './config';
import { AJAX } from '../helper';
import View from './Views';
import * as model from '../model';
import { PitchToggle } from './config';
import { MapboxGLButtonControl } from './config';
import workoutsView from './workoutsView';

class mapView extends View {
  #map = document.querySelector('#map');
  #mapData;
  #mapZoomLevel = 13;
  #parentElemet = document.querySelector('.sidebar');
  #clickCount = 0;
  #accessToken;
  #myMarker;
  #startMarker;
  #preserveMarker;
  #startMarkerPop;
  #pathData;
  #StartPositionType = document.querySelector('.form__input--route-type');
  #inputCadence = document.querySelector('.form__input--cadence');
  constructor() {
    super();
    this.markerOnClickfunctionality = this.markerOnClickfunctionality();
  }
  loadMap = async mapData => {
    this.#mapData = mapData;
    mapboxgl.accessToken =
      'pk.eyJ1IjoiamFzb25jb2Rpbmc3MjMiLCJhIjoiY2tvN2FlcmF6MW1raDJvbHJhN2ptMG01NCJ9.ZDZ7zl030QE1REiaDIYWnQ';
    this.#accessToken = mapboxgl.accessToken;
    this.#map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/jasoncoding723/ckohe0oxp2n5e17nz9i4awgix',
      center: this.#mapData.currentPosition,
      zoom: this.#mapZoomLevel,
    });

    //Handle click outside map
    this.#parentElemet.addEventListener('click', async e => {
      if (model.state.edit) return;
      const form = document.querySelector('.form');
      if (
        !form.classList.contains('hidden') &&
        e.target.closest('#form') == null
      ) {
        form.classList.add('hidden');
        this.#myMarker.remove();
        this.#myMarker = undefined;
        await this.renderPath(
          this.#mapData.currentPosition,
          this.#mapData.currentPosition
        );
      }
    });

    //Handle click on Map

    this.#map.on('click', this.showForm);
    this.#map.on('load', async () => {
      // Add zoom and rotation controls to the map.
      this.#map.addControl(new mapboxgl.NavigationControl());
      this.addButtonOnMap();
      //Disable double click zoom in
      this.#map.doubleClickZoom.disable();
      // Render Marker at current position
      this.renderMarker(this.#mapData.currentPosition, 0);
      // make an initial directions request that
      // starts and ends at the same location
      await this.renderPath(
        this.#mapData.currentPosition,
        this.#mapData.currentPosition
      );
      this.#StartPositionType.addEventListener('change', this.changeFromType);
    });
  };
  addButtonOnMap = () => {
    const ctrlZoom = new MapboxGLButtonControl({
      className: 'mapbox-gl-draw_location',
      title: 'See All Markers',
      eventHandler: this.zoomToSeeAllMarker,
    });
    const ctrlDelete = new MapboxGLButtonControl({
      className: 'mapbox-gl-draw_delete',
      title: 'Delete All Markers & Workouts',
      eventHandler: workoutsView.initializeDataView,
    });
    this.#map.addControl(ctrlZoom, 'top-left');
    this.#map.addControl(ctrlDelete, 'top-left');
    this.#map.addControl(new PitchToggle({ minpitchzoom: 11 }), 'top-left');
  };
  showForm = async mapE => {
    //Prevent click before form rest
    if (model.state.sortType !== ' All') return;
    if (!model.state.edit) {
      if (this.#inputCadence.value) return;
    }
    if (this.#startMarkerPop) {
      this.#startMarkerPop.remove();
    }
    await this.showFormWithdbClick(mapE);
  };
  showFormWithdbClick = async mapE => {
    const form = document.querySelector('.form');
    let timeout = [];
    this.#clickCount++;
    if (this.#clickCount == 1) {
      timeout = setTimeout(() => {
        this.#clickCount = 0;
      }, 250);
    } else if (this.#clickCount == 2) {
      clearTimeout(timeout);
      form.classList.remove('hidden');
      // console.log(mapE.lngLat);

      // Update DestinationCoords to #mapData
      const { lng, lat } = mapE.lngLat;
      const DestinationCoords = [lng, lat];
      this.#mapData.DestinationCoords = DestinationCoords;
      this.renderMarker(this.#mapData.DestinationCoords, 2);
      if (this.#startMarker) {
        await this.renderPath(
          this.#mapData.startPositionCoords,
          this.#mapData.DestinationCoords
        );
      } else {
        await this.renderPath(
          this.#mapData.currentPosition,
          this.#mapData.DestinationCoords
        );
      }

      this.showDataOnInput();
      this.#clickCount = 0;
    }
  };
  showDataOnInput = () => {
    const inputDistance = document.querySelector('.form__input--distance');
    const inputDestinationCoords = document.querySelector('.end');
    this.#mapData.pathDistance = this.#pathData.routes[0].distance;
    inputDistance.placeholder = `${(
      this.#pathData.routes[0].distance / 1000
    ).toFixed(2)}km`;
    inputDestinationCoords.placeholder = `(${this.#mapData.pathEnd[1].toFixed(
      3
    )} , ${this.#mapData.pathStart[0].toFixed(3)})`;
  };
  editMarkerInit = workout => {
    if (this.#startMarkerPop) {
      this.#startMarkerPop.remove();
    }
    const markerObject = model.markers.find(marker => marker.id === workout.id);
    console.log(markerObject, 'marker');
    markerObject.marker.remove();
  };
  initializeMapRoute = async () => {
    await this.renderPath(
      this.#mapData.currentPosition,
      this.#mapData.currentPosition
    );
  };
  setCenterViewToCurrentPosition = async () => {
    this.#map.flyTo({
      center: [
        this.#mapData.currentPosition[0],
        this.#mapData.currentPosition[1],
      ],
      zoom: this.#mapZoomLevel,
    });

    await this.renderPath(
      this.#mapData.currentPosition,
      this.#mapData.currentPosition
    );
  };
  renderPath = async (start, end) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/cycling/${
      start[0]
    },${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${
      this.#accessToken
    }`;
    this.#pathData = await AJAX(url, 'Failed to render Path!!');
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: this.#pathData.routes[0].geometry.coordinates,
      },
    };
    // if the route already exists on the map, reset it using setData
    if (this.#map.getSource('route')) {
      this.#map.getSource('route').setData(geojson);
    } else {
      // otherwise, make a new request
      this.#map.addLayer({
        id: 'route',
        type: 'line',
        source: {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: geojson,
            },
          },
        },
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#3887be',
          'line-width': 5,
          'line-opacity': 0.75,
        },
      });
    }
    // add turn instructions here at the end
    this.#mapData.pathStart = start;
    this.#mapData.pathEnd = end;
  };

  renderMarker = async (coords, index) => {
    // Current position Icon
    if (index == 0) {
      const startIcon = document.createElement('div');
      startIcon.className = 'startIcon--in';
      new mapboxgl.Marker(startIcon).setLngLat(coords).addTo(this.#map);
    } else if (index == 1) {
      this.updateStartMarker(coords);
    } else {
      if (!this.#myMarker) {
        await this.updateMyMarker(coords);
      } else {
        this.#myMarker.remove();
        this.#myMarker = undefined;
        await this.updateMyMarker(coords);
      }
    }
  };
  updateStartMarker = async coords => {
    const startMarker = document.createElement('div');
    startMarker.className = 'startMarker';
    this.#startMarker = new mapboxgl.Marker({
      element: startMarker,
      draggable: true,
      offset: [0, -20],
    })
      .setLngLat(coords)
      .onClick(() => {
        this.#map.flyTo({
          center: [coords[0], coords[1]],
          zoom: this.#mapZoomLevel,
        });
      })
      .addTo(this.#map);
    this.#mapData.startPositionCoords = coords;
    this.#startMarker.on('dragend', async () => {
      let lngLet = this.#startMarker.getLngLat();
      this.#mapData.startPositionCoords = [lngLet.lng, lngLet.lat];
      if (model.state.edit) {
        await this.renderPath(
          this.#mapData.startPositionCoords,
          this.#mapData.pathEnd
        );
      } else {
        await this.renderPath(
          this.#mapData.startPositionCoords,
          this.#mapData.DestinationCoords
        );
      }

      this.showDataOnInput();
    });
  };
  updateMyMarker = async coords => {
    const MyIcon = document.createElement('div');
    MyIcon.className = 'myIcon';

    this.#myMarker = new mapboxgl.Marker({
      element: MyIcon,
      draggable: true,
      offset: [0, -20],
    })
      .setLngLat(coords)
      .onClick(() => {
        this.#map.flyTo({
          center: [coords[0], coords[1]],
          zoom: this.#mapZoomLevel,
        });
      })
      .addTo(this.#map);

    this.#myMarker.on('dragend', async () => {
      let lngLet = this.#myMarker.getLngLat();
      this.#mapData.DestinationCoords = [lngLet.lng, lngLet.lat];
      if (this.#StartPositionType.selectedIndex == 1) {
        await this.renderPath(
          this.#mapData.startPositionCoords,
          this.#mapData.DestinationCoords
        );
        this.showDataOnInput();
      } else {
        await this.renderPath(
          this.#mapData.currentPosition,
          this.#mapData.DestinationCoords
        );
        this.showDataOnInput();
      }
    });
  };
  preserveMarker = coords => {
    const MyIcon = document.createElement('div');
    MyIcon.className = 'myIcon';
    this.#preserveMarker = new mapboxgl.Marker({
      element: MyIcon,
      offset: [0, -20],
    })
      .setLngLat(coords)
      .onClick(() => {
        this.#map.flyTo({
          center: [coords[0], coords[1]],
          zoom: this.#mapZoomLevel,
        });
      })
      .addTo(this.#map);
  };
  removeSetUpMarker = async () => {
    if (this.#startMarker) {
      this.#startMarker.remove();
      this.#startMarker = undefined;
    }
    if (this.#myMarker) {
      this.#myMarker.remove();
      this.#myMarker = undefined;
    }

    await this.renderPath(
      this.#mapData.currentPosition,
      this.#mapData.currentPosition
    );
  };
  addpopupToMarker = (workout, index) => {
    let coords = index == 0 ? workout.startCoords : workout.endCoords;
    const StartMarkup = `<div class="${workout.type}-popup"> 
        <div>
          ${workout.type == 'running' ? '🏃‍♂️ ' : '🚴‍♀️ '}
         ${workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
          <span> on </apan>
          ${workout.time.dateNow}
        </div>
        <div class="in">${workout.locationName.startLocationIn}</div>
        <div class="street">${workout.locationName.startLocationStreet}</div>
        <div class="time"><span>Start at </span>${workout.time.timeNow}</div>
      </div>`;
    const EndMarkup = `<div class="${workout.type}-popup">
    <div>
    ${workout.type == 'running' ? '🏃‍♂️ ' : '🚴‍♀️ '}
      ${workout.type.charAt(0).toUpperCase() + workout.type.slice(1)}
      <span> on </span>
      ${workout.time.dateEnd}
    </div>
    <div class="in">${workout.locationName.endLocationIn}</div>
    <div class="street">${workout.locationName.endLocationStreet}</div>
    <div class="time"><span>Arrived at </span>${workout.time.timeEnd}</div>
    </div>`;
    let Markup = index == 0 ? StartMarkup : EndMarkup;
    let popup = new mapboxgl.Popup({
      offset: [0, -40],
      closeOnClick: false,
    })
      .setLngLat(coords)
      .setHTML(Markup)
      .addTo(this.#map);

    if (index == 1) {
      this.#preserveMarker.remove();
      const MyIcon = document.createElement('div');
      MyIcon.className = 'myIcon';
      this.#preserveMarker = new mapboxgl.Marker({
        element: MyIcon,
        offset: [0, -20],
      })
        .setLngLat(coords)
        .setPopup(popup)
        .onClick(() => {
          this.#map.flyTo({
            center: [coords[0], coords[1]],
            zoom: this.#mapZoomLevel,
          });
        })
        .addTo(this.#map);
      this.#preserveMarker.togglePopup();
      return this.#preserveMarker;
    }
    if (index == 0) {
      // this.#startMarker.remove();
      const startMarker = document.createElement('div');
      startMarker.className = 'startMarker';
      this.#startMarkerPop = new mapboxgl.Marker({
        element: startMarker,
        offset: [0, -20],
      })
        .setLngLat(coords)
        .setPopup(popup)
        .onClick(() => {
          this.#map.flyTo({
            center: [coords[0], coords[1]],
            zoom: this.#mapZoomLevel,
          });
        })
        .addTo(this.#map);
      this.#startMarkerPop.togglePopup();
    }
  };
  changeFromType = async () => {
    if (this.#StartPositionType.selectedIndex == 1) {
      this.renderMarker(this.#mapData.currentPosition, 1);
    } else {
      this.#startMarker.remove();
      this.#startMarker = undefined;
      delete this.#mapData.startPositionCoords;
      await this.renderPath(
        this.#mapData.currentPosition,
        this.#mapData.DestinationCoords
      );
      this.showDataOnInput();
    }
  };
  moveToPopRoute = async (e, workouts) => {
    if (!this.#map) return;
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    if (model.state.edit) return;
    const workout = workouts.find(work => work.id === workoutEl.dataset.id);
    let bound = [workout.startCoords, workout.endCoords];
    if (this.#startMarkerPop) {
      this.#startMarkerPop.remove();
    }
    this.addpopupToMarker(workout, 0);
    await this.renderPath(workout.startCoords, workout.endCoords);

    this.#map.fitBounds(bound, {
      padding: { top: 150, bottom: 25, left: 125, right: 125 },
    });
  };
  zoomToSeeAllMarker = () => {
    if (model.state.edit) return;
    if (model.workouts.length <= 1) return;
    let allCoords = model.workouts.map(workout => {
      return workout.endCoords;
    });
    let turf = require('@turf/turf');
    let line = turf.lineString(allCoords);
    let bbox = turf.bbox(line);
    this.#map.fitBounds(bbox, {
      padding: { top: 150, bottom: 25, left: 125, right: 125 },
    });
  };

  markerOnClickfunctionality() {
    // Override internal functionality
    mapboxgl.Marker.prototype.onClick = function (handleClick) {
      this._handleClick = handleClick;
      return this;
    };
    mapboxgl.Marker.prototype._onMapClick = function (t) {
      const targetElement = t.originalEvent.target;
      const element = this._element;
      if (
        this._handleClick &&
        (targetElement === element || element.contains(targetElement))
      ) {
        this.togglePopup();
        this._handleClick();
      }
    };
    // Give credit to : https://github.com/mapbox/mapbox-gl-js/issues/7793
  }
}

export default new mapView();
