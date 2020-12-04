// @ts-nocheck
import axios from "axios";

const service = axios.create({
  baseURL: process.env.VUE_APP_API,
  timeout: 60000, // request timeout
  headers: { "Content-Type": "application/json" },
});

// request interceptor
service.interceptors.request.use(
  (config) => {

    config.data = JSON.stringify(config.data);
    return config;
  },
  (error) => {
    console.log(error); // for debug
    return Promise.reject(error);
  }
);

// response interceptor
service.interceptors.response.use(
  (response) => {
  
    const res = response.data;
    return res;
  },
  (error) => {
    // const rest = error.response;
    // Message({ message: 'Api Error, Please Try Again!', type: 'error' })
    return Promise.reject(error);
  }
);

export default service;
