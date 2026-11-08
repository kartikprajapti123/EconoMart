import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  Card,
  Row,
  Col,
  Badge,
  Divider,
  Space,
  ConfigProvider,
  Alert,
  notification,
} from "antd";
import { useDispatch, useSelector } from "react-redux";
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Settings,
  Camera,
  Save,
  ArrowLeft,
  LockKeyhole,
} from "lucide-react";
import {
  getSingleUserThunkApi,
  updateUserThunkApi,
} from "../../slice/User.Slice";

const { Option } = Select;
// Modern enterprise theme tokens matching your UI dashboard identity

const EditProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [message, contextHolder] = notification.useNotification();
  const dispatch = useDispatch();
  const user_detail=useSelector((state)=>state.user.user_detail)
  const handleAvatarChange = (info) => {
    const file = info.file.originFileObj;

    if (file) {
      setProfileImage(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    getSinglUser();
  }, []);

  const getSinglUser = () => {
    dispatch(getSingleUserThunkApi())
      .unwrap()
      .then((res) => {
        form.setFieldsValue(res.data);
        setImageUrl(res.data.profile_image);
      })
      .catch((error) => {
        message.error({
          title: "Error",
          description: error,
        });
      });
  };
  const onFinish = () => {
    setLoading(true);
    const formData = new FormData();
    formData.append("user_data", JSON.stringify(form.getFieldsValue()));
    if (profileImage) {
      formData.append("profile_image", profileImage);
    }
    dispatch(updateUserThunkApi({ id: user_detail.id, data: formData }))
      .unwrap()
      .then((res) => {
        setLoading(false);
        message.success({
          title: "Success",
          description: res.message,
        });
        form.setFieldValue(res.data)
        setImageUrl(res.data.profile_image)
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
      <div className="profile-page-container">
        {/* Top Professional Action Bar */}
        <div className="profile-header-bar">
          <Space size="middle">
            <Button
  type="text"
  icon={<Settings size={18} className="btn-back-icon" />}
  className="btn-back"
/>
            <div>
              <h1 className="profile-title">Account Settings</h1>
              <span className="profile-subtitle">
                Manage your public profile identity and contact parameters
              </span>
            </div>
          </Space>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          requiredMark={true}
        >
          <Row gutter={[32, 32]}>
            {/* Left Column: Profile Avatar Status Card */}
            <Col xs={24} lg={8}>
              <Card bordered={false} className="avatar-card">
                <div className="avatar-upload-wrapper">
                  <Upload
                    name="profile_image"
                    listType="picture-circle"
                    showUploadList={false}
                    beforeUpload={() => true}
                    onChange={handleAvatarChange}
                  >
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt="avatar"
                        className="avatar-preview-img"
                      />
                    ) : (
                      <div className="avatar-fallback-initials">
                        {user_detail?.username?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div className="avatar-camera-badge">
                      <Camera size={14} />
                    </div>
                  </Upload>
                </div>

                <h2 className="user-display-name"></h2>

                <div className="user-badge-wrapper">
                  <Badge
                    count={user_detail.user_type}
                    className="user-role-badge"
                  />
                </div>

                <Divider className="card-divider" />

                <div className="system-status-list">
                  <div className="status-item">
                    <span>System Status</span>
                    <span className="status-active-dot">● {user_detail.is_active ? "Active" : "InActive"}</span>
                  </div>
                  <div className="status-item">
                    <span>Authentication Level</span>
                    <span className="status-level-text">
                      Root {user_detail.user_type}
                    </span>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Right Column: Profile Details Form Card */}
            <Col xs={24} lg={16}>
              <Card
                title={<span className="form-card-title">Profile Details</span>}
                bordered={false}
              >
                {/* Section 2: Modifiable Parameters */}
                <h3 className="form-section-heading">
                  Modifiable Account Details
                </h3>
                <Row gutter={20}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="username" label="Display Profile Name">
                      <Input
                        prefix={<User size={16} className="input-field-icon" />}
                        placeholder="Enter display name"
                        size="large"
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} sm={12}>
                    <Form.Item name="phone_number" label="Contact Number">
                      <Input
                        prefix={
                          <Phone size={16} className="input-field-icon" />
                        }
                        placeholder="Enter contact number"
                        size="large"
                      />
                    </Form.Item>
                  </Col>
                </Row>
                {/* Security Restriction Callout Box */}
                <Divider className="form-section-divider" />

                {/* Section 1: Read-Only System Properties */}
                <h3 className="form-section-heading">
                  System Identity Parameters
                </h3>
                <Row gutter={20}>
                  <Col xs={24} sm={12}>
                    <Form.Item
                      name="email"
                      label="Email Address (Account Username)"
                    >
                      <Input
                        prefix={<Mail size={16} className="input-field-icon" />}
                        disabled
                        size="large"
                        suffix={
                          user_detail.is_email_verified ? (
                            <Space size={4} className="email-verified-badge">
                              <ShieldCheck size={14} /> Verified
                            </Space>
                          ) : null
                        }
                      />
                    </Form.Item>
                  </Col>

                </Row>

                <Alert
                  className="security-notice-alert"
                  message="Restricted Account Information"
                  description="Certain account details such as your Email Address and User Role cannot be modified from this page. These fields are managed by the system to maintain account integrity and prevent issues with authentication, permissions, and related platform functionality."
                  type="info"
                  showIcon
                  icon={
                    <LockKeyhole size={18} className="security-alert-icon" />
                  }
                />
                {/* Action Footer Button Group */}
                <div className="form-action-footer">
                  <Space size="middle">
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      icon={<Save size={16} />}
                      size="large"
                      className="btn-submit"
                    >
                      Save Settings
                    </Button>
                  </Space>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>
      </div>
    </>
  );
};

export default EditProfile;
