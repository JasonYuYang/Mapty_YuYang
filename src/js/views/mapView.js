import * as config from './config';
import { AJAX } from '../helper';
import View from './Views';
import * as model from '../model';
import { PitchToggle } from './config';
import { MapboxGLButtonControl } from './config';
import workoutsView from './workoutsView';

class mapView extends View {
  _map = document.querySelector('#map');
  _mapData;
  _mapZoomLevel = 13;
  _parentElemet = document.querySelector('.sidebar');
  _clickCount = 0;
  _accessToken;
  _myMarker;
  _startMarker;
  _preserveMarker;
  _preserveMarkerInMemory;
  _startMarkerPop;
  _pathData;
  _StartPositionType = document.querySelector('.form__input--route-type');
  _inputCadence = document.querySelector('.form__input--cadence');
  constructor() {
    super();
    this.markerOnClickfunctionality = this.markerOnClickfunctionality();
  }
  loadMap = async mapData => {
    this._mapData = mapData;
    mapboxgl.accessToken =
      'pk.eyJ1IjoiamFzb25jb2Rpbmc3MjMiLCJhIjoiY2tvN2FlcmF6MW1raDJvbHJhN2ptMG01NCJ9.ZDZ7zl030QE1REiaDIYWnQ';
    this._accessToken = mapboxgl.accessToken;
    this._map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/jasoncoding723/ckohe0oxp2n5e17nz9i4awgix',
      center: this._mapData.currentPosition,
      zoom: this._mapZoomLevel,
    });

    //Handle click outside map
    this._parentElemet.addEventListener('click', async e => {
      if (model.state.edit) return;
      const form = document.querySelector('.form');
      if (
        !form.classList.contains('hidden') &&
        e.target.closest('#form') == null
      ) {
        form.classList.add('hidden');
        this._myMarker.remove();
        this._myMarker = undefined;
        await this.renderPath(
          this._mapData.currentPosition,
          this._mapData.currentPosition
        );
      }
    });

    //Handle click on Map

    this._map.on('click', this.showForm);
    this._map.on('load', async () => {
      // Add zoom and rotation controls to the map.
      this._map.addControl(new mapboxgl.NavigationControl());
      this.addButtonOnMap();
      //Disable double click zoom in
      this._map.doubleClickZoom.disable();
      // Render Marker at current position
      this.renderMarker(this._mapData.currentPosition, 0);
      // make an initial directions request that
      // starts and ends at the same location
      await this.renderPath(
        this._mapData.currentPosition,
        this._mapData.currentPosition
      );
      this._StartPositionType.addEventListener('change', this.changeFromType);
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
    this._map.addControl(ctrlZoom, 'top-left');
    this._map.addControl(ctrlDelete, 'top-left');
    this._map.addControl(new PitchToggle({ minpitchzoom: 11 }), 'top-left');
  };
  showForm = async mapE => {
    //Prevent click before form rest
    if (model.state.sortType !== ' All') return;
    if (!model.state.edit) {
      if (this._inputCadence.value) return;
    }
    if (this._startMarkerPop) {
      this._startMarkerPop.remove();
    }
    await this.showFormWithdbClick(mapE);
  };
  showFormWithdbClick = async mapE => {
    const form = document.querySelector('.form');
    let timeout = [];
    this._clickCount++;
    if (this._clickCount == 1) {
      timeout = setTimeout(() => {
        this._clickCount = 0;
      }, 250);
    } else if (this._clickCount == 2) {
      clearTimeout(timeout);
      form.classList.remove('hidden');
      // console.log(mapE.lngLat);

      // Update DestinationCoords to _mapData
      const { lng, lat } = mapE.lngLat;
      const DestinationCoords = [lng, lat];
      this._mapData.DestinationCoords = DestinationCoords;
      this.renderMarker(this._mapData.DestinationCoords, 2);
      if (this._startMarker) {
        await this.renderPath(
          this._mapData.startPositionCoords,
          this._mapData.DestinationCoords
        );
      } else {
        await this.renderPath(
          this._mapData.currentPosition,
          this._mapData.DestinationCoords
        );
      }

      this.showDataOnInput();
      this._clickCount = 0;
    }
  };
  showDataOnInput = () => {
    const inputDistance = document.querySelector('.form__input--distance');
    const inputDestinationCoords = document.querySelector('.end');
    this._mapData.pathDistance = this._pathData.routes[0].distance;
    inputDistance.placeholder = `${(
      this._pathData.routes[0].distance / 1000
    ).toFixed(2)}km`;
    inputDestinationCoords.placeholder = `(${this._mapData.pathEnd[1].toFixed(
      3
    )} , ${this._mapData.pathStart[0].toFixed(3)})`;
  };
  editMarkerInit = workout => {
    if (this._startMarkerPop) {
      this._startMarkerPop.remove();
    }
    model.markers.find(marker => marker.id === workout.id).marker.remove();
  };
  initializeMapRoute = async () => {
    await this.renderPath(
      this._mapData.currentPosition,
      this._mapData.currentPosition
    );
  };
  setCenterViewToCurrentPosition = async () => {
    this._map.flyTo({
      center: [
        this._mapData.currentPosition[0],
        this._mapData.currentPosition[1],
      ],
      zoom: this._mapZoomLevel,
    });

    await this.renderPath(
      this._mapData.currentPosition,
      this._mapData.currentPosition
    );
  };
  renderPath = async (start, end) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${this._accessToken}`;
    this._pathData = await AJAX(url, 'Failed to render Path!!');
    const geojson = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: this._pathData.routes[0].geometry.coordinates,
      },
    };
    // if the route already exists on the map, reset it using setData
    if (this._map.getSource('route')) {
      this._map.getSource('route').setData(geojson);
    } else {
      // otherwise, make a new request
      this._map.addLayer({
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
    this._mapData.pathStart = start;
    this._mapData.pathEnd = end;
  };

  renderMarker = async (coords, index) => {
    // Current position Icon
    if (index == 0) {
      const startIcon = document.createElement('div');
      startIcon.className = 'startIcon--in';
      new mapboxgl.Marker(startIcon).setLngLat(coords).addTo(this._map);
    } else if (index == 1) {
      this.updateStartMarker(coords);
    } else {
      if (!this._myMarker) {
        await this.updateMyMarker(coords);
      } else {
        this._myMarker.remove();
        this._myMarker = undefined;
        await this.updateMyMarker(coords);
      }
    }
  };
  updateStartMarker = async coords => {
    const startMarker = document.createElement('div');
    startMarker.className = 'startMarker';
    this._startMarker = new mapboxgl.Marker({
      element: startMarker,
      draggable: true,
      offset: [0, -20],
    })
      .setLngLat(coords)
      .onClick(() => {
        this._map.flyTo({
          center: [coords[0], coords[1]],
          zoom: this._mapZoomLevel,
        });
      })
      .addTo(this._map);
    this._mapData.startPositionCoords = coords;
    this._startMarker.on('dragend', async () => {
      let lngLet = this._startMarker.getLngLat();
      this._mapData.startPositionCoords = [lngLet.lng, lngLet.lat];
      if (model.state.edit) {
        await this.renderPath(
          this._mapData.startPositionCoords,
          this._mapData.pathEnd
        );
      } else {
        await this.renderPath(
          this._mapData.startPositionCoords,
          this._mapData.DestinationCoords
        );
      }

      this.showDataOnInput();
    });
  };
  updateMyMarker = async coords => {
    const MyIcon = document.createElement('div');
    MyIcon.className = 'myIcon';

    this._myMarker = new mapboxgl.Marker({
      element: MyIcon,
      draggable: true,
      offset: [0, -20],
    })
      .setLngLat(coords)
      .onClick(() => {
        this._map.flyTo({
          center: [coords[0], coords[1]],
          zoom: this._mapZoomLevel,
        });
      })
      .addTo(this._map);

    this._myMarker.on('dragend', async () => {
      let lngLet = this._myMarker.getLngLat();
      this._mapData.DestinationCoords = [lngLet.lng, lngLet.lat];
      if (this._StartPositionType.selectedIndex == 1) {
        await this.renderPath(
          this._mapData.startPositionCoords,
          this._mapData.DestinationCoords
        );
        this.showDataOnInput();
      } else {
        await this.renderPath(
          this._mapData.currentPosition,
          this._mapData.DestinationCoords
        );
        this.showDataOnInput();
      }
    });
  };
  preserveMarker = coords => {
    const MyIcon = document.createElement('div');
    MyIcon.className = 'myIcon';
    this._preserveMarker = new mapboxgl.Marker({
      element: MyIcon,
      offset: [0, -20],
    })
      .setLngLat(coords)
      .onClick(() => {
        this._map.flyTo({
          center: [coords[0], coords[1]],
          zoom: this._mapZoomLevel,
        });
      })
      .addTo(this._map);
  };
  removeSetUpMarker = async () => {
    if (this._startMarker) {
      this._startMarker.remove();
      this._startMarker = undefined;
    }
    if (this._myMarker) {
      this._myMarker.remove();
      this._myMarker = undefined;
    }

    await this.renderPath(
      this._mapData.currentPosition,
      this._mapData.currentPosition
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
      .addTo(this._map);

    if (index == 1) {
      if (this._preserveMarker) this._preserveMarker.remove();
      const MyIcon = document.createElement('div');
      MyIcon.className = 'myIcon';
      this._preserveMarkerInMemory = new mapboxgl.Marker({
        element: MyIcon,
        offset: [0, -20],
      })
        .setLngLat(coords)
        .setPopup(popup)
        .onClick(() => {
          this._map.flyTo({
            center: [coords[0], coords[1]],
            zoom: this._mapZoomLevel,
          });
        })
        .addTo(this._map);
      this._preserveMarkerInMemory.togglePopup();
      return this._preserveMarkerInMemory;
    }
    if (index == 0) {
      // this._startMarker.remove();
      const startMarker = document.createElement('div');
      startMarker.className = 'startMarker';
      this._startMarkerPop = new mapboxgl.Marker({
        element: startMarker,
        offset: [0, -20],
      })
        .setLngLat(coords)
        .setPopup(popup)
        .onClick(() => {
          this._map.flyTo({
            center: [coords[0], coords[1]],
            zoom: this._mapZoomLevel,
          });
        })
        .addTo(this._map);
      this._startMarkerPop.togglePopup();
    }
  };
  changeFromType = async () => {
    if (this._StartPositionType.selectedIndex == 1) {
      this.renderMarker(this._mapData.currentPosition, 1);
    } else {
      this._startMarker.remove();
      this._startMarker = undefined;
      delete this._mapData.startPositionCoords;
      await this.renderPath(
        this._mapData.currentPosition,
        this._mapData.DestinationCoords
      );
      this.showDataOnInput();
    }
  };
  moveToPopRoute = async (e, workouts) => {
    if (!this._map) return;
    const workoutEl = e.target.closest('.workout');
    if (!workoutEl) return;
    if (model.state.edit) return;
    const workout = workouts.find(work => work.id === workoutEl.dataset.id);
    let bound = [workout.startCoords, workout.endCoords];
    if (this._startMarkerPop) {
      this._startMarkerPop.remove();
    }
    this.addpopupToMarker(workout, 0);
    await this.renderPath(workout.startCoords, workout.endCoords);

    this._map.fitBounds(bound, {
      padding: { top: 150, bottom: 25, left: 125, right: 125 },
    });
  };
  zoomToSeeAllMarker = async () => {
    if (model.state.edit) return;
    if (model.workouts.length <= 1) return;
    let allCoords = model.workouts.map(workout => {
      return workout.endCoords;
    });
    let turf = require('@turf/turf');
    let line = turf.lineString(allCoords);
    let bbox = turf.bbox(line);
    this._map.fitBounds(bbox, {
      padding: { top: 150, bottom: 25, left: 125, right: 125 },
    });
    if (this._startMarkerPop) {
      this._startMarkerPop.remove();
    }
    await this.removeSetUpMarker();
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
