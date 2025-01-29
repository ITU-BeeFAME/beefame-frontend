import { kanbanApi } from 'src/api/kanban';
import { slice } from 'src/slices/kanban';
import type { AppThunk } from 'src/store';

const getBoard =
  (): AppThunk =>
  async (dispatch): Promise<void> => {
    const data = await kanbanApi.getBoard();

    dispatch(slice.actions.getBoard(data));
  };

type CreateColumnParams = {
  name: string;
};

const createColumn =
  (params: CreateColumnParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.createColumn(params);

    dispatch(slice.actions.createColumn(response));
  };

type UpdateColumnParams = {
  columnId: string;
  update: {
    name: string;
  };
};

const updateColumn =
  (params: UpdateColumnParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.updateColumn(params);

    dispatch(slice.actions.updateColumn(response));
  };

type ClearColumnParams = {
  columnId: string;
};

const clearColumn =
  (params: ClearColumnParams): AppThunk =>
  async (dispatch): Promise<void> => {
    await kanbanApi.clearColumn(params);

    dispatch(slice.actions.clearColumn(params.columnId));
  };

type DeleteColumnParams = {
  columnId: string;
};

const deleteColumn =
  (params: DeleteColumnParams): AppThunk =>
  async (dispatch): Promise<void> => {
    await kanbanApi.deleteColumn(params);

    dispatch(slice.actions.deleteColumn(params.columnId));
  };

type CreateTaskParams = {
  columnId: string;
  name: string;
};

const createTask =
  (params: CreateTaskParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.createTask(params);

    dispatch(slice.actions.createTask(response));
  };

type UpdateTaskParams = {
  taskId: string;
  update: {
    name?: string;
    description?: string;
    isSubscribed?: boolean;
    labels?: string[];
  };
};

const updateTask =
  (params: UpdateTaskParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.updateTask(params);

    dispatch(slice.actions.updateTask(response));
  };

type MoveTaskParams = {
  taskId: string;
  position: number;
  columnId?: string;
};

const moveTask =
  (params: MoveTaskParams): AppThunk =>
  async (dispatch): Promise<void> => {
    await kanbanApi.moveTask(params);

    dispatch(slice.actions.moveTask(params));
  };

type DeleteTaskParams = {
  taskId: string;
};

const deleteTask =
  (params: DeleteTaskParams): AppThunk =>
  async (dispatch): Promise<void> => {
    await kanbanApi.deleteTask(params);

    dispatch(slice.actions.deleteTask(params.taskId));
  };

type AddCommentParams = {
  taskId: string;
  message: string;
};

const addComment =
  (params: AddCommentParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.addComment(params);

    dispatch(
      slice.actions.addComment({
        taskId: params.taskId,
        comment: response,
      })
    );
  };

type AddCheckListParams = {
  taskId: string;
  name: string;
};

const addChecklist =
  (params: AddCheckListParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.addChecklist(params);

    dispatch(
      slice.actions.addChecklist({
        taskId: params.taskId,
        checklist: response,
      })
    );
  };

type UpdateChecklistParams = {
  taskId: string;
  checklistId: string;
  update: { name: string };
};

const updateChecklist =
  (params: UpdateChecklistParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.updateChecklist(params);

    dispatch(
      slice.actions.updateChecklist({
        taskId: params.taskId,
        checklist: response,
      })
    );
  };

type DeleteChecklistParams = {
  taskId: string;
  checklistId: string;
};

const deleteChecklist =
  (params: DeleteChecklistParams): AppThunk =>
  async (dispatch): Promise<void> => {
    await kanbanApi.deleteChecklist(params);

    dispatch(slice.actions.deleteChecklist(params));
  };

type AddCheckItemParams = {
  taskId: string;
  checklistId: string;
  name: string;
};

const addCheckItem =
  (params: AddCheckItemParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.addCheckItem(params);

    dispatch(
      slice.actions.addCheckItem({
        taskId: params.taskId,
        checklistId: params.checklistId,
        checkItem: response,
      })
    );
  };

type UpdateCheckItemParams = {
  taskId: string;
  checklistId: string;
  checkItemId: string;
  update: {
    name?: string;
    state?: 'complete' | 'incomplete';
  };
};

const updateCheckItem =
  (params: UpdateCheckItemParams): AppThunk =>
  async (dispatch): Promise<void> => {
    const response = await kanbanApi.updateCheckItem(params);

    dispatch(
      slice.actions.updateCheckItem({
        taskId: params.taskId,
        checklistId: params.checklistId,
        checkItem: response,
      })
    );
  };

type DeleteCheckItemParams = {
  taskId: string;
  checklistId: string;
  checkItemId: string;
};

const deleteCheckItem =
  (params: DeleteCheckItemParams): AppThunk =>
  async (dispatch): Promise<void> => {
    await kanbanApi.deleteCheckItem(params);

    dispatch(slice.actions.deleteCheckItem(params));
  };

export const thunks = {
  addCheckItem,
  addChecklist,
  addComment,
  clearColumn,
  createColumn,
  createTask,
  deleteCheckItem,
  deleteChecklist,
  deleteColumn,
  deleteTask,
  getBoard,
  moveTask,
  updateCheckItem,
  updateChecklist,
  updateColumn,
  updateTask,
};
