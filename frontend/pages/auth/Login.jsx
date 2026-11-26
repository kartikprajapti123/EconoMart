import React, { useState } from "react";
import "./auth.css";
import onlyLogo from "../src/assets/only_logo.png"
import {
  Row,
  Col,
  Form,
  Input,
  Button,
  Typography,
  Divider,
  Card,
  notification,
  message,
  Modal,
  Radio,
  Space,
} from "antd";

import {
  MailOutlined,
  LockOutlined,
  ArrowLeftOutlined,
  GoogleOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
  ShoppingOutlined,
} from "@ant-design/icons";

import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createLoginThunkApi } from "../../slice/Auth.Slice";
import { postGoogleAuthenticationThunkApi } from "../../slice/User.Slice";
import { useGoogleLogin } from "@react-oauth/google";
const { Title, Text } = Typography;

export default function Login() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [googleCode, setGoogleCode] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [userType, setUserType] = useState("");
  const [tempID, setTempID] = useState(null);
  const [api, contextHolder] = notification.useNotification();

  const submitGoogleLogin = async (code) => {
    try {
      setLoading(true);
      console.log(1);
      console.log(tempID);
      const res = await dispatch(
        postGoogleAuthenticationThunkApi({
          code,
          user_type: userType,
          temp_id: tempID,
        }),
      ).unwrap();
      console.log(2);

      if (res.success) {
        if (res.temp_id) {
          setGoogleCode(code);
          setRoleModalOpen(true);
          setTempID(res.temp_id);
        } else {
          console.log(3);

          localStorage.setItem("access", res.token.access);
          localStorage.setItem("refresh", res.token.refresh);

          message.success({
            title: "Success",
            description: res.message,
          });

          navigate("/");
        }
      } else {
        setGoogleCode(code);
        setRoleModalOpen(true);
        setTempID(res.temp_id);
      }
    } catch (error) {
      message.error({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          error ||
          "Authentication failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",

    onSuccess: (codeResponse) => {
      submitGoogleLogin(codeResponse.code);
    },

    onError: () => {
      message.error("Google authentication failed.");
    },
  });

  const onFinish = (values) => {
    setLoading(true);

    dispatch(createLoginThunkApi(values))
      .unwrap()
      .then((res) => {
        localStorage.setItem("access", res.token.access);
        localStorage.setItem("refresh", res.token.refresh);

        api.success({
          message: "Login Successful",
          description: res.message,
        });
        form.resetFields();
        setTimeout(() => {
          navigate("/");
        }, 1000);
      })
      .catch((error) => {
        api.error({
          message: "Login Failed",
          description: error,
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <>
      {contextHolder}
      <Modal
        title="Choose Account Type"
        open={roleModalOpen}
        onCancel={() => setRoleModalOpen(false)}
        footer={null}
      >
        <Radio.Group
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          style={{ width: "100%" }}
        >
          <Space direction="vertical">
            <Radio value="Customer">Customer</Radio>
            <Radio value="Seller">Seller</Radio>
          </Space>
        </Radio.Group>

        <Button
          type="primary"
          block
          Loading={loading}
          style={{ marginTop: 20 }}
          onClick={() => {
            if (userType) {
              message.error({
                title: "Error",
                description: "please Select your role",
              });
            }
            submitGoogleLogin(googleCode);
          }}
        >
          Continue
        </Button>
      </Modal>
      <div className="auth-container">
        <Row className="auth-row">
          {/* Left Section */}
          <Col xs={0} lg={12} className="auth-left">
            <div className="auth-content">
              <img
                src={onlyLogo}
                alt="Logo"
                className="auth-logo"
              />

              <Title className="auth-title">Welcome Back</Title>

              <Text className="auth-subtitle">
                Sign in to manage products, customers, orders, analytics,
                inventory, and payments from your centralized dashboard.
              </Text>

              <div className="auth-feature">
                <RocketOutlined className="auth-feature-icon" />
                <Text strong>Fast and reliable platform</Text>
              </div>

              <div className="auth-feature">
                <SafetyCertificateOutlined className="auth-feature-icon" />
                <Text strong>Enterprise-grade security</Text>
              </div>

              <div className="auth-feature">
                <ShoppingOutlined className="auth-feature-icon" />
                <Text strong>Complete e-commerce management</Text>
              </div>

              {/* <img
                src="/src/assets/only_banner.png"
                alt="Login Banner"
                className="auth-banner"
                style={{background:"transparent","width":200,height:80}}
              /> */}
            </div>
          </Col>

          {/* Right Section */}
          {/* Replace your whole <Col className="auth-right"> ... </Col> with this.
    Imports you already have are enough (ArrowLeftOutlined, MailOutlined,
    LockOutlined, GoogleOutlined, Button, Card, Divider, Form, Input, Typography, Link). */}

<Col xs={24} lg={12} className="auth-right">
  <Card className="auth-card">
    {/* Top bar: back button */}
    <div className="auth-card-topbar">
      <Button
        type="text"
        className="auth-back-btn"
        icon={<ArrowLeftOutlined />}
        onClick={() =>
          window.history.length > 1 ? navigate(-1) : navigate("/")
        }
      >
        Back
      </Button>
    </div>

    {/* Heading */}
    <div className="auth-card-header">
      <Title level={2} className="auth-card-title">
        Sign in
      </Title>
      <Text className="auth-card-subtitle">
        Access your account and continue growing your business
      </Text>
    </div>

    <Form form={form} layout="vertical" size="large" onFinish={onFinish}>
      <Form.Item
        label="Email address"
        name="email"
        rules={[
          { required: true, message: "Please enter your email address" },
          { type: "email", message: "Please enter a valid email address" },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="john@example.com"
          autoComplete="email"
        />
      </Form.Item>

      <Form.Item
        label="Password"
        name="password"
        rules={[{ required: true, message: "Please enter your password" }]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="Enter your password"
          autoComplete="current-password"
        />
      </Form.Item>

      <div className="auth-forgot-row">
        <Link to="/forgot-password/">Forgot password?</Link>
      </div>

      <Button
        type="primary"
        htmlType="submit"
        block
        loading={loading}
        className="auth-primary-btn"
      >
        Sign in
      </Button>

      <Divider className="auth-divider">or</Divider>

      <Button
        block
        loading={loading}
        icon={<GoogleOutlined />}
        className="auth-google-btn"
        onClick={() => handleGoogleLogin()}
      >
        Continue with Google
      </Button>

      <div className="auth-footer">
        <Text type="secondary">
          Don't have an account? <Link to="/register/">Create account</Link>
        </Text>
      </div>
    </Form>
  </Card>
</Col>
        </Row>
      </div>
    </>
  );
}
