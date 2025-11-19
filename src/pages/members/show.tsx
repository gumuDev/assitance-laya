import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Spin, message, Tag, Dropdown } from "antd";
import { ArrowLeftOutlined, EditOutlined, DownloadOutlined, QrcodeOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import { supabaseClient } from "../../utility/supabaseClient";
import type { IMember } from "../../interfaces";
import type { MenuProps } from "antd";

export const MemberShow: React.FC = () => {
  const [member, setMember] = useState<IMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const credentialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMember();
  }, [id]);

  const loadMember = async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabaseClient
      .from("members")
      .select(`
        *,
        classes (
          id,
          name,
          class_number
        )
      `)
      .eq("id", id)
      .single();

    if (error) {
      message.error("Error al cargar el miembro: " + error.message);
    } else {
      setMember(data);
    }
    setLoading(false);
  };

  const downloadCredential = async () => {
    if (!credentialRef.current) return;

    setDownloading(true);
    try {
      const canvas = await html2canvas(credentialRef.current, {
        scale: 3,
        backgroundColor: "#ffffff",
      });

      const link = document.createElement("a");
      link.download = `credencial-${member?.first_name}-${member?.last_name}.png`;
      link.href = canvas.toDataURL();
      link.click();

      message.success("Credencial descargada exitosamente");
    } catch (error) {
      message.error("Error al descargar la credencial");
      console.error(error);
    }
    setDownloading(false);
  };

  const downloadQROnly = () => {
    if (!member) return;

    try {
      // Crear un SVG temporal solo con el QR
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "400");
      svg.setAttribute("height", "400");
      svg.setAttribute("viewBox", "0 0 400 400");

      // Crear un fondo blanco
      const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      rect.setAttribute("width", "400");
      rect.setAttribute("height", "400");
      rect.setAttribute("fill", "white");
      svg.appendChild(rect);

      // Crear el QR usando QRCodeSVG manualmente
      const qrContainer = document.createElement("div");
      qrContainer.style.position = "absolute";
      qrContainer.style.left = "-9999px";
      document.body.appendChild(qrContainer);

      // Renderizar QR temporal
      const tempDiv = document.createElement("div");
      qrContainer.appendChild(tempDiv);

      // Usar canvas para generar la imagen del QR
      const canvas = document.createElement("canvas");
      canvas.width = 400;
      canvas.height = 400;
      const ctx = canvas.getContext("2d");

      if (ctx) {
        // Fondo blanco
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, 400, 400);

        // Generar QR en un canvas temporal
        QRCode.toCanvas(canvas, member.qr_code, {
          width: 400,
          margin: 2,
          errorCorrectionLevel: "H",
        }, (error: any) => {
          if (error) {
            message.error("Error al generar el código QR");
            console.error(error);
          } else {
            const link = document.createElement("a");
            link.download = `qr-${member.first_name}-${member.last_name}.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
            message.success("Código QR descargado exitosamente");
          }
          document.body.removeChild(qrContainer);
        });
      }
    } catch (error) {
      message.error("Error al descargar el código QR");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!member) {
    return (
      <div style={{ padding: 24 }}>
        <Card>Miembro no encontrado</Card>
      </div>
    );
  }

  const downloadMenuItems: MenuProps['items'] = [
    {
      key: 'credential',
      label: 'Credencial Completa',
      icon: <DownloadOutlined />,
      onClick: downloadCredential,
    },
    {
      key: 'qr',
      label: 'Solo Código QR',
      icon: <QrcodeOutlined />,
      onClick: downloadQROnly,
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/members")}
          style={{ marginRight: 8 }}
        >
          Volver
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/members/edit/${id}`)}
          style={{ marginRight: 8 }}
        >
          Editar
        </Button>
        <Dropdown menu={{ items: downloadMenuItems }} placement="bottomRight">
          <Button
            type="default"
            icon={<DownloadOutlined />}
            loading={downloading}
          >
            Descargar
          </Button>
        </Dropdown>
      </div>

      {/* Credencial del Miembro con fondo verde */}
      <div ref={credentialRef} style={{
        maxWidth: 400,
        margin: "0 auto",
        background: "linear-gradient(135deg, #52c41a 0%, #389e0d 100%)",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        color: "white",
      }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "white", marginBottom: 8, fontSize: 24 }}>MIEMBRO</h2>
          <div style={{
            background: "rgba(255,255,255,0.2)",
            height: 2,
            margin: "16px 0",
          }} />

          <h1 style={{ color: "white", fontSize: 28, marginBottom: 8 }}>
            {member.first_name} {member.last_name}
          </h1>

          {member.classes && (
            <div style={{ fontSize: 16, marginBottom: 24, opacity: 0.95 }}>
              {member.classes.name} - {member.classes.class_number}
            </div>
          )}

          <div style={{
            background: "white",
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
          }}>
            <QRCodeSVG
              value={member.qr_code}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          <div style={{ fontSize: 12, opacity: 0.8 }}>
            ID: {member.id.substring(0, 8)}...
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <Card style={{ maxWidth: 400, margin: "24px auto 0" }} title="Información">
        <p><strong>Nombre completo:</strong> {member.first_name} {member.last_name}</p>
        <p><strong>Clase asignada:</strong> {member.classes ? (
          <Tag color="green">{member.classes.name} - {member.classes.class_number}</Tag>
        ) : (
          <Tag>Sin asignar</Tag>
        )}</p>
        <p><strong>Código QR:</strong> {member.qr_code}</p>
        <p><strong>Fecha de registro:</strong> {new Date(member.created_at).toLocaleString("es-ES")}</p>
      </Card>
    </div>
  );
};
