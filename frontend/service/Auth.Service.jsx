import api from "../common/CommonAxios.jsx";

export const createLoginService = (data) => {
  return api.post("login/", data);
};
export const createRegisterService = (data) => {
  return api.post("register/", data);
};
export const createOtpVerifyService = (data) => {
  return api.post("otp-verify/", data);
};

export const createForgotPasswordService = (data) => {
  return api.post("forgot-password/", data);
};
export const createChangePasswordService = (data) => {
  return api.post("change-password/", data);
};
export const createResetPasswordService = (data) => {
  return api.post("reset-password/", data);
};

export const createLogoutService = (data) => {
  return api.post("logout/", data);
};

