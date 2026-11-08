import React, { useState } from "react";
import "./auth.css";

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
  LockOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
} from "@ant-design/icons";

import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createChangePasswordThunkApi } from "../../slice/Auth.Slice";

const { Title, Text } = Typography;

export default function ChangePassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { token } = useParams();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [api, contextHolder] = notification.useNotification();

  const onFinish = (values) => {
    setLoading(true);

    dispatch(
      createChangePasswordThunkApi({
        token,
        password: values.password,
        password2: values.password2,
      }),
    )
      .unwrap()
      .then((res) => {
        api.success({
          message: "Password Updated",
          description: res.message,
        });
        localStorage.setItem('access',res.token.access)
        localStorage.setItem('refresh',res.token.refresh)
        form.resetFields();

        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
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
              <img src="/src/assets/only_logo.png" alt="Logo" className="auth-logo" />

              <Title className="auth-title">Create a New Password</Title>

              <Text className="auth-subtitle">
                Your identity has been verified. Create a strong password to
                secure your account and regain access.
              </Text>

              <div className="auth-feature">
                <SafetyCertificateOutlined className="auth-feature-icon" />
                <Text strong>Secure password protection</Text>
              </div>

              <div className="auth-feature">
                <LockOutlined className="auth-feature-icon" />
                <Text strong>Enhanced account security</Text>
              </div>

              <div className="auth-feature">
                <RocketOutlined className="auth-feature-icon" />
                <Text strong>Quick recovery process</Text>
              </div>

              {/* <img
                src="/change-password-banner.png"
                alt="Change Password"
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
                  Set New Password
                </Title>

                <Text className="auth-card-subtitle">
                  Enter your new password below.
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                size="large"
                onFinish={onFinish}
              >
                <Form.Item
                  label="New Password"
                  name="password"
                  rules={[
                    {
                      required: true,
                      message: "Please enter your new password",
                    },
                    {
                      min: 8,
                      message: "Password must be at least 8 characters long",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter new password"
                  />
                </Form.Item>

                <Form.Item
                  label="Confirm Password"
                  name="password2"
                  dependencies={["password"]}
                  rules={[
                    {
                      required: true,
                      message: "Please confirm your password",
                    },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue("password") === value) {
                          return Promise.resolve();
                        }

                        return Promise.reject(
                          new Error("Passwords do not match"),
                        );
                      },
                    }),
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm new password"
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  loading={loading}
                  className="auth-primary-btn"
                >
                  Update Password
                </Button>

                <div
                  style={{
                    textAlign: "center",
                    marginTop: "20px",
                  }}
                >
                  <Text type="secondary">
                    Remember your password? <Link to="/login">Sign In</Link>
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
