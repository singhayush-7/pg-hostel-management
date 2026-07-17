import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import roomReducer from './slices/roomSlice';
import joinRequestReducer from './slices/joinRequestSlice';
import complaintReducer from './slices/complaintSlice';
import dashboardReducer from './slices/dashboardSlice';
import taskReducer from './slices/taskSlice';
import paymentReducer from './slices/paymentSlice';
import checkoutReducer from './slices/checkoutSlice';
import { setStoreRef } from './storeRef';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    room: roomReducer,
    joinRequest: joinRequestReducer,
    complaint: complaintReducer,
    dashboard: dashboardReducer,
    tasks: taskReducer,
    payment: paymentReducer,
    checkout: checkoutReducer,
  },
  devTools: import.meta.env.DEV,
});

 
setStoreRef(store);
