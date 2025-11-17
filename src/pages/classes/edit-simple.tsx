import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { supabaseClient } from "../../utility/supabaseClient";

export const ClassEditSimple: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();

  useEffect(() => {
    loadClass();
  }, [id]);

  const loadClass = async () => {
    if (!id) return;
    setFetchLoading(true);
    const { data, error } = await supabaseClient
      .from("classes")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      message.error("Error al cargar la clase: " + error.message);
    } else if (data) {
      form.setFieldsValue(data);
    }
    setFetchLoading(false);
  };

  const onFinish = async (values: any) => {
    if (!id) return;
    setLoading(true);
    const { error } = await supabaseClient
      .from("classes")
      .update({
        name: values.name,
        class_number: values.class_number,
      })
      .eq("id", id);

    if (error) {
      message.error("Error al actualizar la clase: " + error.message);
    } else {
      message.success("Clase actualizada exitosamente");
      navigate("/classes");
    }
    setLoading(false);
  };

  if (fetchLoading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/classes")}
        >
          Volver
        </Button>
      </div>
      <Card title="Editar Clase">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Nombre de la Clase"
            name="name"
            rules={[
              {
                required: true,
                message: "Por favor ingrese el nombre de la clase",
              },
            ]}
          >
            <Input placeholder="Ej: Matemáticas" />
          </Form.Item>
          <Form.Item
            label="Número de Clase"
            name="class_number"
            rules={[
              {
                required: true,
                message: "Por favor ingrese el número de clase",
              },
            ]}
          >
            <Input placeholder="Ej: MAT-101" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Guardar
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => navigate("/classes")}
            >
              Cancelar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
