// import logoIcon from 'url:../../img/marker.png';

export const startIcon = L.divIcon({
  html: '<div></div>',
  className: 'startIcon--in',
  iconSize: [15, 15],
  iconAnchor: [7.5, 15],
  popupAnchor: [7.5, -15],
});
export const myIcon = L.icon({
  iconUrl: '/Map_rebuilded/src/img/marker.png',
  iconSize: [29, 43],
  iconAnchor: [14.5, 43],
  popupAnchor: [0, -43],
});
