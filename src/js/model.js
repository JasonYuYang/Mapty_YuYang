import { async } from 'regenerator-runtime';
export const state = { map: {} };

export const getPosition = async () => {
  return new Promise((resolve, reject) => {
    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
          const { latitude, longitude } = position.coords;
          const coords = [latitude, longitude];
          state.map.currentPosition = coords;
          resolve(coords);
        });
      }
    } catch (err) {
      console.err(err);
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
