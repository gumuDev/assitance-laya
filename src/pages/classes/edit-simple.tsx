import React, { useState, useEffect } from "react";
import { Form, Input, Button, Card, message, Spin, TimePicker } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { supabaseClient } from "../../utility/supabaseClient";
import dayjs from "dayjs";

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
      form.setFieldsValue({
        ...data,
        start_time: dayjs(data.start_time, "HH:mm:ss"),
        end_time: dayjs(data.end_time, "HH:mm:ss"),
      });
    }
    setFetchLoading(false);
  };

  const onFinish = async (values: any) => {
    if (!id) return;
    setLoading(true);

    // Validar que la hora de inicio sea menor que la hora de fin
    const startTime = values.start_time.format("HH:mm:ss");
    const endTime = values.end_time.format("HH:mm:ss");

    if (startTime >= endTime) {
      message.error("La hora de inicio debe ser menor que la hora de fin");
      setLoading(false);
      return;
    }

    const { error } = await supabaseClient
      .from("classes")
      .update({
        name: values.name,
        class_number: values.class_number,
        start_time: startTime,
        end_time: endTime,
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

          <Form.Item
            label="Hora de Inicio (Registro de Asistencia)"
            name="start_time"
            rules={[
              {
                required: true,
                message: "Por favor seleccione la hora de inicio",
              },
            ]}
            help="Hora desde la cual se puede registrar asistencia para esta clase"
          >
            <TimePicker
              format="HH:mm"
              placeholder="Selecciona hora de inicio"
              style={{ width: "100%" }}
            />
          </Form.Item>

          <Form.Item
            label="Hora de Fin (Registro de Asistencia)"
            name="end_time"
            rules={[
              {
                required: true,
                message: "Por favor seleccione la hora de fin",
              },
            ]}
            help="Hora hasta la cual se puede registrar asistencia para esta clase"
          >
            <TimePicker
              format="HH:mm"
              placeholder="Selecciona hora de fin"
              style={{ width: "100%" }}
            />
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
