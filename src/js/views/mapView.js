import * as config from './config';
import { AJAX } from '../helper';
import View from './Views';

class mapView extends View {
  #map = document.querySelector('#map');
  #mapData;
  #mapZoomLevel = 13;
  #clickCount = 0;
  #accessToken;
  #myMarker;
  #startMarker;
  #pathData;
  #StartPositionType = document.querySelector('.form__input--route-type');

  loadMap = async mapData => {
    this.#mapData = mapData;
    mapboxgl.accessToken =
      'pk.eyJ1IjoiamFzb25jb2Rpbmc3MjMiLCJhIjoiY2tvN2FlcmF6MW1raDJvbHJhN2ptMG01NCJ9.ZDZ7zl030QE1REiaDIYWnQ';
    this.#accessToken = mapboxgl.accessToken;
    this.renderLoadingSpinner(this.#map);
    this.#map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.#mapData.currentPosition,
      zoom: this.#mapZoomLevel,
    });

    //Handle click on Map
    this.#map.on('click', this.showForm);
    this.#map.on('load', async () => {
      // Add zoom and rotation controls to the map.
      this.#map.addControl(new mapboxgl.NavigationControl());
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
      this.#StartPositionType.addEventListener('change', async () => {
        if (this.#StartPositionType.selectedIndex == 1) {
          this.renderMarker(this.#mapData.currentPosition, 1);
        } else {
          this.#startMarker.remove();
          await this.renderPath(
            this.#mapData.currentPosition,
            this.#mapData.DestinationCoords
          );
          this.showDataOnInput();
        }
      });
    });
  };

  showForm = async mapE => {
    //Handling double click on Map
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
      await this.renderPath(
        this.#mapData.currentPosition,
        this.#mapData.DestinationCoords
      );
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
    inputDestinationCoords.placeholder = `(${this.#mapData.DestinationCoords[1].toFixed(
      3
    )} , ${this.#mapData.DestinationCoords[0].toFixed(3)})`;
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
  };

  renderMarker = (coords, index) => {
    // Current position Icon
    if (index == 0) {
      const startIcon = document.createElement('div');
      startIcon.className = 'startIcon--in';
      new mapboxgl.Marker(startIcon).setLngLat(coords).addTo(this.#map);
    } else if (index == 1) {
      this.updateStartMarker(coords);
    } else {
      if (!this.#myMarker) {
        this.updateMyMarker(coords);
      } else {
        this.#myMarker.remove();
        this.updateMyMarker(coords);
      }
    }
  };
  updateStartMarker = coords => {
    const startMarker = document.createElement('div');
    startMarker.className = 'startMarker';
    this.#startMarker = new mapboxgl.Marker({
      element: startMarker,
      draggable: true,
      offset: [0, -20],
    })
      .setLngLat(coords)
      .addTo(this.#map);
    this.#startMarker.on('dragend', async () => {
      let lngLet = this.#startMarker.getLngLat();
      this.#mapData.startPositionCoords = [lngLet.lng, lngLet.lat];
      await this.renderPath(
        this.#mapData.startPositionCoords,
        this.#mapData.DestinationCoords
      );
      this.showDataOnInput();
    });
  };
  updateMyMarker = coords => {
    const MyIcon = document.createElement('div');
    MyIcon.className = 'myIcon';

    this.#myMarker = new mapboxgl.Marker({
      element: MyIcon,
      draggable: true,
      offset: [0, -20],
    })
      .setLngLat(coords)
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
  SubmitMapData = () => {
    return this.#mapData;
  };
}

export default new mapView();
