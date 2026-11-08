import React, { useState, useEffect, useRef } from "react";
import {
  Row,
  Col,
  Card,
  Input,
  Button,
  Avatar,
  Tag,
  Typography,
  Space,
  Badge,
  Spin,
  Tooltip,
  Empty,
  Upload,
  notification,
  Grid,
} from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  UserOutlined,
  ShopOutlined,
  SearchOutlined,
  CheckOutlined,
  ArrowLeftOutlined,
  SafetyCertificateOutlined,
  ShoppingOutlined,
  CarOutlined,
} from "@ant-design/icons";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router";
import { listChatService } from "../service/Chat.Service";
import {
  addChatMessage,
  typingStart,
  typingEnd,
  updateOnlineStatus,
  createChatMessageThunkApi,
  listChatMessageThunkApi,
  listChatThunkApi,
  markAsReadChatMessageThunkApi,
} from "../slice/Chat.Slice";
import { clearUnreadCount } from "../slice/Chat.Slice";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { useBreakpoint } = Grid;

export default function Chat() {
  const screens = useBreakpoint();
  const dispatch = useDispatch();
  const [message, contextHolder] = notification.useNotification();
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);
  // Responsive view toggle for mobile screens
  const [mobileView, setMobileView] = useState("list"); // 'list' | 'chat'

  // State setup
  const [loading, setLoading] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const messages = useSelector((state) => state.chatMessage.data);
  const [textInput, setTextInput] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  // User details from Redux state
  const user_detail = useSelector((state) => state.user?.user_detail);
  const conversations = useSelector((state) => state.chat.data) || [];
  const typingUsers=useSelector((state)=>state.chatMessage.typingUsers)
  const isOnline=useSelector((state)=>state.chatMessage.isOnline)
  const isMobile = !screens.md; // Screen width < 768px
  const chat_ws = useRef(null);
  // Auto-scroll to bottom of thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch initial conversations
  useEffect(() => {
    dispatch(listChatThunkApi({ no_pagination: true }))
      .unwrap()
      .then((res) => {
        // Automatically select the first conversation if available
        if (res.data && res.data.length > 0) {
          dispatch(markAsReadChatMessageThunkApi({ chat: res.data[0].id }))
            .unwrap()
            .then(() => {
              dispatch(clearUnreadCount(res.data[0].id));
              setActiveChat(res.data[0]);
            })
            .catch((error) => {
              message.error(
                error?.message ||
                  error?.response?.data?.error ||
                  "Something went wrong",
              );
            });
        }
      })
      .catch((error) => {
        message.error(
          error?.message || error || "Failed to load conversations",
        );
      });
  }, [dispatch]);

  // Fetch thread messages
  useEffect(() => {
    if (!activeChat) return;
    dispatch(
      listChatMessageThunkApi({ no_pagination: true, chat: activeChat.id }),
    )
      .unwrap()
      .then()
      .catch((error) => {
        message.error(
          error?.message ||
            error?.response?.data?.error ||
            "Something went wrong",
        );
      });
  }, [activeChat, user_detail]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, mobileView]);

  const handleSelectChat = (chatItem) => {
    dispatch(markAsReadChatMessageThunkApi({ chat: chatItem.id }))
      .unwrap()
      .then(() => {
        setActiveChat(chatItem);
        dispatch(clearUnreadCount(chatItem.id));
      })
      .catch((error) => {
        message.error(
          error?.message ||
            error?.response?.data?.error ||
            "Something went wrong",
        );
      });
    if (isMobile) {
      setMobileView("chat");
    }
  };

  const handleSendMessage = () => {
    if (!textInput.trim() && !selectedImage) return;

    const formData = new FormData();

    formData.append("chat", activeChat.id);

    if (textInput.trim()) {
      formData.append("message", textInput.trim());
    }

    if (selectedImage) {
      formData.append("image", selectedImage);
    }

    dispatch(createChatMessageThunkApi(formData))
      .unwrap()
      .then((res) => {
        chat_ws.current?.send(
          JSON.stringify({
            type: "typing_end",
            id: user_detail.id,
          }),
        );
        chat_ws.current?.send(
          JSON.stringify({
            type: "chat_message",
            ...res.data,
          }),
        );
      })
      .catch((error) => {
        message.error(
          error?.message ||
            error?.response?.data?.error ||
            error ||
            "Something went wrong",
        );
      });

    setTextInput("");
    setSelectedImage(null);
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setTextInput(value);

    // Send typing_start only once
    if (!isTypingRef.current) {
      isTypingRef.current = true;

      chat_ws.current?.send(
        JSON.stringify({
          type: "typing_start",
          id: user_detail.id,
        }),
      );
    }

    // Reset timer
    clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;

      chat_ws.current?.send(
        JSON.stringify({
          type: "typing_end",
          id: user_detail.id,
        }),
      );
    }, 4000); // 1 second after user stops typing
  };

  const filteredConversations = conversations.filter(
    (c) =>
      (c.customer_username || "").toLowerCase().includes(searchTerm) ||
      (c.seller_username || "").toLowerCase().includes(searchTerm),
  );

  useEffect(() => {
    if (!activeChat?.id) return;
    const accessToken = localStorage.getItem("access");
    const socketUrl = `${import.meta.env.VITE_WEBSOCKET_FRONTEND_URL}chat/${activeChat?.id}/?token=${accessToken}`;

    chat_ws.current = new WebSocket(socketUrl);

    chat_ws.current.onopen = () => {
      console.log("WebSocket connected to /ws/chat/");
    };

    chat_ws.current.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);
      if (newMessage.type === "chat_message") {
        console.log("chat_message")
        dispatch(addChatMessage(newMessage));
      } else if (newMessage.type === "typing_start") {
        dispatch(typingStart(newMessage));
      } else if (newMessage.type === "typing_end") {
        dispatch(typingEnd(newMessage));
      }
      else if (newMessage.type==="user_status"){
        console.log("user_status",newMessage)
        dispatch(updateOnlineStatus(newMessage));
       if (
        newMessage.user_id !== user_detail.id &&
        newMessage.online
    ) {
        message.info({
            "title":"Info",
            "description": `${newMessage.username} is online`
        });
    }
      }
    };

    chat_ws.current.onerror = (error) => {
      console.log(error);
    };
    chat_ws.current.onclose = () => {
      console.log("websocket is closed");
    };
    return () => {
        console.log("Chat page unmounted");

        if (chat_ws.current) {
            console.log("Closing socket...");
            chat_ws.current.close();
        }
    };
  }, [activeChat]);

  return (
    <>
      {contextHolder}
      <div style={{ padding: isMobile ? "4px" : "12px", height: "100%" }}>
        {/* PAGE HEADER (Hidden on mobile active chat view to maximize space) */}
        {(!isMobile || mobileView === "list") && (
          <div className="page-header" style={{ marginBottom: 12 }}>
            <h1
              className="page-title"
              style={{ margin: 0, fontSize: isMobile ? 20 : 24 }}
            >
              Buyer & Seller Chat
            </h1>
            <p
              className="page-subtitle"
              style={{ margin: 0, color: "#8c8c8c", fontSize: 13 }}
            >
              Communicate directly about orders, products, and delivery updates.
            </p>
          </div>
        )}

        <Card
          bodyStyle={{
            padding: 0,
            height: isMobile ? "calc(100vh - 120px)" : "calc(100vh - 160px)",
          }}
          style={{ overflow: "hidden", borderRadius: 8 }}
        >
          <Row style={{ height: "100%" }}>
            {/* SIDEBAR: CONVERSATION LIST */}
            {(!isMobile || mobileView === "list") && (
              <Col
                xs={24}
                sm={24}
                md={8}
                lg={7}
                xl={6}
                style={{
                  borderRight: "1px solid #f0f0f0",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#fff",
                }}
              >
                {/* Search Bar */}
                <div
                  style={{
                    padding: "10px 12px",
                    borderBottom: "1px solid #f0f0f0",
                  }}
                >
                  <Input
                    prefix={<SearchOutlined style={{ color: "#bfbfbf" }} />}
                    placeholder="Search by order or store..."
                    allowClear
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* List Items */}
                <div style={{ overflowY: "auto", flex: 1 }}>
                  {loading ? (
                    <div style={{ padding: 24, textAlign: "center" }}>
                      <Spin />
                    </div>
                  ) : filteredConversations.length === 0 ? (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="No chats found"
                      style={{ margin: "32px 0" }}
                    />
                  ) : (
                    filteredConversations.map((item) => {
                      const isActive = activeChat?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => handleSelectChat(item)}
                          style={{
                            padding: "12px 14px",
                            cursor: "pointer",
                            backgroundColor:
                              isActive && !isMobile ? "#e6f4ff" : "#fff",
                            borderLeft:
                              isActive && !isMobile
                                ? "4px solid #1677ff"
                                : "4px solid transparent",
                            borderBottom: "1px solid #f5f5f5",
                            transition: "background 0.2s",
                          }}
                        >
                          <Row wrap={false} align="middle" gutter={10}>
                            <Col>
                              <Badge count={item.unread_count} offset={[-2, 2]}>
                                <Avatar
                                  size={40}
                                  src={item.product_image}
                                  icon={<ShoppingOutlined />}
                                />
                              </Badge>
                            </Col>
                            <Col flex="auto" style={{ overflow: "hidden" }}>
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Text strong style={{ fontSize: 13 }} ellipsis>
                                  {item.partner_name}
                                </Text>
                                {/* <Text type="secondary" style={{ fontSize: 11 }}>
                                  {item.updated_at}
                                </Text> */}
                              </div>

                              <Text
                                type="secondary"
                                style={{ fontSize: 12, display: "block" }}
                                ellipsis
                              >
                                {item.product_name}
                              </Text>
                              

                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginTop: 4,
                                }}
                              >
                                <Tag
                                  color="blue"
                                  style={{ fontSize: 10, margin: 0 }}
                                >
                                  #{item.order_number}
                                </Tag>
                                <Tag
                                  color={
                                    item.order_status === "Shipped"
                                      ? "cyan"
                                      : "gold"
                                  }
                                  style={{ fontSize: 10, margin: 0 }}
                                >
                                  {item.order_status}
                                </Tag>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      );
                    })
                  )}
                </div>
              </Col>
            )}

            {/* MAIN CHAT AREA */}
            {(!isMobile || mobileView === "chat") && (
              <Col
                xs={24}
                sm={24}
                md={16}
                lg={17}
                xl={18}
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  backgroundColor: "#fafafa",
                }}
              >
                {activeChat ? (
                  <>
                    {/* CHAT HEADER & ENHANCED ORDER CONTEXT */}
                    <div
                      style={{
                        padding: isMobile ? "8px 12px" : "10px 16px",
                        backgroundColor: "#fff",
                        borderBottom: "1px solid #f0f0f0",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                      }}
                    >
                      <Row
                        align="middle"
                        justify="space-between"
                        wrap={false}
                        gutter={8}
                      >
                        <Col flex="auto">
                          <Space size={8} align="center">
                            {/* Mobile Back Button */}
                            {isMobile && (
                              <Button
                                type="text"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => setMobileView("list")}
                                style={{ padding: "0 8px 0 0" }}
                              />
                            )}

                            <Avatar
                              size={isMobile ? 32 : 40}
                              src={activeChat.product_image}
                              icon={<ShopOutlined />}
                            />

                            <div style={{ overflow: "hidden" }}>
                              <Space size={4} align="center">
                                <Text
                                  strong
                                  style={{ fontSize: isMobile ? 13 : 15 }}
                                  ellipsis
                                >
                                  {activeChat.partner_name}
                                </Text>
                                <Tag
                                  color="orange"
                                  style={{ fontSize: 10, padding: "0 4px" }}
                                >
                                  <Text type={isOnline ? "success" : "secondary"}>
    {isOnline ? "Online" : "Offline"}
</Text>
                                </Tag>
                              </Space>

                              <div style={{ fontSize: 11, color: "#8c8c8c" }}>
                                Item:{" "}
                                <Text style={{ fontSize: 11 }} ellipsis>
                                  {activeChat.product_name}
                                 
                                </Text>

                              </div>
                            </div>
                          </Space>
                        </Col>

                        {/* Right Header Status Info */}
                        <Col>
                          <Space direction="vertical" align="end" size={0}>
                            <Link
                              to={`/order-details/${activeChat.order}`}
                              style={{
                                fontWeight: 600,
                                fontSize: 12,
                                color: "#1677ff",
                              }}
                            >
                              #{activeChat.order_number}
                            </Link>
                            <Tag
                              color="green"
                              style={{ fontSize: 11, margin: 0 }}
                            >
                              €{activeChat.order_total_amount}
                            </Tag>
                          </Space>
                        </Col>
                      </Row>

                      {/* Tracking details bar */}
                      <div
                        style={{
                          marginTop: 6,
                          padding: "4px 8px",
                          backgroundColor: "#f6ffed",
                          border: "1px solid #b7eb8f",
                          borderRadius: 4,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: 11,
                        }}
                      >
                        <Space size={4}>
                          <CarOutlined style={{ color: "#52c41a" }} />
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            Tracking:{" "}
                            <b>
                              {activeChat.tracking_number ||
                                "Not Available"}{" "}
                            </b>
                          </Text>
                        </Space>
                        <Tag color="cyan" style={{ fontSize: 10, margin: 0 }}>
                          {activeChat.order_status}
                        </Tag>
                      </div>
                    </div>

                    {/* MESSAGES SCROLL AREA */}
                    <div
                      style={{
                        flex: 1,
                        padding: isMobile ? "10px 12px" : "14px 16px",
                        overflowY: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      {/* Compact Security Banner */}
                      <div
                        style={{
                          backgroundColor: "#fffbe6",
                          border: "1px solid #ffe58f",
                          borderRadius: 6,
                          padding: "6px 10px",
                          fontSize: 11,
                          color: "#d48806",
                          textAlign: "center",
                        }}
                      >
                        <SafetyCertificateOutlined style={{ marginRight: 4 }} />
                        Keep communications on-platform for buyer protection
                        guarantee.
                      </div>

                      {messages.map((msg) => {
                        const isMe = msg.sender === user_detail?.id;

                        return (
                          <div
                            key={msg.id}
                            style={{
                              display: "flex",
                              justifyContent: isMe ? "flex-start" : "flex-end",
                              marginBottom: 12,
                            }}
                          >
                            <div
                              style={{
                                maxWidth: isMobile ? "85%" : "70%",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: isMe ? "flex-start" : "flex-end",
                              }}
                            >
                              <div
                                style={{
                                  padding: "8px 12px",
                                  borderRadius: isMe
                                    ? "12px 12px 2px 12px"
                                    : "12px 12px 12px 2px",
                                  backgroundColor: isMe ? "#1677ff" : "#ffffff",
                                  color: isMe
                                    ? "#ffffff"
                                    : "rgba(0, 0, 0, 0.88)",
                                  border: isMe ? "none" : "1px solid #f0f0f0",
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                                  wordBreak: "break-word",
                                  fontSize: 13,
                                  lineHeight: "1.4",
                                }}
                              >
                                {msg.image && (
                                  <img
                                    src={msg.image}
                                    alt="Chat"
                                    style={{
                                      maxWidth: 250,
                                      width: "100%",
                                      borderRadius: 8,
                                      marginBottom: msg.message ? 8 : 0,
                                    }}
                                  />
                                )}

                                {msg.message && <div>{msg.message}</div>}
                              </div>

                              <Space
                                size={4}
                                style={{
                                  marginTop: 4,
                                  fontSize: 10,
                                  color: "#8c8c8c",
                                }}
                              >
                                <span>
                                  {new Date(msg.created_at).toLocaleString(
                                    "en-GB",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                      hour12: false,
                                    },
                                  )}
                                </span>

                                {isMe && (
                                  <CheckOutlined
                                    style={{
                                      color: msg.is_read
                                        ? "#1677ff"
                                        : "#8c8c8c",
                                    }}
                                  />
                                )}
                              </Space>
                            </div>
                          </div>
                        );
                      })}
        {typingUsers
  .filter((user) => user.id !== user_detail?.id)
  .map((user) => (
    <div
      key={user.id}
      style={{
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: 12,
      }}
    >
      <div className="typing-bubble">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  ))}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* QUICK REPLIES (DESKTOP ONLY) */}
                    {!isMobile && (
                      <div
                        style={{
                          padding: "6px 16px 0 16px",
                          backgroundColor: "#fff",
                          borderTop: "1px solid #f0f0f0",
                        }}
                      >
                        <Space wrap size={[6, 6]}>
                          <Text type="secondary" style={{ fontSize: 11 }}>
                            Quick Replies:
                          </Text>
                          <Tag
                            style={{ cursor: "pointer", fontSize: 11 }}
                            onClick={() =>
                              setTextInput(
                                "Where is my order package currently located?",
                              )
                            }
                          >
                            📦 Shipping status?
                          </Tag>
                          <Tag
                            style={{ cursor: "pointer", fontSize: 11 }}
                            onClick={() =>
                              setTextInput(
                                "I received the item but it has an issue.",
                              )
                            }
                          >
                            ⚠️ Report issue
                          </Tag>
                        </Space>
                      </div>
                    )}

                    {/* INPUT BAR */}
                    <div
                      style={{
                        padding: isMobile ? "8px 12px" : "10px 16px",
                        backgroundColor: "#fff",
                        borderTop: isMobile ? "1px solid #f0f0f0" : "none",
                      }}
                    >
                      <Row gutter={8} align="bottom" wrap={false}>
                        <Col flex="auto">
                          <TextArea
                            value={textInput}
                            onChange={handleTyping}
                            placeholder="Type a message..."
                            autoSize={{ minRows: 1, maxRows: 3 }}
                            style={{ fontSize: 13 }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleSendMessage();
                              }
                            }}
                          />
                          {selectedImage && (
                            <div style={{ marginTop: 8 }}>
                              📷 {selectedImage.name}
                              <Button
                                type="link"
                                danger
                                size="small"
                                onClick={() => setSelectedImage(null)}
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                        </Col>
                        <Col>
                          <Space size={4}>
                            <Upload
                              accept="image/*"
                              maxCount={1}
                              showUploadList={false}
                              beforeUpload={(file) => {
                                setSelectedImage(file);
                                return false; // Prevent automatic upload
                              }}
                            >
                              <Tooltip title="Attach image">
                                <Button
                                  icon={<PaperClipOutlined />}
                                  size={isMobile ? "middle" : "default"}
                                />
                              </Tooltip>
                            </Upload>
                            <Button
                              type="primary"
                              icon={<SendOutlined />}
                              onClick={handleSendMessage}
                              disabled={!textInput.trim() && !selectedImage}
                              size={isMobile ? "middle" : "default"}
                            />
                          </Space>
                        </Col>
                      </Row>
                    </div>
                  </>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      height: "100%",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Empty description="Select a conversation to open chat" />
                  </div>
                )}
              </Col>
            )}
          </Row>
        </Card>
      </div>
    </>
  );
}
