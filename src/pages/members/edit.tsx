import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Select, Spin } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { supabaseClient } from "../../utility/supabaseClient";
import type { IClass, IMember } from "../../interfaces";

export const MemberEdit: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [classes, setClasses] = useState<IClass[]>([]);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();

  useEffect(() => {
    loadClasses();
    loadMember();
  }, [id]);

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

  const loadMember = async () => {
    if (!id) return;
    setFetchLoading(true);
    const { data, error } = await supabaseClient
      .from("members")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      message.error("Error al cargar el miembro: " + error.message);
    } else if (data) {
      form.setFieldsValue(data);
    }
    setFetchLoading(false);
  };

  const onFinish = async (values: any) => {
    if (!id) return;
    setLoading(true);
    const { error } = await supabaseClient
      .from("members")
      .update({
        first_name: values.first_name,
        last_name: values.last_name,
        class_id: values.class_id || null,
      })
      .eq("id", id);

    if (error) {
      message.error("Error al actualizar el miembro: " + error.message);
    } else {
      message.success("Miembro actualizado exitosamente");
      navigate("/members");
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
          onClick={() => navigate("/members")}
        >
          Volver
        </Button>
      </div>
      <Card title="Editar Miembro">
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
