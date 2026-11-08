import api from "../common/CommonAxios.jsx"

export const listNotificationService=(params)=>{
    return api.get("/notification/",{params:params})
}

export const updateNotificationService=(id,data)=>{
    return api.patch(`/notification/${id}/`,data)
}

export const retrieveNotificationService=(id)=>{
    return api.get(`/notification/${id}/`)
}

export const updateMarkAllReadNotificationService=(id)=>{
   return api.patch("/notification/mark-all-read/")
}

export const getUnreadCountService=()=>{
   return api.get("/notification/unread-count/")

}