import React from "react";
import { SafetyCertificateOutlined } from "@ant-design/icons";
import type { TitleProps } from "@refinedev/core";

export const Title: React.FC<TitleProps> = ({ collapsed }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "flex-start",
        padding: collapsed ? "12px 0" : "12px 16px",
        fontSize: collapsed ? "24px" : "20px",
        fontWeight: "bold",
        color: "#1890ff",
        gap: collapsed ? 0 : 12,
        transition: "all 0.3s",
      }}
    >
      <SafetyCertificateOutlined style={{ fontSize: collapsed ? "28px" : "32px" }} />
      {!collapsed && (
        <span style={{ fontSize: "18px", letterSpacing: "1px" }}>
          CEABE1
        </span>
      )}
    </div>
  );
};
