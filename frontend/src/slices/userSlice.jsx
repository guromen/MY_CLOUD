import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AxiosInstance from "../components/AxiosInstance";

// Получаем текущего пользователя
export const fetchCurrentUser = createAsyncThunk(
  "user/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const res = await AxiosInstance.get("users/me/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Получаем всех пользователей (для админа)
export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async ({ page = 1 } = {}, { rejectWithValue }) => {
    try {
      const res = await AxiosInstance.get("users/", {
        params: { page },
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Удаляем пользователя
export const deleteUser = createAsyncThunk(
  "user/deleteUser",
  async (id, { rejectWithValue }) => {
    try {
      await AxiosInstance.delete(`users/${id}/`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

// Переключаем admin
export const toggleAdmin = createAsyncThunk(
  "user/toggleAdmin",
  async (user, { rejectWithValue }) => {
    try {
      const res = await AxiosInstance.patch(`users/${user.id}/`, {
        is_admin: !user.is_admin,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);
//получение файлов
export const fetchUserFiles = createAsyncThunk(
  "user/fetchUserFiles",
  async ({ userId, page = 1 }, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      params.append("page", page);
      if (userId) params.append("user_id", userId);

      const res = await AxiosInstance.get(`files/?${params.toString()}`);

      return {
        userId,
        files: res.data.results,
        count: res.data.count,
        next: res.data.next,
        previous: res.data.previous,
        page,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

export const uploadFile = createAsyncThunk(
  "user/uploadFile",
  async ({ userId, formData }, { rejectWithValue }) => {
    try {
      if (userId) {
        formData.append("user_id", userId);
      }

      const res = await AxiosInstance.post("files/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return { userId, file: res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);
export const deleteFile = createAsyncThunk(
  "user/deleteFile",
  async ({ userId, fileId }, { rejectWithValue }) => {
    try {
      await AxiosInstance.delete(`files/${fileId}/`);
      return { userId, fileId };
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);
export const renameFile = createAsyncThunk(
  "user/renameFile",
  async ({ fileId, newName }, { rejectWithValue }) => {
    try {
      const res = await AxiosInstance.patch(`files/${fileId}/`, {
        name: newName,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);
export const updateFileComment = createAsyncThunk(
  "user/updateFileComment",
  async ({ fileId, comment }, { rejectWithValue }) => {
    try {
      const res = await AxiosInstance.patch(`files/${fileId}/`, {
        comment,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);
export const logoutUser = createAsyncThunk(
  "user/logout",
  async (_, { rejectWithValue }) => {
    try {
      await AxiosInstance.post("/logout/");
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    users: [],
    filesPagination: {
      page: 1,
      count: 0,
      next: null,
      previous: null,
    },
    usersPagination: {
      count: 0,
      next: null,
      previous: null,
      page: 1,
    },
    filesLoading: false,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const updateFileInUsers = (state, userId, fileId, patch) => {
      if (state.currentUser?.id === userId) {
        const file = state.currentUser.files?.find(f => f.id === fileId);
        if (file) Object.assign(file, patch);
      }
      const u = state.users?.find(u => u.id === userId);
      if (u) {
        const file = u.files?.find(f => f.id === fileId);
        if (file) Object.assign(file, patch);
      }
    };
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        // оставляем currentUser без изменения
        const currentUserId = state.currentUser?.id;

        state.users = action.payload.results.map(u => ({
          ...u,
          files: u.files ?? [],
        })).filter(u => u.id !== currentUserId);

        state.usersPagination = {
          count: action.payload.count,
          next: action.payload.next,
          previous: action.payload.previous,
          page: state.usersPagination.page,
        };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
          state.loading = false;
          state.authChecked = true;
          const user = { ...action.payload, files: action.payload.files ?? [] };
          const exists = state.users.find((u) => u.id === user.id);
          if (!exists) state.users.push(user);
          state.currentUser = user;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.loading = false;
        state.currentUser = null;
        state.authChecked = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter((u) => u.id !== action.payload);
      })
      .addCase(toggleAdmin.fulfilled, (state, action) => {
        state.users = state.users.map((u) =>
          u.id === action.payload.id ? action.payload : u
        );
        if (state.currentUser?.id === action.payload.id) {
          state.currentUser = action.payload;
        }
      })
      .addCase(fetchUserFiles.pending, (state) => {
        state.filesLoading = true;
      })
      .addCase(fetchUserFiles.fulfilled, (state, action) => {
        const { userId, files, count, next, previous, page } = action.payload;
        state.filesLoading = false;

        state.filesPagination = { count, next, previous, page };

        if (!userId || state.currentUser?.id === userId) {
          state.currentUser.files = files;
        }

        const user = state.users.find(u => u.id === userId);
        if (user) {
          user.files = files;
        }
      })
      .addCase(uploadFile.fulfilled, (state, action) => {
        const { userId, file } = action.payload;

        if (!userId || state.currentUser?.id === userId) {
          state.currentUser.files.push(file);
        }

        const user = state.users.find((u) => u.id === userId);
        if (user) {
          user.files.push(file);
        }
      })
      .addCase(uploadFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Ошибка загрузки файла";
      })
      .addCase(deleteFile.fulfilled, (state, action) => {
        const { userId, fileId } = action.payload;

        if (!userId || state.currentUser?.id === userId) {
          state.currentUser.files =
            state.currentUser.files.filter((f) => f.id !== fileId);
        }

        const user = state.users.find((u) => u.id === userId);
        if (user) {
          user.files = user.files.filter((f) => f.id !== fileId);
        }
      })
      .addCase(renameFile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(renameFile.fulfilled, (state, action) => {
        const { id, name, user } = action.payload;
        updateFileInUsers(state, user, id, { name });
      })
      .addCase(renameFile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Ошибка переименования файла";
      })
      .addCase(updateFileComment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFileComment.fulfilled, (state, action) => {
        const { id, comment, user } = action.payload;
        updateFileInUsers(state, user, id, { comment });
      })
      .addCase(updateFileComment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Ошибка обновления комментария";
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.currentUser = null;
        state.users = [];
        state.filesPagination = {
          page: 1,
          count: 0,
          next: null,
          previous: null,
        };
        state.usersPagination = {
          page: 1,
          count: 0,
          next: null,
          previous: null,
        };
      });
      
  },
});

export default userSlice.reducer;

export const selectUserFiles = (state, userId) => {
  const currentUser = state.user.currentUser;

  if (!userId || currentUser?.id === userId) {
    return currentUser?.files || [];
  }

  const user = state.user.users.find((u) => u.id === userId);
  return user?.files || [];
};
export const selectCurrentUser = (state) => state.user.currentUser;