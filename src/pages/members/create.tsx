import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Select } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "../../utility/supabaseClient";
import type { IClass } from "../../interfaces";

export const MemberCreate: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<IClass[]>([]);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    const { data, error } = await supabaseClient
      .from("classes")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error loading classes:", error);
    } else {
      setClasses(data || []);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    const { error } = await supabaseClient
      .from("members")
      .insert([
        {
          first_name: values.first_name,
          last_name: values.last_name,
          class_id: values.class_id || null,
        },
      ])
      .select();

    if (error) {
      message.error("Error al registrar el miembro: " + error.message);
      console.error("Error:", error);
    } else {
      message.success("Miembro registrado exitosamente");
      navigate("/members");
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/members")}
        >
          Volver
        </Button>
      </div>
      <Card title="Registrar Nuevo Miembro">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Nombre"
            name="first_name"
            rules={[
              {
                required: true,
                message: "Por favor ingrese el nombre",
              },
            ]}
          >
            <Input placeholder="Ej: María" />
          </Form.Item>
          <Form.Item
            label="Apellido"
            name="last_name"
            rules={[
              {
                required: true,
                message: "Por favor ingrese el apellido",
              },
            ]}
          >
            <Input placeholder="Ej: García" />
          </Form.Item>
          <Form.Item
            label="Clase Asignada"
            name="class_id"
            rules={[
              {
                required: true,
                message: "Por favor seleccione una clase",
              },
            ]}
          >
            <Select
              placeholder="Seleccione una clase"
              options={classes.map((c) => ({
                label: `${c.name} - ${c.class_number}`,
                value: c.id,
              }))}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Guardar
            </Button>
            <Button
              style={{ marginLeft: 8 }}
              onClick={() => navigate("/members")}
            >
              Cancelar
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
