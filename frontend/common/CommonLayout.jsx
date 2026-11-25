import React from "react";
import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import CommonHeader from "./CommonHeader";
import CommonSider from "./CommonSider";
import { CommonFooter } from "./CommonFooter";
const { Content } = Layout;

export default function CommonLayout() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <CommonSider />

      <Layout>
        <CommonHeader />

        <Content
         className="content-area"
          style={{
            padding: "12px",
            background: "#fff",
            borderRadius: "8px",
            height: "calc(100vh - 88px)", // adjust according to header height
            overflowY: "auto",
          }}
        >
          <Outlet />
        <CommonFooter/>
        </Content>
      </Layout>
    </Layout>
  );
}
