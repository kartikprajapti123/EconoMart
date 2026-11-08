import React, { useState } from "react";
import { Form, Input, Button, notification } from "antd";
import { LockKeyhole, CheckCircle2, ArrowRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { createResetPasswordThunkApi } from "../../slice/Auth.Slice";
export default function ResetPassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [message, contextHolder] = notification.useNotification();
  const dispatch = useDispatch();
  const onFinish = (values) => {
    setLoading(true);
    console.log("Submitting values: ", values);
    const data = form.getFieldsValue();
    dispatch(createResetPasswordThunkApi(data))
      .unwrap()
      .then((res) => {
        setLoading(false);
        message
          .success({
            title: "Success",
            description: res.message,
          })
          form.resetFields()
          
      }).catch((error) => {
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
      <div className="reset-password-page-container">
        {/* Left Side Column: Typography & Information Details */}
        <div className="left-content-panel">
          <div className="security-core-logo">
            <span className="logo-icon">🛡️</span>
            <span className="logo-text">Security Core</span>
          </div>

          <p className="page-subtext">
            Your identity has been verified. Create a strong password to secure
            your account and regain access.
          </p>

          {/* Core Feature Checklist */}
          <div className="security-checklist">
            <div className="checklist-item">
              <div className="icon-wrapper">
                <CheckCircle2 size={18} className="check-icon" />
              </div>
              <span className="item-text">Secure password protection</span>
            </div>

            <div className="checklist-item">
              <div className="icon-wrapper">
                <CheckCircle2 size={18} className="check-icon" />
              </div>
              <span className="item-text">Enhanced account security</span>
            </div>

            <div className="checklist-item">
              <div className="icon-wrapper">
                <CheckCircle2 size={18} className="check-icon" />
              </div>
              <span className="item-text">Quick recovery process</span>
            </div>
          </div>
        </div>

        {/* Right Side Column: Isolated Card Form */}
        <div className="right-form-panel">
          <div className="form-card-wrapper">
            {/* Header Icon & Subtitles */}
            <div className="card-header-block">
              <div className="lock-icon-container">
                <LockKeyhole size={32} strokeWidth={2.5} />
              </div>
              <h2 className="card-title">Set New Password</h2>
              <p className="card-subtitle">Enter your new password below.</p>
            </div>

            {/* Input Form Module */}
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
            >
              <Form.Item
                name="old_password"
                label="Old Password"
                rules={[
                  { required: true, message: "Please enter old password" },
                  {
                    min: 8,
                    message: "Password must be at least 8 characters long",
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Enter old password"
                  className="custom-form-input"
                  prefix={
                    <LockKeyhole size={16} className="input-prefix-icon" />
                  }
                />
              </Form.Item>
              <Form.Item
                name="new_password"
                label="New Password"
                rules={[
                  { required: true, message: "Please enter a new password" },
                  {
                    min: 8,
                    message: "Password must be at least 8 characters long",
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Enter new password"
                  className="custom-form-input"
                  prefix={
                    <LockKeyhole size={16} className="input-prefix-icon" />
                  }
                />
              </Form.Item>

              <Form.Item
                name="confirm_password"
                label="Confirm Password"
                dependencies={["new_password"]}
                rules={[
                  { required: true, message: "Please confirm your password" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("new_password") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error(
                          "The two passwords that you entered do not match!",
                        ),
                      );
                    },
                  }),
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder="Confirm new password"
                  className="custom-form-input"
                  prefix={
                    <LockKeyhole size={16} className="input-prefix-icon" />
                  }
                />
              </Form.Item>

              <Form.Item className="form-action-item">
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  size="large"
                  block
                  className="btn-submit-primary"
                >
                  Reset Password <ArrowRight size={16} />
                </Button>
              </Form.Item>
            </Form>
          </div>
        </div>
      </div>
    </>
  );
}
