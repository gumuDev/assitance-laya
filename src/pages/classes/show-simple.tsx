import React, { useState, useEffect } from "react";
import { Card, Button, Descriptions, message, Spin } from "antd";
import { ArrowLeftOutlined, EditOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { supabaseClient } from "../../utility/supabaseClient";
import type { IClass } from "../../interfaces";

export const ClassShowSimple: React.FC = () => {
  const [classData, setClassData] = useState<IClass | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    loadClass();
  }, [id]);

  const loadClass = async () => {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabaseClient
      .from("classes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      message.error("Error al cargar la clase: " + error.message);
    } else {
      setClassData(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!classData) {
    return (
      <div style={{ padding: 24 }}>
        <Card>Clase no encontrada</Card>
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/classes")}
          style={{ marginRight: 8 }}
        >
          Volver
        </Button>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => navigate(`/classes/edit/${id}`)}
        >
          Editar
        </Button>
      </div>
      <Card title="Detalle de Clase">
        <Descriptions column={1} bordered>
          <Descriptions.Item label="ID">{classData.id}</Descriptions.Item>
          <Descriptions.Item label="Nombre">{classData.name}</Descriptions.Item>
          <Descriptions.Item label="Número de Clase">
            {classData.class_number}
          </Descriptions.Item>
          <Descriptions.Item label="Día de la Semana">
            {classData.day_of_week}
          </Descriptions.Item>
          <Descriptions.Item label="Hora de Inicio (Registro de Asistencia)">
            {classData.start_time ? classData.start_time.substring(0, 5) : "No configurado"}
          </Descriptions.Item>
          <Descriptions.Item label="Hora de Fin (Registro de Asistencia)">
            {classData.end_time ? classData.end_time.substring(0, 5) : "No configurado"}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha de Creación">
            {new Date(classData.created_at).toLocaleString("es-ES")}
          </Descriptions.Item>
          <Descriptions.Item label="Última Actualización">
            {new Date(classData.updated_at).toLocaleString("es-ES")}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};
