import React from "react";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/antd";
import { Table, Space } from "antd";
import type { IClass } from "../../interfaces";

export const ClassList: React.FC = () => {
  const { tableProps } = useTable<IClass>({
    syncWithLocation: true,
  });

  return (
    <List>
      <Table {...tableProps} rowKey="id">
        <Table.Column
          dataIndex="name"
          title="Nombre"
          sorter
        />
        <Table.Column
          dataIndex="class_number"
          title="Número de Clase"
          sorter
        />
        <Table.Column
          dataIndex="created_at"
          title="Fecha de Creación"
          render={(value: string) => <DateField value={value} format="DD/MM/YYYY HH:mm" />}
          sorter
        />
        <Table.Column
          title="Acciones"
          dataIndex="actions"
          render={(_, record: IClass) => (
            <Space>
              <ShowButton hideText size="small" recordItemId={record.id} />
              <EditButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
