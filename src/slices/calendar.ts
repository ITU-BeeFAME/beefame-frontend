import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { CalendarEvent } from 'src/types/calendar';

interface CalendarState {
  events: CalendarEvent[];
}

type GetEventsAction = PayloadAction<CalendarEvent[]>;

type CreateEventAction = PayloadAction<CalendarEvent>;

type UpdateEventAction = PayloadAction<CalendarEvent>;

type DeleteEventAction = PayloadAction<string>;

const initialState: CalendarState = {
  events: [],
};

const reducers = {
  getEvents(state: CalendarState, action: GetEventsAction): void {
    state.events = action.payload;
  },
  createEvent(state: CalendarState, action: CreateEventAction): void {
    state.events.push(action.payload);
  },
  updateEvent(state: CalendarState, action: UpdateEventAction): void {
    const event = action.payload;

    state.events = state.events.map((_event) => {
      if (_event.id === event.id) {
        return event;
      }

      return _event;
    });
  },
  deleteEvent(state: CalendarState, action: DeleteEventAction): void {
    state.events = state.events.filter((event) => event.id !== action.payload);
  },
};

export const slice = createSlice({
  name: 'calendar',
  initialState,
  reducers,
});

export const { reducer } = slice;
