import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import {
  Card,
  Input,
  Button,
  Avatar,
  Upload,
  Typography,
  Space,
  Spin,
  Descriptions,
  notification,
  Breadcrumb,
  Tag,
} from "antd";
import {
  SendOutlined,
  PaperClipOutlined,
  ArrowLeftOutlined,
  UserOutlined,
} from "@ant-design/icons";

// Connect to your dynamic Redux actions (update paths based on your file tree)
import {
  listSupportTicketMessagesThunkApi,
  createSupportTicketMessagesThunkApi,
  retrieveSupportTicketThunkApi,
  addMessage,
  typingStart,
  typingEnd,
} from "../../slice/SupportTicket.Slice";

const { Text, Title } = Typography;
const { TextArea } = Input;

export default function SupportTicketMessageRoom() {
  const { ticketId } = useParams();
  const ws = useRef(null);
  const dispatch = useDispatch();
  // or admin username if you have it
  const [message, contextHolder] = notification.useNotification();
  const [isUserOnline, setIsUserOnline] = useState(false);
  // Dynamic application state selectors
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false);
  const user_detail = useSelector((state) => state.user.user_detail);
  const isAdmin = user_detail.user_type === "Admin";

  const supportTicketMessage = useSelector(
    (state) => state.supportTicketMessages,
  ); // Expects { data: [], loading: false }
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const messagesEndRef = useRef(null);
  const chatBodyRef = useRef(null);
  // Component Form Controller States
  const [typedMessage, setTypedMessage] = useState("");
  const [fileList, setFileList] = useState([]);
  const [sending, setSending] = useState(false);
  const support_ticket_single_data = useSelector(
    (state) => state.supportTicket.single_data,
  );
  const otherUserName = isAdmin
    ? support_ticket_single_data.username // customer
    : "Support Team";
  const [isTyping, setIsTyping] = useState(false);
  const [typingTimeout, setTypingTimeout] = useState(null);
  const firstLoad = useRef(true);
  console.log(support_ticket_single_data);
  const PRIMARY_COLOR = "#1677ff";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };
  const handleScroll = () => {
    if (isAtBottom()) {
      setShowNewMessageButton(false);
    }
  };
  const isAtBottom = () => {
    const chat = chatBodyRef.current;

    if (!chat) return true;

    return chat.scrollHeight - chat.scrollTop - chat.clientHeight < 100;
  };

  // Helper method to fetch updates dynamically from the server database
  const fetchMessages = (showLoader = false) => {
    dispatch(
      listSupportTicketMessagesThunkApi({ ticket: ticketId, showLoader }),
    )
      .unwrap()
      .catch((error) => {
        message.error({
          title: "Synchronization Error",
          description: error || "Failed to retrieve new messages.",
        });
      });
  };

  // Initial stream mount loader
  useEffect(() => {
    fetchMessages(true);
    fetchTicket(true);
  }, [ticketId]);

  const fetchTicket = () => {
    dispatch(retrieveSupportTicketThunkApi(ticketId))
      .unwrap()
      .then()
      .catch((error) => {
        message.error({
          title: "Error",
          description: error,
        });
      });
  };

  // Keep the viewport snapped to the absolute latest text row element
  useEffect(() => {
    if (!supportTicketMessage?.data?.length) return;

    if (firstLoad.current) {
      requestAnimationFrame(() => {
        scrollToBottom();
      });

      firstLoad.current = false;
      return;
    }

    if (isAtBottom()) {
      scrollToBottom();
      setShowNewMessageButton(false);
    } else {
      setShowNewMessageButton(true);
    }
  }, [supportTicketMessage.data]);
  const handleSendMessage = () => {
    if (!typedMessage.trim() && fileList.length === 0) return;

    setSending(true);

    // Stop typing immediately when sending a message
    if (isTyping) {
      ws.current?.send(
        JSON.stringify({
          type: "typing_end",
          username: user_detail.username,
        }),
      );

      setIsTyping(false);

      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
    }

    if (fileList.length > 0) {
      const formData = new FormData();
      formData.append("ticket", ticketId);
      formData.append("message", typedMessage);
      formData.append("attachment", fileList[0].originFileObj);

      dispatch(createSupportTicketMessagesThunkApi(formData))
        .unwrap()
        .then((res) => {
          setTypedMessage("");
          setFileList([]);

          ws.current?.send(
            JSON.stringify({
              type: "support_ticket_message",
              message: res.data.message,
              image: res.data.attachment,
              support_ticket_message_id: res.data.id,
            }),
          );
        })
        .catch((error) => {
          message.error({
            title: "Submission Failure",
            description: error || "Could not deliver your reply.",
          });
        })
        .finally(() => {
          setSending(false);
        });
    } else {
      ws.current?.send(
        JSON.stringify({
          type: "support_ticket_message",
          message: typedMessage,
        }),
      );

      setTypedMessage("");
      setSending(false);
    }
  };
  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList.slice(-1)); // Limit processing queue strictly to one target asset
  };
  useEffect(() => {
  const token = localStorage.getItem("access");
  if (!token) return;

  const socket = new WebSocket(
    `${import.meta.env.VITE_WEBSOCKET_FRONTEND_URL}support-ticket/${ticketId}/?token=${token}`,
  );
  ws.current = socket;

  socket.onopen = () => console.log("connected");

  socket.onmessage = (event) => {
    const response = JSON.parse(event.data);

    switch (response.type) {
      case "support_ticket_message":
        dispatch(addMessage(response));
        break;
      case "typing_start":
        dispatch(typingStart(response.username));
        break;
      case "typing_end":
        dispatch(typingEnd(response.username));
        break;
      case "user_status":
        setIsOtherUserOnline(response.online);
        message.info({
          message: "Info",
          description: response.online
            ? `${response.username} is now online.`
            : `${response.username} went offline.`,
          placement: "topRight",
        });
        break;
      default:
        break;
    }
  };

  socket.onerror = () => console.log("error");   // was ws.current.error, which does nothing
  socket.onclose = () => console.log("Websocket close");

  return () => {
    socket.close();
    if (ws.current === socket) ws.current = null;
  };
}, [ticketId, dispatch]);

  const handleTyping = (e) => {
    const value = e.target.value;
    setTypedMessage(value);

    if (!isTyping) {
      console.log("typingstart");
      setIsTyping(true);

      ws.current?.send(
        JSON.stringify({
          type: "typing_start",
          user_id: user_detail.id,
          username: user_detail.username,
        }),
      );
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      setIsTyping(false);
      console.log("typing end");
      ws.current?.send(
        JSON.stringify({
          type: "typing_end",
          username: user_detail.username,
        }),
      );
    }, 5000);

    setTypingTimeout(timeout);
  };
  return (
    <>
      {contextHolder}
      <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
        <div className="ticket-header">
          <div className="ticket-header-left">
            <Link to="/support-ticket/">
              <Button
                shape="circle"
                icon={<ArrowLeftOutlined />}
                size="large"
              />
            </Link>

            <div className="ticket-title-section">
              <Title level={3} className="ticket-title">
                Support Ticket
              </Title>

              <Text className="ticket-subtitle">
                Review the customer's issue and reply below.
              </Text>
            </div>
          </div>

          <div className="ticket-meta">
            <Tag color="purple">
              <strong>Issue Type:</strong>{" "}
              {support_ticket_single_data?.issue_type}
            </Tag>

            <Tag
              color={
                support_ticket_single_data?.status === "Open"
                  ? "blue"
                  : support_ticket_single_data?.status === "In Progress"
                    ? "orange"
                    : support_ticket_single_data?.status === "Resolved"
                      ? "green"
                      : "red"
              }
            >
              <strong>Status:</strong> {support_ticket_single_data?.status}
            </Tag>
          </div>
        </div>

        <div className="ticket-info-card">
          <div className="ticket-info-row">
            <span className="ticket-label">
              {isAdmin ? "Customer" : "Support"}
            </span>

            <div className="ticket-value">
              <div>{otherUserName}</div>

              <div
                style={{
                  color: isOtherUserOnline ? "#52c41a" : "#999",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                {isOtherUserOnline ? "🟢 Online" : "⚫ Offline"}
              </div>
            </div>
          </div>

          <div className="ticket-info-row">
            <span className="ticket-label">Subject</span>
            <span className="ticket-value">
              {support_ticket_single_data?.subject}
            </span>
          </div>

          <div className="ticket-info-row">
            <span className="ticket-label">Created</span>
            <span className="ticket-value">
              {new Date(
                support_ticket_single_data?.created_at,
              ).toLocaleString()}
            </span>
          </div>
        </div>
        <Card className="support-chat-card" bodyStyle={{ padding: 0 }}>
          <div
            className="support-chat-body"
            ref={chatBodyRef}
            onScroll={handleScroll}
          >
            {supportTicketMessage?.loading &&
            supportTicketMessage?.data?.length === 0 ? (
              <div className="chat-loading">
                <Spin size="large" />
              </div>
            ) : (
              supportTicketMessage?.data?.map((msg) => {
                const isMe = msg.sender === user_detail?.id;
                const hasProfileImage = msg.profile_image?.trim();

                return (
                  <div
                    key={msg.id}
                    className={`message-row ${
                      isMe ? "message-row-left" : "message-row-right"
                    }`}
                  >
                    <div
                      className={`message-container ${
                        isMe
                          ? "message-container-left"
                          : "message-container-right"
                      }`}
                    >
                      <Avatar
                        src={hasProfileImage || undefined}
                        icon={!hasProfileImage && <UserOutlined />}
                        className="message-avatar"
                      >
                        {msg.username?.charAt(0)?.toUpperCase()}
                      </Avatar>

                      <div
                        className={`message-content ${
                          isMe
                            ? "message-content-left"
                            : "message-content-right"
                        }`}
                      >
                        <div className="message-user">
                          {isMe ? (
                            <>
                              <span>You</span>
                              <span className="message-time">
                                {new Date(msg.created_at).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="message-time">
                                {new Date(msg.created_at).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>

                              <span>{msg.username}</span>
                            </>
                          )}
                        </div>

                        {msg.message && (
                          <div
                            className={`message-bubble ${
                              isMe
                                ? "message-bubble-left"
                                : "message-bubble-right"
                            }`}
                          >
                            {msg.message}
                          </div>
                        )}

                        {msg.attachment && (
                          <img
                            src={msg.attachment}
                            alt=""
                            className="message-image"
                            onClick={() =>
                              window.open(msg.attachment, "_blank")
                            }
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {supportTicketMessage.typingUsers
              ?.filter((user) => user !== user_detail?.username)
              .map((user) => (
                <div className="typing-message-row" key={user}>
                  <div className="typing-container">
                    <div className="typing-bubble">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>

                    <Avatar
                      icon={<UserOutlined />}
                      className="message-avatar"
                    />
                  </div>
                </div>
              ))}

            <div ref={messagesEndRef} />
          </div>
          {showNewMessageButton && (
            <Button
              type="primary"
              shape="round"
              style={{
                position: "absolute",
                bottom: 90,
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 10,
              }}
              onClick={() => {
                scrollToBottom();
                setShowNewMessageButton(false);
              }}
            >
              ↓ New Messages
            </Button>
          )}
          {/* input   */}
          <div className="support-chat-footer">
            <div className="support-chat-input-wrapper">
              <TextArea
                value={typedMessage}
                onChange={handleTyping}
                placeholder="Type your message..."
                autoSize={{ minRows: 2, maxRows: 5 }}
                className="chat-textarea"
                onPressEnter={(e) => {
                  if (!e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <div className="chat-actions">
                <Upload
                  beforeUpload={() => false}
                  fileList={fileList}
                  onChange={handleUploadChange}
                  maxCount={1}
                  accept="image/*"
                  showUploadList={false}
                >
                  <Button
                    icon={<PaperClipOutlined />}
                    className="chat-attach-btn"
                  >
                    Attach
                  </Button>
                </Upload>

                <Button
                  type="primary"
                  loading={sending}
                  icon={<SendOutlined />}
                  className="chat-send-btn"
                  onClick={handleSendMessage}
                >
                  Send
                </Button>
              </div>
            </div>

            {fileList.length > 0 && (
              <div className="chat-file-preview">📎 {fileList[0].name}</div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}
