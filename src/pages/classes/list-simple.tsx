import React, { useEffect, useState } from "react";
import { Table, Button, Space, Tooltip, Card, Row, Col, Grid, Typography, Tag } from "antd";
import { PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { supabaseClient } from "../../utility/supabaseClient";
import type { IClass } from "../../interfaces";

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

export const ClassListSimple: React.FC = () => {
  const [classes, setClasses] = useState<IClass[]>([]);
  const [loading, setLoading] = useState(true);
  const screens = useBreakpoint();

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

  // Vista de tarjetas para móviles
  const renderCards = () => (
    <Row gutter={[16, 16]}>
      {loading ? (
        <Col span={24}>
          <Card loading={true} />
        </Col>
      ) : (
        classes.map((record) => (
          <Col xs={24} sm={24} md={12} lg={8} key={record.id}>
            <Card
              hoverable
              style={{ borderRadius: 8 }}
              actions={[
                <Tooltip title="Ver" key="view">
                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => window.location.href = `/classes/show/${record.id}`}
                  />
                </Tooltip>,
                <Tooltip title="Editar" key="edit">
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => window.location.href = `/classes/edit/${record.id}`}
                  />
                </Tooltip>,
                <Tooltip title="Eliminar" key="delete">
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record.id)}
                  />
                </Tooltip>,
              ]}
            >
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Nombre</Text>
                  <Title level={5} style={{ margin: '4px 0 0 0' }}>
                    {record.name}
                  </Title>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Número de Clase</Text>
                  <div style={{ marginTop: 4 }}>
                    <Tag color="blue">{record.class_number}</Tag>
                  </div>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Fecha de Creación</Text>
                  <div style={{ marginTop: 4 }}>
                    <Text>{new Date(record.created_at).toLocaleString("es-ES")}</Text>
                  </div>
                </div>
              </Space>
            </Card>
          </Col>
        ))
      )}
    </Row>
  );

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

      {/* Renderiza tabla en escritorio, cards en móvil */}
      {screens.md ? (
        <Table
          dataSource={classes}
          columns={columns}
          rowKey="id"
          loading={loading}
        />
      ) : (
        renderCards()
      )}
    </div>
  );
};
