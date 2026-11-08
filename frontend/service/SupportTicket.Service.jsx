import api from "../common/CommonAxios.jsx";

export const listSupportTicketService = (params) => {
  return api.get("/support-ticket/", {params:params});
};
export const createSupportTicketService = (data) => {
  return api.post(`/support-ticket/`, data);
};
export const retrieveSupportTicketService = (id,data) => {
  return api.get(`/support-ticket/${id}/`, data);
};
export const updateSupportTicketService = (id,data) => {
  return api.patch(`/support-ticket/${id}/`, data);
};
export const destroySupportTicketService = (id) => {
  return api.delete(`/support-ticket/${id}/`);
};



export const listSupportTicketMessagesService = (params) => {
  return api.get("/support-ticket-message/", {params:params});
};
export const createSupportTicketMessagesService = (data) => {
  return api.post(`/support-ticket-message/`, data);
};
export const retrieveSupportTicketMessagesService = (id,data) => {
  return api.get(`/support-ticket-message/${id}/`, data);
};
export const updateSupportTicketMessagesService = (id,data) => {
  return api.patch(`/support-ticket-message/${id}/`, data);
};
export const destroySupportTicketMessagesService = (id) => {
  return api.delete(`/support-ticket-message/${id}/`);
};






