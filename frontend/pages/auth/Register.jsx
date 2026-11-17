import React, { useState } from "react";
import "./auth.css";

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
  Spin,
  Select,
  Modal,
  Radio,
  Space,
} from "antd";

import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  GoogleOutlined,
  ShoppingOutlined,
  SafetyCertificateOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { createRegisterService } from "../../service/Auth.Service";
import { createRegisterThunkApi } from "../../slice/Auth.Slice";
import { postGoogleAuthenticationThunkApi } from "../../slice/User.Slice";
import { useGoogleLogin } from "@react-oauth/google";

const { Title, Text } = Typography;

const Register = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [message, contextHolder] = notification.useNotification();
  const dispatch = useDispatch();
  const [Loading, setLoading] = useState(false);
  const [googleCode, setGoogleCode] = useState("");
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [userType, setUserType] = useState("");
  const [tempID,setTempID]=useState(null)
  const submitGoogleLogin = async (code) => {
    try {
      setLoading(true);
      console.log(1);
      console.log(tempID)
      const res = await dispatch(
        postGoogleAuthenticationThunkApi({
          code,
          user_type: userType,
          temp_id:tempID
        }),
      ).unwrap();
      console.log(2);

      if (res.success) {
        if (res.temp_id){
          setGoogleCode(code);
        setRoleModalOpen(true);
        setTempID(res.temp_id)
        }
        else{

          console.log(3);
          
          localStorage.setItem("access", res.token.access);
          localStorage.setItem("refresh", res.token.refresh);
          
          message.success({
            "title":"Success",
            "description":res.message
          })
          
          navigate("/");
        }
      } else {
        setGoogleCode(code);
        setRoleModalOpen(true);
        setTempID(res.temp_id)
      }
    } catch (error) {
      message.error({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message || error ||
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
  const onFinish = () => {
    setLoading(true);
    console.log(form.getFieldsValue());
    let data = form.getFieldsValue();

    dispatch(createRegisterThunkApi(data))
      .unwrap()
      .then((res) => {
        setLoading(false);
        message.success({
          title: "Success",
          description: res.message,
        });
        form.resetFields();
        setTimeout(() => {
          navigate(`/otp-verify/${res.verification_token}`);
        }, 1000);
      })
      .catch((error) => {
        setLoading(false);
        message.error({
          title: "Error",
          description: error,
        });
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
          Loading={Loading}
          style={{ marginTop: 20 }}
          onClick={() => {
            if (!userType){
              message.error({
                "title":"Error",
                "description":"please Select your role"
              })
            }
            else{

              submitGoogleLogin(googleCode)
            }
          }  }
        >
          Continue
        </Button>
      </Modal>
      <div className="auth-container">
        <Row className="auth-row">
          {/* Left Section */}
          <Col xs={0} lg={12} className="auth-left">
            <div className="auth-content">
              <img src="/src/assets/only_logo.png" alt="Logo" className="auth-logo" />

              <Title className="auth-title">Build Your Future Store</Title>

              <Text className="auth-subtitle">
                Create an account and start managing products, customers,
                orders, inventory, and payments from one centralized dashboard.
              </Text>

              <div className="auth-feature">
                <RocketOutlined className="auth-feature-icon" />
                <Text strong>Lightning-fast performance</Text>
              </div>

              <div className="auth-feature">
                <SafetyCertificateOutlined className="auth-feature-icon" />
                <Text strong>Secure authentication & payments</Text>
              </div>

              <div className="auth-feature">
                <ShoppingOutlined className="auth-feature-icon" />
                <Text strong>Modern e-commerce management</Text>
              </div>

              {/* <img
                src="/register-banner.png"
                alt="Banner"
                className="auth-banner"
              /> */}
            </div>
          </Col>

          {/* Right Section */}
          <Col xs={24} lg={12} className="auth-right">
            <Card className="auth-card">
              <div className="auth-card-header">
                <Title level={2} className="auth-card-title">
                  Create Account
                </Title>

                <Text className="auth-card-subtitle">
                  Start your journey with us today
                </Text>
              </div>

              <Form
                form={form}
                layout="vertical"
                size="large"
                onFinish={onFinish}
              >
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input prefix={<UserOutlined />} placeholder="John Doe" />
                </Form.Item>
                <Form.Item
                  label="Role"
                  name="user_type"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Select placeholder="Choose Your Role">
                    <Option value={"Customer"}>Customer</Option>
                    <Option value={"Seller"}>Seller</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label="Email Address"
                  name="email"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input
                    prefix={<MailOutlined />}
                    placeholder="john@example.com"
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Enter password"
                  />
                </Form.Item>

                <Form.Item
                  label="Confirm Password"
                  name="password2"
                  dependencies={["password"]}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    placeholder="Confirm password"
                  />
                </Form.Item>
                {Loading ? (
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="auth-primary-btn"
                    disabled="true"
                  >
                    <Spin size="large" color="white" />
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    htmlType="submit"
                    block
                    className="auth-primary-btn"
                  >
                    Create Account
                  </Button>
                )}

                <Divider>OR</Divider>

                <Button
                  htmlType="button"
                  block
                  loading={Loading}
                  icon={<GoogleOutlined />}
                  className="auth-google-btn"
                  onClick={handleGoogleLogin}
                >
                  Continue with Google
                </Button>

                <div className="auth-footer">
                  <Text type="secondary">
                    Already have an account? <Link to="/login/">Sign In</Link>
                  </Text>
                </div>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
};

export default Register;
