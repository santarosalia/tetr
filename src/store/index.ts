import { configureStore } from '@reduxjs/toolkit';
import tetrisReducer from './tetrisSlice';

export const store = configureStore({
  reducer: {
    tetris: tetrisReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 