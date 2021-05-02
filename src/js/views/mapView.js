import logoIcon from 'url:../../img/marker.png';
import * as config from './config';

class mapView {
  #map = document.querySelector('#map');
  #mapData;
  #mapZoomLevel = 13;
  #clickCount = 0;

  loadMap(mapData) {
    this.#mapData = mapData;
    this.#map = L.map('map').setView(
      this.#mapData.currentPosition,
      this.#mapZoomLevel
    );
    // L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
    //   attribution:
    //     '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    // }).addTo(this.#map);

    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Render Marker at current position
    // this.renderMarker(0, this.#mapData.currentPosition);
    //Handle click on Map
    this.#map.on('click', this.showForm);
  }

  showForm = async mapE => {
    const form = document.querySelector('.form');
    //Handling double click on Map
    let timeout;
    this.#clickCount++;
    if (this.#clickCount == 1) {
      timeout = setTimeout(() => {
        this.#clickCount = 0;
      }, 250);
    } else if (this.#clickCount == 2) {
      clearTimeout(timeout);
      form.classList.remove('hidden');
      //Update DestinationCoords to #mapData
      const { lat, lng } = mapE.latlng;
      const DestinationCoords = [lat, lng];
      this.#mapData.DestinationCoords = DestinationCoords;
      // this.renderMarker(this.#mapData.DestinationCoords, 1);
      this.renderPath(this.#mapData);
      this.#clickCount = 0;
    }
  };
  renderPath = data => {
    const routeControl = L.Routing.control({
      waypoints: [
        L.latLng(data.currentPosition[0], data.currentPosition[1]),
        L.latLng(data.DestinationCoords[0], data.DestinationCoords[1]),
      ],
      // createMarker: function (index, waypoint, n) {
      //   console.log(index, waypoint, n);
      //   let selectedMarker = null;
      //   if (index == 0) {
      //     selectedMarker = config.startIcon;
      //   } else if (index == n - 1) {
      //     selectedMarker = config.myIcon;
      //   }

      //   const customMarker = L.marker(waypoint.laLng, {
      //     icon: selectedMarker,
      //     opacity: 0.8,
      //   });

      //   return customMarker;
      // },
    });

    routeControl.on('routesfound', function (e) {
      let routes = e.routes;
      let summary = routes[0].summary;
      // alert distance and time in km and minutes
      alert(
        'Total distance is ' +
          summary.totalDistance / 1000 +
          ' km and total time is ' +
          Math.round((summary.totalTime % 3600) / 60) +
          ' minutes'
      );
    });
  };
  // renderMarker = (index, waypoint, n) => {
  //   let selectedMarker = null;
  //   const myIconOption = {
  //     iconUrl: logoIcon,
  //     iconSize: [29, 43],
  //     iconAnchor: [14.5, 43],
  //     popupAnchor: [0, -43],
  //   };
  //   this.#myIcon = L.icon(myIconOption);
  //   this.#startIcon = L.divIcon(config.startIconOption);
  //   if (index == 0) {
  //     selectedMarker = this.#startIcon;
  //   } else if (index == n - 1) {
  //     selectedMarker = this.#myIcon;
  //   }

  //   let customMarker = L.marker(waypoint.laLng, {
  //     icon: selectedMarker,
  //     opacity: 0.8,
  //   })
  //     .addTo(this.#map)
  //     .bindPopup(
  //       L.popup({
  //         maxWidth: 250,
  //         minWidth: 100,
  //         autoClose: false,
  //         closeOnClick: false,
  //       })
  //     )
  //     .setPopupContent(`Your Position`)
  //     .openPopup();

  //   return customMarker;
  // };
}

export default new mapView();
