 

let _store = null;

export const setStoreRef = (store) => {
  _store = store;
};

export const getStoreRef = () => _store;
