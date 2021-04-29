import { async } from 'regenerator-runtime';
export const state = { map: {} };

export const getPosition = () => {
  const currentPositionPromises = new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        const { latitude, longitude } = position.coords;
        const coords = [latitude, longitude];
        resolve(coords);
      });
    } else {
      reject(new Error('Could not get your position !!'));
    }
  });
  currentPositionPromises
    .then(position => {
      console.log(position);
      state.map.currentPosition = position;
    })
    .catch(err => {
      console.error(err);
    });
};
