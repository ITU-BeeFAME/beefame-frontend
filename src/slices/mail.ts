import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';

import type { Email, Label } from 'src/types/mail';
import { objFromArray } from 'src/utils/obj-from-array';

interface MailState {
  emails: {
    byId: Record<string, Email>;
    allIds: string[];
  };
  labels: Label[];
}

type GetLabelsAction = PayloadAction<Label[]>;

type GetEmailsAction = PayloadAction<Email[]>;

type GetEmailAction = PayloadAction<Email>;

const initialState: MailState = {
  emails: {
    byId: {},
    allIds: [],
  },
  labels: [],
};

const reducers = {
  getLabels(state: MailState, action: GetLabelsAction): void {
    state.labels = action.payload;
  },
  getEmails(state: MailState, action: GetEmailsAction): void {
    const emails = action.payload;

    state.emails.byId = objFromArray(emails);
    state.emails.allIds = Object.keys(state.emails.byId);
  },
  getEmail(state: MailState, action: GetEmailAction): void {
    const email = action.payload;

    state.emails.byId[email.id] = email;

    if (!state.emails.allIds.includes(email.id)) {
      state.emails.allIds.push(email.id);
    }
  },
};

export const slice = createSlice({
  name: 'mail',
  initialState,
  reducers,
});

export const { reducer } = slice;
