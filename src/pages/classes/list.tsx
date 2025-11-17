import React from "react";
import {
  useTable,
  List,
  EditButton,
  ShowButton,
  DeleteButton,
  DateField,
} from "@refinedev/antd";
import { Table, Space, Card, Row, Col, Grid, Typography, Tag } from "antd";
import type { IClass } from "../../interfaces";

const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

export const ClassList: React.FC = () => {
  const { tableProps } = useTable<IClass>({
    resource: "classes",
    syncWithLocation: true,
  });
  const screens = useBreakpoint();

  // Vista de tarjetas para móviles y tablets
  const renderCards = () => {
    const data = tableProps?.dataSource || [];
    const loading = tableProps?.loading;

    return (
      <Row gutter={[16, 16]}>
        {loading ? (
          <Col span={24}>
            <Card loading={true} />
          </Col>
        ) : (
          data.map((record: IClass) => (
            <Col xs={24} sm={24} md={12} lg={8} key={record.id}>
              <Card
                hoverable
                style={{ borderRadius: 8 }}
                actions={[
                  <ShowButton
                    key="show"
                    size="small"
                    recordItemId={record.id}
                  >
                    Ver
                  </ShowButton>,
                  <EditButton
                    key="edit"
                    size="small"
                    recordItemId={record.id}
                  >
                    Editar
                  </EditButton>,
                  <DeleteButton
                    key="delete"
                    size="small"
                    recordItemId={record.id}
                  >
                    Eliminar
                  </DeleteButton>,
                ]}
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Nombre</Text>
                    <Title level={5} style={{ margin: '4px 0 0 0' }}>
                      {record.name}
                    </Title>
                  </div>

                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Número de Clase</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag color="blue">{record.class_number}</Tag>
                    </div>
                  </div>

                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Fecha de Creación</Text>
                    <div style={{ marginTop: 4 }}>
                      <DateField value={record.created_at} format="DD/MM/YYYY HH:mm" />
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          ))
        )}
      </Row>
    );
  };

  // Vista de tabla para escritorio
  const renderTable = () => (
    <Table
      {...tableProps}
      rowKey="id"
      scroll={{ x: 800 }}
      pagination={{
        ...tableProps.pagination,
        showSizeChanger: true,
      }}
    >
      <Table.Column
        dataIndex="name"
        title="Nombre"
        sorter
        ellipsis
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
  );

  return (
    <List canCreate>
      {screens.md ? renderTable() : renderCards()}
    </List>
  );
};
