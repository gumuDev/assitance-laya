import React from "react";
import { Show, TextField, DateField } from "@refinedev/antd";
import { Typography } from "antd";
import { useShow } from "@refinedev/core";
import type { IClass } from "../../interfaces";

const { Title } = Typography;

export const ClassShow: React.FC = () => {
  const { query } = useShow<IClass>();
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>ID</Title>
      <TextField value={record?.id} />

      <Title level={5}>Nombre</Title>
      <TextField value={record?.name} />

      <Title level={5}>Número de Clase</Title>
      <TextField value={record?.class_number} />

      <Title level={5}>Fecha de Creación</Title>
      <DateField value={record?.created_at} format="DD/MM/YYYY HH:mm" />

      <Title level={5}>Última Actualización</Title>
      <DateField value={record?.updated_at} format="DD/MM/YYYY HH:mm" />
    </Show>
  );
};
