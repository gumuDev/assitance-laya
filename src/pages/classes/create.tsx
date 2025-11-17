import React from "react";
import { Create, useForm } from "@refinedev/antd";
import { Form, Input } from "antd";
import type { IClass } from "../../interfaces";

export const ClassCreate: React.FC = () => {
  const { formProps, saveButtonProps } = useForm<IClass>();

  return (
    <Create saveButtonProps={saveButtonProps}>
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
