import logoIcon from 'url:../../img/marker.png';
import * as config from './config';
import { AJAX } from '../helper';

class mapView {
  #map = document.querySelector('#map');
  #mapData;
  #mapZoomLevel = 13;
  #clickCount = 0;

  #accessToken;

  loadMap(mapData) {
    this.#mapData = mapData;
    mapboxgl.accessToken =
      'pk.eyJ1IjoiamFzb25jb2Rpbmc3MjMiLCJhIjoiY2tvN2FlcmF6MW1raDJvbHJhN2ptMG01NCJ9.ZDZ7zl030QE1REiaDIYWnQ';
    this.#accessToken = mapboxgl.accessToken;
    this.#map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: this.#mapData.currentPosition,
      zoom: this.#mapZoomLevel,
    });
    // Add zoom and rotation controls to the map.
    this.#map.addControl(new mapboxgl.NavigationControl());
    //Disable double click zoom in
    this.#map.doubleClickZoom.disable();
    // Render Marker at current position
    this.renderMarker(this.#mapData.currentPosition);
    //Handle click on Map
    this.#map.on('click', this.showForm);
  }

  showForm = async mapE => {
    const form = document.querySelector('.form');
    //Handling double click on Map

    let timeout = [];
    this.#clickCount++;
    if (this.#clickCount == 1) {
      timeout = setTimeout(() => {
        this.#clickCount = 0;
      }, 250);
    } else if (this.#clickCount == 2) {
      clearTimeout(timeout);

      form.classList.remove('hidden');
      console.log('dbclick');
      console.log(mapE.lngLat);
      // Update DestinationCoords to #mapData
      const { lng, lat } = mapE.lngLat;
      const DestinationCoords = [lng, lat];
      this.#mapData.DestinationCoords = DestinationCoords;
      this.renderMarker(this.#mapData.DestinationCoords);
      this.renderPath(
        this.#mapData.currentPosition,
        this.#mapData.DestinationCoords
      );
      this.#clickCount = 0;
    }
  };
  renderPath = (start, end) => {
    const url = `https://api.mapbox.com/directions/v5/mapbox/cycling/${
      start[0]
    },${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${
      this.#accessToken
    }`;
    // make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.onload = () => {
      var json = JSON.parse(req.response);
      var data = json.routes[0];
      var route = data.geometry.coordinates;
      var geojson = {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: route,
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
    req.send();
  };

  renderMarker = coords => {
    // Set options
    const startIcon = document.createElement('div');
    startIcon.className = 'startIcon--in';
    new mapboxgl.Marker(startIcon).setLngLat(coords).addTo(this.#map);
  };
}

export default new mapView();
