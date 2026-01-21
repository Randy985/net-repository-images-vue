import axios from "axios";

let _getToken: () => string = () => "";
let _setToken: (token: string) => void = () => { };

export const bindAccessToken = (getter: () => string, setter: (token: string) => void) => {
  _getToken = getter;
  _setToken = setter;
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  timeout: 20000,
});


api.interceptors.request.use((config) => {
  const token = _getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh")
    ) {

      originalRequest._retry = true;
      try {
        const { data } = await api.post("/auth/refresh");

        _setToken(data.accessToken);

        return api(originalRequest);
      } catch (err) {
        _setToken("");
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
