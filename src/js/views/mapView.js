import logoIcon from 'url:../../img/marker.png';
class mapView {
  #map;
  #mapData;
  #mapZoomLevel = 13;
  #myIcon;
  #markerOptions;

  render(mapData) {
    this.#mapData = mapData;
    this.#map = L.map('map').setView(
      [25.0132304, 121.3957876],
      this.#mapZoomLevel
    );
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);
    //Appear Marker at current position
    this.renderMarker([25.0132304, 121.3957876]);
    //Handling click on Map
  }
  renderMarker(coords) {
    this.#myIcon = L.icon({
      iconUrl: logoIcon,
      iconSize: [29, 43],
      iconAnchor: [14.5, 43],
      popupAnchor: [-7.5, -92],
    });
    this.#markerOptions = { icon: this.#myIcon, opacity: 0.8 };

    L.marker(coords, this.#markerOptions)
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
  }
}

export default new mapView();
