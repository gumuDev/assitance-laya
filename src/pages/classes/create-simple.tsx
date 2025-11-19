import React, { useState } from "react";
import { Form, Input, Button, Card, message, TimePicker } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { supabaseClient } from "../../utility/supabaseClient";
import dayjs from "dayjs";

export const ClassCreateSimple: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values: any) => {
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
      .insert([
        {
          name: values.name,
          class_number: values.class_number,
          start_time: startTime,
          end_time: endTime,
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
          initialValues={{
            start_time: dayjs("07:00", "HH:mm"),
            end_time: dayjs("13:00", "HH:mm"),
          }}
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
