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
  Card,
  notification,
} from "antd";

import {
  MailOutlined,
  SafetyCertificateOutlined,
  LockOutlined,
  RocketOutlined,
} from "@ant-design/icons";

import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createForgotPasswordThunkApi } from "../../slice/Auth.Slice";

const { Title, Text } = Typography;

export default function ForgotPassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [api, contextHolder] = notification.useNotification();

  const onFinish = (values) => {
    setLoading(true);

    dispatch(createForgotPasswordThunkApi(values))
      .unwrap()
      .then((res) => {
        api.success({
          message: "Email Sent",
          description: res.message,
        });
        form.resetFields()
      })
      .catch((error) => {
        api.error({
          message: "Error",
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

      <div className="auth-container">
        <Row className="auth-row">
          {/* Left Section */}
          <Col xs={0} lg={12} className="auth-left">
            <div className="auth-content">
              <img src={onlyLogo} alt="Logo" className="auth-logo" />

              
              <Title className="auth-title">
                Reset Your Password
              </Title>

              <Text className="auth-subtitle">
                Forgot your password? No problem. Enter your email address and
                we'll send you instructions to securely reset your account.
              </Text>

              <div className="auth-feature">
                <SafetyCertificateOutlined className="auth-feature-icon" />
                <Text strong>Secure password recovery</Text>
              </div>

              <div className="auth-feature">
                <MailOutlined className="auth-feature-icon" />
                <Text strong>Password reset via email</Text>
              </div>

              <div className="auth-feature">
                <RocketOutlined className="auth-feature-icon" />
                <Text strong>Quick account recovery process</Text>
              </div>

              {/* <img
                src="/forgot-password-banner.png"
                alt="Forgot Password"
                className="auth-banner"
              /> */}
            </div>
          </Col>

          {/* Right Section */}
          <Col xs={24} lg={12} className="auth-right">
            <Card className="auth-card">
              <div className="auth-card-header">
                <LockOutlined
                  style={{
                    fontSize: "55px",
                    color: "#1677ff",
                    marginBottom: "15px",
                  }}
                />

                <Title level={2} className="auth-card-title">
                  Forgot Password?
                </Title>

                <Text className="auth-card-subtitle">
                  Enter your email address and we'll send a password reset link.
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                size="large"
                onFinish={onFinish}
              >
                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your email address",
                    },
                    {
                      type: "email",
                      message: "Please enter a valid email address",
                    },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="john@example.com"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  className="auth-primary-btn"
                >
                  Send Reset Link
                </Button>

                <div
                  style={{
                    textAlign: "center",
                    marginTop: "20px",
                  }}
                >
                  <Text type="secondary">
                    Remember your password?{" "}
                    <Link to="/login">
                      Sign In
                    </Link>
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