import React, { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "../../utility/supabaseClient";

export const ClassCreateSimple: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
    setLoading(true);
    const { data, error } = await supabaseClient
      .from("classes")
      .insert([
        {
          name: values.name,
          class_number: values.class_number,
        },
      ])
      .select();

    if (error) {
      message.error("Error al crear la clase: " + error.message);
      console.error("Error:", error);
    } else {
      message.success("Clase creada exitosamente");
      navigate("/classes");
    }
    setLoading(false);
  };

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
      <Card title="Crear Nueva Clase">
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
