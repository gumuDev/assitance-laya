import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tooltip } from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { supabaseClient } from "../../utility/supabaseClient";
import type { IClass } from "../../interfaces";

export const ClassListSimple: React.FC = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from("classes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading classes:", error);
    } else {
      setClasses(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar esta clase?")) {
      const { error } = await supabaseClient
        .from("classes")
        .delete()
        .eq("id", id);

      if (error) {
        alert("Error al eliminar: " + error.message);
      } else {
        loadClasses();
      }
    }
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Número de Clase",
      dataIndex: "class_number",
      key: "class_number",
    },
    {
      title: "Fecha de Creación",
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => new Date(date).toLocaleString("es-ES"),
    },
    {
      title: "Acciones",
      key: "actions",
      render: (_: any, record: IClass) => (
        <Space>
          <Tooltip title="Ver">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => window.location.href = `/classes/show/${record.id}`}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              onClick={() => window.location.href = `/classes/edit/${record.id}`}
            />
          </Tooltip>
          <Tooltip title="Eliminar">
            <Button
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Clases</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => window.location.href = "/classes/create"}
        >
          Crear Clase
        </Button>
      </div>
      <Table
        dataSource={classes}
        columns={columns}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};
