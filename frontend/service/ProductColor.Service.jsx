import api from "../common/CommonAxios.jsx";

export const listProductColorService = (params) => {
  return api.get("/product-color/", {params:params});
};
export const createProductColorService = (data) => {
  return api.post("/product-color/", data);
};
export const retrieveProductColorService = (id,data) => {
  return api.get(`/product-color/${id}/`, data);
};
export const updateProductColorService = (id,data) => {
  return api.patch(`/product-color/${id}/`, data);
};
export const destroyProductColorService = (id,data) => {
  return api.delete(`/product-color/${id}/`, data);
};
