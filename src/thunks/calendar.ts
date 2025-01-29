import { calendarApi } from 'src/api/calendar';
import { slice } from 'src/slices/calendar';
import type { AppThunk } from 'src/store';

const getEvents =
  (): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await calendarApi.getEvents();

    dispatch(slice.actions.getEvents(response));
  };

type CreateEventParams = {
  allDay: boolean;
  description: string;
  end: number;
  start: number;
  title: string;
};

const createEvent =
  (params: CreateEventParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await calendarApi.createEvent(params);

    dispatch(slice.actions.createEvent(response));
  };

type UpdateEventParams = {
  eventId: string;
  update: {
    allDay?: boolean;
    description?: string;
    end?: number;
    start?: number;
    title?: string;
  };
};

const updateEvent =
  (params: UpdateEventParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await calendarApi.updateEvent(params);

    dispatch(slice.actions.updateEvent(response));
  };

type DeleteEventParams = {
  eventId: string;
};

const deleteEvent =
  (params: DeleteEventParams): AppThunk =>
  async (dispatch): Promise<void> => {
    await calendarApi.deleteEvent(params);

    dispatch(slice.actions.deleteEvent(params.eventId));
  };

export const thunks = {
  createEvent,
  deleteEvent,
  getEvents,
  updateEvent,
};
