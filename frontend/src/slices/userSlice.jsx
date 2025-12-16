import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AxiosInstance from "../components/AxiosInstance";

// Получаем всех пользователей (для админа)
export const fetchUsers = createAsyncThunk(
  "user/fetchUsers",
  async (_, { rejectWithValue }) => {
    try {
      const res = await AxiosInstance.get("users/");
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data);
    }
  }
);

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
  async (userId, { rejectWithValue }) => {
    try {
      const url = userId ? `files/?user_id=${userId}` : "files/";
      const res = await AxiosInstance.get(url);
      return { userId, files: res.data };
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

const userSlice = createSlice({
  name: "user",
  initialState: {
    currentUser: null,
    users: [],
    loading: false,
    authChecked: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    const updateFileInUsers = (state, updatedFile) => {
      state.users.forEach((user) => {
        const idx = user.files.findIndex((f) => f.id === updatedFile.id);
        if (idx !== -1) {
          user.files[idx] = updatedFile;
        }
      });
    };
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.map((u) => ({
          ...u,
          files: u.files ?? [],
        }));
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

        const user = {
          ...action.payload,
          files: action.payload.files ?? [],
        };

        state.currentUser = user.id;

        const exists = state.users.find((u) => u.id === user.id);
        if (!exists) {
          state.users.push(user);
        }
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
      .addCase(fetchUserFiles.fulfilled, (state, action) => {
        const { userId, files } = action.payload;

        // если это текущий пользователь
        if (!userId || state.currentUser?.id === userId) {
          state.currentUser.files = files;
        }

        // если это пользователь из списка (админ)
        const user = state.users.find((u) => u.id === userId);
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
      .addCase(renameFile.fulfilled, (state, action) => {
        updateFileInUsers(state, action.payload);
      })

      .addCase(updateFileComment.fulfilled, (state, action) => {
        updateFileInUsers(state, action.payload);
      })
      
  },
});

export default userSlice.reducer;
export const selectCurrentUser = (state) =>
  state.user.users.find((u) => u.id === state.user.currentUser);

export const selectUserFiles = (state, userId) => {
  if (!userId) return state.user.currentUser?.files || [];
  const user = state.user.users.find((u) => u.id === userId);
  return user?.files || [];
};