import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Select,
  Switch,
  Button,
  Upload,
  Row,
  Col,
  Card,
  Space,
  Avatar,
  Divider,
  notification,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  SaveOutlined,
  ReloadOutlined,
  CameraOutlined,
  SafetyCertificateOutlined,
  RollbackOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { useDispatch } from "react-redux";
import {
  createUserThunkApi,
  getSingleUserThunkApi,
  retrieveUserThunkApi,
  updateUserThunkApi,
} from "../../slice/User.Slice";
import { Navigate, useNavigate, useParams } from "react-router";
const { Option } = Select;

export default function UserCreateUpdate() {
  const [form] = Form.useForm();
  const [message, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const [profileImage, setProfileImage] = useState(null);
  const params = useParams();
  const [isUpdate, setIsUpdate] = useState();
  const [imagePreview, setImagePreview] = useState(null);
  // const []
  const navigate = useNavigate();
  const handleProfileImageChange = ({ fileList }) => {
    const selectedFile = fileList[0]?.originFileObj;

    if (!selectedFile) return;

    setProfileImage(selectedFile);
    setImagePreview(URL.createObjectURL(selectedFile));
  };

  const retrieveUser = () => {
    dispatch(retrieveUserThunkApi(params.id))
      .unwrap()
      .then((res) => {
        form.setFieldsValue(res.data);
        setProfileImage(null);
        setIsUpdate(true);
        setImagePreview(res.data.profile_image);
      })
      .catch((error) => {
        console.log(error);
        message.error({
          title: "Error",
          description: error,
        });
      });
  };

  useEffect(() => {
    if (params.id) {
      retrieveUser();
    }
  }, []);

  const onFinish = (values) => {
    setLoading(true);

    if (isUpdate) {
      const formData = new FormData();
      formData.append("user_data", JSON.stringify(values));
      console.log(profileImage);
      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      dispatch(updateUserThunkApi({ id: params.id, data: formData }))
        .unwrap()
        .then((res) => {
          setLoading(false);
          message.success({ title: "Success", description: res.message });
          form.setFieldsValue(res.data);
          setProfileImage(res.data.profile_image);
          setImagePreview(res.data.profile_image);
        })
        .catch((error) => {
          console.log(error);
          setLoading(false);
          message.error({
            title: "Error",
            description: error || "Something went wrong",
          });
        });
    } else {
      const formData = new FormData();
      formData.append("user_data", JSON.stringify(values));
      if (profileImage instanceof File) {
        formData.append("profile_image", profileImage);
      }

      dispatch(createUserThunkApi(formData))
        .unwrap()
        .then((res) => {
          setLoading(false);
          message.success({ title: "Success", description: res.message });
          form.resetFields();
          setImagePreview(null);
          setProfileImage(null);
        })
        .catch((error) => {
          setLoading(false);
          message.error({
            title: "Error",
            description: error || "Something went wrong",
          });
        });
    }
  };

  return (
    <>
      {contextHolder}
      <div className="admin-page-container">
        {/* Header */}
        <div className="form-sticky-header">
          <div>
            <h1 className="main-dashboard-title">
              {isUpdate ? "Update User Account" : "Create User Account"}
            </h1>
            <span style={{ color: "#64748b", fontSize: 13 }}>
              Create and manage customer, seller, and administrator accounts.
            </span>
          </div>

          <Space>
            <Button
              size="large"
              icon={<RollbackOutlined />}
              onClick={() => {
                navigate("/user/");
              }}
            >
              Back
            </Button>

            <Button
              type="primary"
              size="large"
              icon={<SaveOutlined />}
              loading={loading}
              onClick={() => form.submit()}
              className="btn-primary-antd"
            >
              {isUpdate ? "Update User" : "Create User"}
            </Button>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          // Set this to true so users see red asterisks indicating required fields
          requiredMark={true}
        >
          <Row gutter={[24, 24]}>
            {/* Profile Section */}
            <Col xs={24} xl={7}>
              <Card bordered={false} className="user-profile-card">
                <div className="profile-wrapper">
                  <div className="avatar-container">
                    <Avatar
                      size={130}
                      src={imagePreview}
                      icon={!imagePreview && <UserOutlined />}
                    />
                    <Button
                      shape="circle"
                      icon={<CameraOutlined />}
                      className="avatar-edit-btn"
                    />
                  </div>

                  <h3>User Profile</h3>
                  <p>
                    Upload a profile image for better identification throughout
                    the platform.
                  </p>

                  <Form.Item>
                    <Upload
                      accept="image/*"
                      maxCount={1}
                      listType="text"
                      beforeUpload={() => false}
                      onChange={handleProfileImageChange}
                      showUploadList={false}
                    >
                      <Button icon={<UploadOutlined />} size="large" block>
                        Upload Image
                      </Button>
                    </Upload>
                  </Form.Item>
                </div>
              </Card>
            </Col>

            {/* Main Form */}
            <Col xs={24} xl={17}>
              <Card bordered={false} className="user-main-card">
                <div className="section-title">Basic Information</div>

                <Row gutter={[20, 0]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Username"
                      name="username"
                      rules={[
                        { required: true, message: "Username is required" },
                      ]}
                    >
                      <Input
                        size="large"
                        prefix={<UserOutlined />}
                        placeholder="Enter username"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Email Address"
                      name="email"
                      rules={[
                        { required: true, message: "Email is required" },
                        {
                          type: "email",
                          message: "Please enter a valid email address",
                        },
                      ]}
                    >
                      <Input
                        size="large"
                        prefix={<MailOutlined />}
                        placeholder="john@example.com"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item label="Phone Number" name="phone_number">
                      <Input
                        size="large"
                        prefix={<PhoneOutlined />}
                        placeholder="+49 123456789"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="User Type"
                      name="user_type"
                      rules={[{ required: true, message: "Select user type" }]}
                    >
                      <Select size="large" placeholder="Select user type">
                        <Option value="Customer">Customer</Option>
                        <Option value="Seller">Seller</Option>
                        <Option value="Admin">Administrator</Option>
                      </Select>
                    </Form.Item>
                  </Col>

                  {!isUpdate && (
                    <>
                      <Col xs={24} md={12}>
                        <Form.Item
                          label="Password"
                          name="password"
                          rules={[
                            { required: true, message: "Password is required" },
                            {
                              min: 6,
                              message: "Password must be at least 6 characters",
                            },
                          ]}
                        >
                          <Input.Password
                            size="large"
                            prefix={<LockOutlined />}
                            placeholder="Enter password"
                          />
                        </Form.Item>
                      </Col>

                      <Col xs={24} md={12}>
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
                                if (
                                  !value ||
                                  getFieldValue("password") === value
                                ) {
                                  return Promise.resolve();
                                }
                                return Promise.reject(
                                  new Error("The two passwords do not match!"),
                                );
                              },
                            }),
                          ]}
                        >
                          <Input.Password
                            size="large"
                            prefix={<LockOutlined />}
                            placeholder="Confirm password"
                          />
                        </Form.Item>
                      </Col>
                    </>
                  )}
                </Row>

                <Divider />

                <div className="section-title">Verification & Access</div>

                <div className="setting-box">
                  <div>
                    <h4>Email Verification</h4>
                    <span>
                      Indicates whether the user has successfully verified their
                      email.
                    </span>
                  </div>

                  <Form.Item
                    name="is_email_verified"
                    valuePropName="checked"
                    rules={[
                      {
                        required: true,
                        message: "Email verification status flag is required",
                      },
                    ]}
                    noStyle={false} // Turned off noStyle so validation messages have a layout slot if needed
                  >
                    <Switch />
                  </Form.Item>
                </div>

                <Divider />

                <div className="setting-box">
                  <div>
                    <h4>Account Status</h4>
                    <span>Enable or disable access to the platform.</span>
                  </div>

                  <Form.Item
                    name="is_active"
                    valuePropName="checked"
                    rules={[
                      {
                        required: true,
                        message: "Account status flag is required",
                      },
                    ]}
                    noStyle={false}
                  >
                    <Switch />
                  </Form.Item>
                </div>

                <Divider />

                <div className="security-notice">
                  <SafetyCertificateOutlined />
                  <div>
                    <strong>Security Notice</strong>
                    <p>
                      Email verification and account activation affect platform
                      access permissions immediately.
                    </p>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
}
