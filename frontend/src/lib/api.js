import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const ADMIN_BASE_URL =
  import.meta.env.VITE_ADMIN_BASE_URL || "http://localhost:4000/admin";
export const TOKEN_STORAGE_KEY = "stacklite_token";
export const ADMIN_TOKEN_STORAGE_KEY = "stacklite_admin_token";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const adminClient = axios.create({
  baseURL: ADMIN_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

client.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

adminClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY);
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

async function request(path, options = {}) {
  const { method = "GET", data } = options;

  try {
    const response = await client.request({
      url: path,
      method,
      data,
    });
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    const wrappedError = new Error(message);
    wrappedError.status = status;
    throw wrappedError;
  }
}

async function adminRequest(path, options = {}) {
  const { method = "GET", data } = options;

  try {
    const response = await adminClient.request({
      url: path,
      method,
      data,
    });
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    const wrappedError = new Error(message);
    wrappedError.status = status;
    throw wrappedError;
  }
}

export function registerUser(payload) {
  return request("/auth/register", { method: "POST", data: payload });
}

export function loginUser(payload) {
  return request("/auth/login", { method: "POST", data: payload });
}

export function fetchCurrentUser() {
  return request("/auth/me");
}

export function getQuestions() {
  return request("/questions");
}

export function createQuestion({ title, body }) {
  return request("/questions", {
    method: "POST",
    data: { title, body },
  });
}

export function getQuestion(id) {
  return request(`/questions/${id}`);
}

export function upvoteQuestion(id) {
  return request(`/questions/${id}/upvote`, { method: "POST" });
}

export function addAnswer(questionId, body) {
  return request(`/questions/${questionId}/answers`, {
    method: "POST",
    data: { body },
  });
}

export function upvoteAnswer(id) {
  return request(`/answers/${id}/upvote`, { method: "POST" });
}

export function adminLogin(payload) {
  return adminRequest("/login", { method: "POST", data: payload });
}

export function fetchAdminStats() {
  return adminRequest("/stats");
}

export function deleteQuestionAsAdmin(id) {
  return adminRequest(`/questions/${id}`, { method: "DELETE" });
}

export function deleteAnswerAsAdmin(id) {
  return adminRequest(`/answers/${id}`, { method: "DELETE" });
}

export function updateUserRoleAsAdmin(id, role) {
  return adminRequest(`/users/${id}/role`, {
    method: "PATCH",
    data: { role },
  });
}
