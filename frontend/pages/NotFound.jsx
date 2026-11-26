import React from "react";
import { Button, Typography, Space, Breadcrumb } from "antd";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeftOutlined, 
  HomeOutlined, 
  ShoppingOutlined, 
  QuestionCircleOutlined 
} from "@ant-design/icons";

const { Title, Text } = Typography;

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="enterprise-error-scope">
      {/* BACKGROUND DECORATIVE GRID */}
      <div className="error-grid-overlay" />

      <div className="error-content-wrapper">
        {/* CONTEXT NAVIGATION */}
        <Breadcrumb 
          className="error-breadcrumb"
          items={[
            { title: <span onClick={() => navigate("/product-showcase")} className="crumb-link">System</span> },
            { title: "Status" },
            { title: "404 Error" }
          ]}
        />

        {/* HERO ERROR BRANDING */}
        <div className="error-code-badge">HTTP 404</div>
        
        <Title level={1} className="error-main-title">
          Resource Not Found
        </Title>
        
        <Text className="error-description">
          The requested URL path does not correspond to an active system endpoint. 
          It may have been permanently relocated, archived, or typed incorrectly.
        </Text>

        <div className="error-divider" />

        {/* CORE INTERACTIVE ACTIONS */}
        <div className="error-actions-deck">
          <Button 
            type="primary" 
            size="large"
            icon={<HomeOutlined />}
            className="error-primary-btn"
            onClick={() => navigate("/")}
          >
            Return to Home Page
          </Button>

          <Button 
            type="default" 
            size="large"
            icon={<ArrowLeftOutlined />}
            className="error-secondary-btn"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>

        {/* SYSTEM SUGGESTIONS SECTION */}
        <div className="error-suggestions-panel">
          <h4 className="suggestion-heading">Suggested Actions:</h4>
          <ul className="suggestion-list">
            <li onClick={() => navigate("/product-showcase")}>
              <ShoppingOutlined className="suggestion-icon" /> 
              <span>Browse active commercial product catalog</span>
            </li>
            <li>
              <QuestionCircleOutlined className="suggestion-icon" /> 
              <span>Contact customer support desk if you believe this is an infrastructure error</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}