import React, { useState, useEffect, useRef } from "react";
import { Card, Button, Spin, message, Tag } from "antd";
import { ArrowLeftOutlined, EditOutlined, DownloadOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { supabaseClient } from "../../utility/supabaseClient";
import type { ITeacher } from "../../interfaces";

export const TeacherShow: React.FC = () => {
  const [teacher, setTeacher] = useState<ITeacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const credentialRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTeacher();
  }, [id]);

  const loadTeacher = async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabaseClient
      .from("teachers")
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
      message.error("Error al cargar el maestro: " + error.message);
    } else {
      setTeacher(data);
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
      link.download = `credencial-${teacher?.first_name}-${teacher?.last_name}.png`;
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

  if (!teacher) {
    return (
      <div style={{ padding: 24 }}>
        <Card>Maestro no encontrado</Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/teachers")}
          style={{ marginRight: 8 }}
        >
          Volver
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/teachers/edit/${id}`)}
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

      {/* Credencial del Maestro */}
      <div ref={credentialRef} style={{
        maxWidth: 400,
        margin: "0 auto",
        background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
        borderRadius: 16,
        padding: 24,
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        color: "white",
      }}>
        <div style={{ textAlign: "center" }}>
          <h2 style={{ color: "white", marginBottom: 8, fontSize: 24 }}>MAESTRO</h2>
          <div style={{
            background: "rgba(255,255,255,0.2)",
            height: 2,
            margin: "16px 0",
          }} />

          <h1 style={{ color: "white", fontSize: 28, marginBottom: 8 }}>
            {teacher.first_name} {teacher.last_name}
          </h1>

          {teacher.classes && (
            <div style={{ fontSize: 16, marginBottom: 24, opacity: 0.95 }}>
              {teacher.classes.name} - {teacher.classes.class_number}
            </div>
          )}

          <div style={{
            background: "white",
            padding: 16,
            borderRadius: 12,
            marginBottom: 16,
          }}>
            <QRCodeSVG
              value={teacher.qr_code}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>

          <div style={{ fontSize: 12, opacity: 0.8 }}>
            ID: {teacher.id.substring(0, 8)}...
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <Card style={{ maxWidth: 400, margin: "24px auto 0" }} title="Información">
        <p><strong>Nombre completo:</strong> {teacher.first_name} {teacher.last_name}</p>
        <p><strong>Clase asignada:</strong> {teacher.classes ? (
          <Tag color="blue">{teacher.classes.name} - {teacher.classes.class_number}</Tag>
        ) : (
          <Tag>Sin asignar</Tag>
        )}</p>
        <p><strong>Código QR:</strong> {teacher.qr_code}</p>
        <p><strong>Fecha de registro:</strong> {new Date(teacher.created_at).toLocaleString("es-ES")}</p>
      </Card>
    </div>
  );
};
