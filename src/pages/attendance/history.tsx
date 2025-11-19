import React, { useEffect, useState } from "react";
import { Table, Card, DatePicker, Select, Button, Space, Tag, Statistic, Row, Col, Dropdown, Grid, Typography } from "antd";
import type { MenuProps } from "antd";
import { DownloadOutlined, UserOutlined, TeamOutlined, CalendarOutlined, FileExcelOutlined, CalendarFilled, ClockCircleOutlined, ProjectOutlined, FilterOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import * as XLSX from "xlsx";
import { supabaseClient } from "../../utility/supabaseClient";
import type { IAttendance, IClass, ITeacher, IMember } from "../../interfaces";

dayjs.extend(quarterOfYear);

const { RangePicker } = DatePicker;
const { useBreakpoint } = Grid;
const { Text, Title } = Typography;

export const AttendanceHistory: React.FC = () => {
  const [attendances, setAttendances] = useState<IAttendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
    dayjs().subtract(30, "days"),
    dayjs(),
  ]);
  const [classFilter, setClassFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [personFilter, setPersonFilter] = useState<string | null>(null);
  const [classes, setClasses] = useState<IClass[]>([]);
  const [teachers, setTeachers] = useState<ITeacher[]>([]);
  const [members, setMembers] = useState<IMember[]>([]);
  const [activeQuickFilter, setActiveQuickFilter] = useState<"month" | "quarter" | "year" | "custom">("custom");
  const screens = useBreakpoint();

  useEffect(() => {
    loadClasses();
    loadTeachers();
    loadMembers();
  }, []);

  useEffect(() => {
    loadAttendances();
  }, [dateRange, classFilter, typeFilter, personFilter]);

  const loadClasses = async () => {
    const { data, error } = await supabaseClient
      .from("classes")
      .select("*")
      .order("name");

    if (!error && data) {
      setClasses(data);
    }
  };

  const loadTeachers = async () => {
    const { data, error } = await supabaseClient
      .from("teachers")
      .select("*")
      .order("first_name");

    if (!error && data) {
      setTeachers(data);
    }
  };

  const loadMembers = async () => {
    const { data, error} = await supabaseClient
      .from("members")
      .select("*")
      .order("first_name");

    if (!error && data) {
      setMembers(data);
    }
  };

  const loadAttendances = async () => {
    setLoading(true);

    let query = supabaseClient
      .from("attendance")
      .select(`
        *,
        classes (
          id,
          name,
          class_number
        )
      `)
      .gte("date", dateRange[0].format("YYYY-MM-DD"))
      .lte("date", dateRange[1].format("YYYY-MM-DD"))
      .order("timestamp", { ascending: false });

    if (classFilter) {
      query = query.eq("class_id", classFilter);
    }

    if (typeFilter) {
      query = query.eq("person_type", typeFilter);
    }

    if (personFilter) {
      query = query.eq("person_id", personFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error loading attendances:", error);
    } else if (data) {
      // Cargar información de maestros y miembros
      const attendancesWithPeople = await Promise.all(
        data.map(async (att) => {
          if (att.person_type === "teacher") {
            const { data: teacher } = await supabaseClient
              .from("teachers")
              .select("*")
              .eq("id", att.person_id)
              .single();
            return { ...att, teachers: teacher };
          } else {
            const { data: member } = await supabaseClient
              .from("members")
              .select("*")
              .eq("id", att.person_id)
              .single();
            return { ...att, members: member };
          }
        })
      );

      setAttendances(attendancesWithPeople);
    }

    setLoading(false);
  };

  const exportToExcel = () => {
    // Preparar datos
    const excelData = attendances.map((att) => {
      const person = att.person_type === "teacher" ? att.teachers : att.members;
      return {
        Fecha: dayjs(att.timestamp).format("DD/MM/YYYY"),
        Hora: dayjs(att.timestamp).format("HH:mm:ss"),
        Nombre: person ? `${person.first_name} ${person.last_name}` : "N/A",
        Tipo: att.person_type === "teacher" ? "Maestro" : "Miembro",
        Clase: att.classes ? `${att.classes.name} - ${att.classes.class_number}` : "N/A",
      };
    });

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajustar ancho de columnas
    ws["!cols"] = [
      { wch: 12 }, // Fecha
      { wch: 10 }, // Hora
      { wch: 30 }, // Nombre
      { wch: 10 }, // Tipo
      { wch: 30 }, // Clase
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Asistencias");

    // Descargar
    XLSX.writeFile(wb, `Asistencias_${dayjs().format("YYYY-MM-DD")}.xlsx`);
  };

  const exportByClass = () => {
    // Agrupar por clase
    const groupedByClass: Record<string, IAttendance[]> = {};

    attendances.forEach((att) => {
      const className = att.classes
        ? `${att.classes.name} - ${att.classes.class_number}`
        : "Sin clase";

      if (!groupedByClass[className]) {
        groupedByClass[className] = [];
      }
      groupedByClass[className].push(att);
    });

    // Crear libro de Excel
    const wb = XLSX.utils.book_new();

    // Hoja de resumen
    const summaryData = Object.entries(groupedByClass).map(([className, atts]) => ({
      Clase: className,
      "Total Asistencias": atts.length,
      Maestros: atts.filter((a) => a.person_type === "teacher").length,
      Miembros: atts.filter((a) => a.person_type === "member").length,
      "Personas Únicas": new Set(atts.map((a) => a.person_id)).size,
    }));

    const summaryWs = XLSX.utils.json_to_sheet(summaryData);
    summaryWs["!cols"] = [{ wch: 30 }, { wch: 18 }, { wch: 12 }, { wch: 12 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, summaryWs, "Resumen por Clase");

    // Hoja con detalle de cada clase
    Object.entries(groupedByClass).forEach(([className, atts]) => {
      const classData = atts.map((att) => {
        const person = att.person_type === "teacher" ? att.teachers : att.members;
        return {
          Fecha: dayjs(att.timestamp).format("DD/MM/YYYY"),
          Hora: dayjs(att.timestamp).format("HH:mm:ss"),
          Nombre: person ? `${person.first_name} ${person.last_name}` : "N/A",
          Tipo: att.person_type === "teacher" ? "Maestro" : "Miembro",
        };
      });

      const ws = XLSX.utils.json_to_sheet(classData);
      ws["!cols"] = [{ wch: 12 }, { wch: 10 }, { wch: 30 }, { wch: 10 }];

      // Nombre de hoja válido (máximo 31 caracteres)
      const sheetName = className.substring(0, 31);
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
    });

    // Descargar
    XLSX.writeFile(wb, `Reporte_Por_Clases_${dayjs().format("YYYY-MM-DD")}.xlsx`);
  };

  const setQuickDateRange = (type: "month" | "quarter" | "year") => {
    const now = dayjs();
    let start: Dayjs;

    switch (type) {
      case "month":
        start = now.startOf("month");
        break;
      case "quarter":
        start = now.startOf("quarter");
        break;
      case "year":
        start = now.startOf("year");
        break;
    }

    setDateRange([start, now]);
    setActiveQuickFilter(type);
  };

  const quickFilterMenu: MenuProps = {
    items: [
      {
        key: "month",
        icon: <CalendarFilled />,
        label: "Este Mes",
        onClick: () => setQuickDateRange("month"),
      },
      {
        key: "quarter",
        icon: <ClockCircleOutlined />,
        label: "Este Trimestre",
        onClick: () => setQuickDateRange("quarter"),
      },
      {
        key: "year",
        icon: <ProjectOutlined />,
        label: "Este Año",
        onClick: () => setQuickDateRange("year"),
      },
    ],
  };

  // Vista de tarjetas para móviles
  const renderCards = () => (
    <Row gutter={[16, 16]}>
      {loading ? (
        <Col span={24}>
          <Card loading={true} />
        </Col>
      ) : attendances.length === 0 ? (
        <Col span={24}>
          <Card>
            <Text type="secondary">No hay registros de asistencia en el rango seleccionado</Text>
          </Card>
        </Col>
      ) : (
        attendances.map((record) => {
          const person = record.person_type === "teacher" ? record.teachers : record.members;
          return (
            <Col xs={24} sm={24} md={12} lg={8} key={record.id}>
              <Card
                hoverable
                style={{ borderRadius: 8 }}
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Fecha y Hora</Text>
                    <Title level={5} style={{ margin: '4px 0 0 0' }}>
                      {dayjs(record.timestamp).format("DD/MM/YYYY HH:mm:ss")}
                    </Title>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Nombre</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text strong>
                        {person ? `${person.first_name} ${person.last_name}` : "N/A"}
                      </Text>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Tipo</Text>
                    <div style={{ marginTop: 4 }}>
                      <Tag color={record.person_type === "teacher" ? "blue" : "green"}>
                        {record.person_type === "teacher" ? "MAESTRO" : "MIEMBRO"}
                      </Tag>
                    </div>
                  </div>
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>Clase</Text>
                    <div style={{ marginTop: 4 }}>
                      <Text>
                        {record.classes
                          ? `${record.classes.name} - ${record.classes.class_number}`
                          : "N/A"}
                      </Text>
                    </div>
                  </div>
                </Space>
              </Card>
            </Col>
          );
        })
      )}
    </Row>
  );

  const columns = [
    {
      title: "Fecha",
      dataIndex: "timestamp",
      key: "date",
      render: (timestamp: string) => dayjs(timestamp).format("DD/MM/YYYY"),
      width: 120,
    },
    {
      title: "Hora",
      dataIndex: "timestamp",
      key: "time",
      render: (timestamp: string) => dayjs(timestamp).format("HH:mm:ss"),
      width: 100,
    },
    {
      title: "Nombre",
      key: "name",
      render: (_: any, record: IAttendance) => {
        const person = record.person_type === "teacher" ? record.teachers : record.members;
        return person ? `${person.first_name} ${person.last_name}` : "N/A";
      },
    },
    {
      title: "Tipo",
      dataIndex: "person_type",
      key: "type",
      width: 120,
      render: (type: string) => (
        <Tag color={type === "teacher" ? "blue" : "green"}>
          {type === "teacher" ? "MAESTRO" : "MIEMBRO"}
        </Tag>
      ),
    },
    {
      title: "Clase",
      key: "class",
      render: (_: any, record: IAttendance) => {
        if (record.classes) {
          return `${record.classes.name} - ${record.classes.class_number}`;
        }
        return "N/A";
      },
    },
  ];

  // Calcular estadísticas
  const totalAttendances = attendances.length;
  const teacherAttendances = attendances.filter((a) => a.person_type === "teacher").length;
  const memberAttendances = attendances.filter((a) => a.person_type === "member").length;
  const uniquePeople = new Set(attendances.map((a) => a.person_id)).size;

  return (
    <div style={{ padding: 24 }}>
      <h1>📊 Historial de Asistencia</h1>

      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Asistencias"
              value={totalAttendances}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Maestros"
              value={teacherAttendances}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Miembros"
              value={memberAttendances}
              prefix={<TeamOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Personas Únicas"
              value={uniquePeople}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card style={{ marginBottom: 16 }} title="Filtros y Reportes">
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {/* Filtros rápidos de fecha */}
          <div>
            <Space wrap>
              <Dropdown menu={quickFilterMenu} placement="bottomLeft">
                <Button icon={<FilterOutlined />}>
                  Filtros Rápidos
                  {activeQuickFilter !== "custom" && (
                    <Tag color="blue" style={{ marginLeft: 8 }}>
                      {activeQuickFilter === "month" && "Mes"}
                      {activeQuickFilter === "quarter" && "Trimestre"}
                      {activeQuickFilter === "year" && "Año"}
                    </Tag>
                  )}
                </Button>
              </Dropdown>

              <RangePicker
                value={dateRange}
                onChange={(dates) => {
                  if (dates && dates[0] && dates[1]) {
                    setDateRange([dates[0], dates[1]]);
                    setActiveQuickFilter("custom");
                  }
                }}
                format="DD/MM/YYYY"
                placeholder={["Fecha inicio", "Fecha fin"]}
              />
            </Space>
          </div>

          {/* Filtros por clase y tipo */}
          <div>
            <Space wrap>
              <Select
                style={{ width: 200 }}
                placeholder="Filtrar por clase"
                allowClear
                value={classFilter}
                onChange={(value) => {
                  setClassFilter(value);
                  setPersonFilter(null); // Limpiar filtro de persona al cambiar clase
                }}
                options={[
                  { label: "Todas las clases", value: null },
                  ...classes.map((c) => ({
                    label: `${c.name} - ${c.class_number}`,
                    value: c.id,
                  })),
                ]}
              />

              <Select
                style={{ width: 150 }}
                placeholder="Filtrar por tipo"
                allowClear
                value={typeFilter}
                onChange={(value) => {
                  setTypeFilter(value);
                  setPersonFilter(null); // Limpiar filtro de persona al cambiar tipo
                }}
                options={[
                  { label: "Todos", value: null },
                  { label: "Maestros", value: "teacher" },
                  { label: "Miembros", value: "member" },
                ]}
              />

              <Select
                style={{ width: 250 }}
                placeholder="Filtrar por persona"
                allowClear
                showSearch
                value={personFilter}
                onChange={setPersonFilter}
                filterOption={(input, option) =>
                  (option?.label?.toString() ?? "").toLowerCase().includes(input.toLowerCase())
                }
                options={[
                  { label: "Todas las personas", value: null },
                  ...(typeFilter === "teacher" || typeFilter === null
                    ? teachers.map((t) => ({
                        label: `👨‍🏫 ${t.first_name} ${t.last_name}`,
                        value: t.id,
                      }))
                    : []),
                  ...(typeFilter === "member" || typeFilter === null
                    ? members.map((m) => ({
                        label: `👤 ${m.first_name} ${m.last_name}`,
                        value: m.id,
                      }))
                    : []),
                ]}
              />
            </Space>
          </div>

          {/* Botones de exportación */}
          <div>
            <Space wrap>
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={exportToExcel}
                disabled={attendances.length === 0}
              >
                Exportar Detalle a Excel
              </Button>

              <Button
                icon={<FileExcelOutlined />}
                onClick={exportByClass}
                disabled={attendances.length === 0}
                style={{ background: "#52c41a", color: "white" }}
              >
                Exportar Reporte por Clases
              </Button>
            </Space>
          </div>
        </Space>
      </Card>

      {/* Tabla de asistencias */}
      <Card>
        {/* Renderiza tabla en escritorio, cards en móvil */}
        {screens.md ? (
          <Table
            dataSource={attendances}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 20,
              showTotal: (total) => `Total: ${total} registros`,
            }}
          />
        ) : (
          renderCards()
        )}
      </Card>
    </div>
  );
};
