import { mailApi } from 'src/api/mail';
import { slice } from 'src/slices/mail';
import type { AppThunk } from 'src/store';

const getLabels =
  (): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await mailApi.getLabels();

    dispatch(slice.actions.getLabels(response));
  };

type GetEmailsParams = {
  label?: string;
};

const getEmails =
  (params: GetEmailsParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await mailApi.getEmails(params);

    dispatch(slice.actions.getEmails(response));
  };

type GetEmailParams = {
  emailId: string;
};

const getEmail =
  (params: GetEmailParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await mailApi.getEmail(params);

    dispatch(slice.actions.getEmail(response));
  };

export const thunks = {
  getEmail,
  getEmails,
  getLabels,
};
