import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";
import type { IClass } from "../../interfaces";

export const ClassCreate: React.FC = () => {
  console.log("🚀 ClassCreate component loaded - TITULO: Registrar Clases");

  const { formProps, saveButtonProps } = useForm<IClass>({
    resource: "classes",
  });

  return (
    <Create
      saveButtonProps={saveButtonProps}
      title="Registrar Clases"
      resource="classes"
    >
      <div style={{ padding: '20px', background: '#52c41a', color: 'white', marginBottom: '20px', fontSize: '18px', fontWeight: 'bold', textAlign: 'center' }}>
        ✅ NUEVO FORMULARIO ACTUALIZADO - Registrar Clases
      </div>
      <Form {...formProps} layout="vertical">
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
      </Form>
    </Create>
  );
};
