import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Spin, message, Tag } from "antd";
import { ArrowLeftOutlined, EditOutlined, DownloadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { supabaseClient } from "../../utility/supabaseClient";
import type { IMember } from "../../interfaces";

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
        <Button
          type="default"
          icon={<DownloadOutlined />}
          onClick={downloadCredential}
          loading={downloading}
        >
          Descargar Credencial
        </Button>
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
