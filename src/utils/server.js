import axios from "axios";
import { Notify } from "quasar";

const service = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus(status) {
    return status === 200;
  },
});
service.interceptors.request.use(
  async (config) => {
    console.log(process.env.VUE_APP_API_BASE_URL);
    if (localStorage.token) {
      config.headers["token"] = localStorage.token;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);
service.interceptors.response.use(
  (config) => {
    const data = config.data;
    switch (data.err) {
      case 0:
        Notify.create({
          group: false,
          type: "positive",
          message: data.msg,
        });
        break;
      case 1:
        Notify.create({
          type: "negative",
          message: data.msg,
        });
        return Promise.reject(data.msg);
      case 2:
        // token错误
        Notify.create({
          type: "negative",
          message: data.msg,
        });
        localStorage.removeItem("token");
        return Promise.reject(data.msg);
      case 3:
        // 业务错误
        Notify.create({
          type: "negative",
          message: data.msg,
        });
        return Promise.reject(data.msg);
      case 4:
        Notify.create({
          type: "negative",
          message: data.msg,
        });
        return Promise.reject(data.msg);
        break;
      default:
        break;
    }

    return config.data.data;
  },
  (error) => {
    // Message.error(error.response.data.message)
    return Promise.reject(error);
  }
);

export default service;
