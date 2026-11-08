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

import { SafetyCertificateOutlined, MailOutlined } from "@ant-design/icons";

import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createOtpVerifyThunkApi } from "../../slice/Auth.Slice";

const { Title, Text } = Typography;

const OtpVerify = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const { token } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [api, contextHolder] = notification.useNotification();

  const onFinish = async (values) => {
    setLoading(true);
    const res = await dispatch(
      createOtpVerifyThunkApi({
        token: token,
        otp: values.otp,
      }),
    )
      .unwrap()
      .then((res) => {
        api.success({
          message: "Verification Successful",
          description: res.message,
        });
        localStorage.setItem("access",res.token.access)
        localStorage.setItem("refresh",res.token.refresh)
        setTimeout(() => {
            navigate("/dashboard/");
            
        }, (1500));
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
          {/* Left Side */}
          <Col xs={0} lg={12} className="auth-left">
            <div className="auth-content">
              <img src="/src/assets/only_logo.png" alt="Logo" className="auth-logo" />

              <Title className="auth-title">Secure Account Verification</Title>

              <Text className="auth-subtitle">
                We have sent a one-time verification code to your registered
                email address. Enter the code below to activate your account and
                continue.
              </Text>

              <div className="auth-feature">
                <SafetyCertificateOutlined className="auth-feature-icon" />
                <Text strong>Protected account activation</Text>
              </div>

              <div className="auth-feature">
                <MailOutlined className="auth-feature-icon" />
                <Text strong>Email verification security</Text>
              </div>

              {/* <img
                src="/otp-banner.png"
                alt="Verification"
                className="auth-banner"
              /> */}
            </div>
          </Col>

          {/* Right Side */}
          <Col xs={24} lg={12} className="auth-right">
            <Card className="auth-card">
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "30px",
                }}
              >
                <SafetyCertificateOutlined
                  style={{
                    fontSize: "60px",
                    color: "#1677ff",
                    marginBottom: "15px",
                  }}
                />

                <Title level={2}>Verify Your Account</Title>

                <Text type="secondary">
                  Enter the 6-digit verification code sent to your email.
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                size="large"
              >
                <Form.Item
                  name="otp"
                  label="Verification Code"
                  rules={[
                    {
                      required: true,
                      message: "Please enter the OTP code",
                    },
                    {
                      len: 6,
                      message: "OTP must be 6 digits",
                    },
                  ]}
                >
                  <Input
                    placeholder="Enter OTP"
                    maxLength={6}
                    style={{
                      textAlign: "center",
                      letterSpacing: "8px",
                      fontSize: "20px",
                      fontWeight: "600",
                    }}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  size="large"
                  loading={loading}
                  className="auth-primary-btn"
                >
                  Verify Account
                </Button>

                <div
                  style={{
                    textAlign: "center",
                    marginTop: "20px",
                  }}
                >
                  <Text type="secondary">Didn't receive the code?</Text>

                  <Button
                    type="link"
                    style={{
                      padding: "0 0 0 6px",
                    }}
                  >
                    Resend OTP
                  </Button>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default OtpVerify;
