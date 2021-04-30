// import logoIcon from 'url:../../img/marker.png';
import * as config from './config';

class mapView {
  #map;
  #mapData;
  #mapZoomLevel = 13;
  #myIcon;
  #startIcon;
  #clickCount = 0;

  render(mapData) {
    this.#mapData = mapData;
    console.log(this.#mapData.currentPosition);
    this.#map = L.map('map').setView(
      this.#mapData.currentPosition,
      this.#mapZoomLevel
    );
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    //Render Marker at current position
    this.renderMarker(this.#mapData.currentPosition);
    //Handle click on Map
    this.#map.on('dbclick', this.showForm);
  }
  showForm = mapE => {
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
      console.log(mapE);
      this.#clickCount = 0;
    }

    // map.addEventListener('dbclick', mapE => {
    //   console.log(mapE);
    //
    // });
  };

  renderMarker = coords => {
    this.#myIcon = L.icon(config.myIconOption);
    this.#startIcon = L.divIcon(config.startIconOption);

    L.marker(coords, { icon: this.#startIcon, opacity: 0.8 })
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
        })
      )
      .setPopupContent(`Your Position`)
      .openPopup();
  };
}

export default new mapView();
