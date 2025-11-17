import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tooltip, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, QrcodeOutlined } from "@ant-design/icons";
import { supabaseClient } from "../../utility/supabaseClient";
import type { IMember } from "../../interfaces";

export const MemberList: React.FC = () => {
  const [members, setMembers] = useState<IMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
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
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading members:", error);
    } else {
      setMembers(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de eliminar este miembro?")) {
      const { error } = await supabaseClient
        .from("members")
        .delete()
        .eq("id", id);

      if (error) {
        alert("Error al eliminar: " + error.message);
      } else {
        loadMembers();
      }
    }
  };

  const columns = [
    {
      title: "Nombre",
      key: "name",
      render: (_: any, record: IMember) => (
        `${record.first_name} ${record.last_name}`
      ),
    },
    {
      title: "Clase Asignada",
      key: "class",
      render: (_: any, record: IMember) => {
        if (record.classes) {
          return (
            <Tag color="green">
              {record.classes.name} - {record.classes.class_number}
            </Tag>
          );
        }
        return <Tag>Sin asignar</Tag>;
      },
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
      render: (_: any, record: IMember) => (
        <Space>
          <Tooltip title="Ver Credencial">
            <Button
              type="primary"
              icon={<QrcodeOutlined />}
              onClick={() => window.location.href = `/members/show/${record.id}`}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              icon={<EditOutlined />}
              onClick={() => window.location.href = `/members/edit/${record.id}`}
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
        <h1>Miembros</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => window.location.href = "/members/create"}
        >
          Registrar Miembro
        </Button>
      </div>
      <Table
        dataSource={members}
        columns={columns}
        rowKey="id"
        loading={loading}
      />
    </div>
  );
};
