import api from "../common/CommonAxios";

export const listChatService = (params)=>{
    return api.get("/chat/",{params:params})
}

export const createChatService = (data)=>{
    return api.post("/chat/",data)
}

export const retrieveChatService = (id)=>{
    return api.get(`/chat/${id}/`)
}


export const getUnreadMessageChatService = ()=>{
    return api.get(`/chat/unread-count/`)
}


export const listChatMessageService = (params)=>{
    return api.get("/chat-message/",{params:params})
}

export const createChatMessageService = (data)=>{
    return api.post("/chat-message/",data)
}

export const markAsReadChatMessageService = (data)=>{
    return api.patch(`/chat-message/mark-read/`,data)
}