import { configureStore } from '@reduxjs/toolkit';
import tetrisReducer from './tetrisSlice';
import multiplayerReducer from './multiplayerSlice';

export const store = configureStore({
    reducer: {
        tetris: tetrisReducer,
        multiplayer: multiplayerReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
