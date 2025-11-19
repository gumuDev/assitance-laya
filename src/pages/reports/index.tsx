import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  DatePicker,
  Select,
  Button,
  Space,
  Row,
  Col,
  Statistic,
  Typography,
  Dropdown,
  Tag,
  Spin,
  Table,
  Tabs,
} from "antd";
import type { MenuProps } from "antd";
import {
  DownloadOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  FilterOutlined,
  CalendarFilled,
  ClockCircleOutlined,
  ProjectOutlined,
  TrophyOutlined,
  CrownOutlined,
} from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title as ChartTitle,
  Tooltip,
  Legend,
} from "chart.js";
import type { ChartOptions } from "chart.js";
import { Bar, Line, Pie } from "react-chartjs-2";
import { supabaseClient } from "../../utility/supabaseClient";
import type { IAttendance, IClass, ITeacher, IMember } from "../../interfaces";

dayjs.extend(quarterOfYear);

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  ChartTitle,
  Tooltip,
  Legend
);

const { RangePicker } = DatePicker;
const { Title, Text } = Typography;

export const Reports: React.FC = () => {
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
  const [activeQuickFilter, setActiveQuickFilter] = useState<
    "month" | "quarter" | "year" | "custom"
  >("custom");
  const [rankingView, setRankingView] = useState<"classes" | "teachers" | "members">("classes");
  const [mainView, setMainView] = useState<"rankings" | "charts">("rankings");

  // Referencias para los gráficos
  const barChartRef = useRef<any>(null);
  const lineChartRef = useRef<any>(null);
  const pieChartRef = useRef<any>(null);

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
    const { data, error } = await supabaseClient
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
      setAttendances(data);
    }

    setLoading(false);
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

  // Función para descargar gráfico como imagen
  const downloadChart = (chartRef: any, fileName: string) => {
    if (chartRef.current) {
      const link = document.createElement("a");
      link.download = `${fileName}_${dayjs().format("YYYY-MM-DD")}.png`;
      link.href = chartRef.current.toBase64Image();
      link.click();
    }
  };

  // Datos para gráfico de barras - Asistencia por clase
  const getBarChartData = () => {
    const attendanceByClass: Record<string, number> = {};

    attendances.forEach((att) => {
      const className = att.classes
        ? `${att.classes.name} - ${att.classes.class_number}`
        : "Sin clase";

      attendanceByClass[className] = (attendanceByClass[className] || 0) + 1;
    });

    const labels = Object.keys(attendanceByClass);
    const data = Object.values(attendanceByClass);

    // Calcular porcentajes
    const total = data.reduce((sum, val) => sum + val, 0);
    const percentages = data.map((val) => Math.round((val / total) * 100));

    return {
      labels,
      datasets: [
        {
          label: "Porcentaje de Asistencia",
          data: percentages,
          backgroundColor: "rgba(54, 162, 235, 0.8)",
          borderColor: "rgba(54, 162, 235, 1)",
          borderWidth: 1,
        },
      ],
    };
  };

  // Datos para gráfico de líneas - Tendencia temporal
  const getLineChartData = () => {
    const attendanceByDate: Record<string, number> = {};

    attendances.forEach((att) => {
      const date = dayjs(att.date).format("DD/MM/YYYY");
      attendanceByDate[date] = (attendanceByDate[date] || 0) + 1;
    });

    // Ordenar por fecha
    const sortedEntries = Object.entries(attendanceByDate).sort((a, b) => {
      const dateA = dayjs(a[0], "DD/MM/YYYY");
      const dateB = dayjs(b[0], "DD/MM/YYYY");
      return dateA.isBefore(dateB) ? -1 : 1;
    });

    const labels = sortedEntries.map((entry) => entry[0]);
    const data = sortedEntries.map((entry) => entry[1]);

    return {
      labels,
      datasets: [
        {
          label: "Asistencias por día",
          data,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
        },
      ],
    };
  };

  // Datos para gráfico circular - Maestros vs Miembros
  const getPieChartData = () => {
    const teacherCount = attendances.filter(
      (a) => a.person_type === "teacher"
    ).length;
    const memberCount = attendances.filter(
      (a) => a.person_type === "member"
    ).length;

    return {
      labels: ["Maestros", "Miembros"],
      datasets: [
        {
          label: "Distribución",
          data: [teacherCount, memberCount],
          backgroundColor: [
            "rgba(54, 162, 235, 0.8)",
            "rgba(75, 192, 192, 0.8)",
          ],
          borderColor: ["rgba(54, 162, 235, 1)", "rgba(75, 192, 192, 1)"],
          borderWidth: 1,
        },
      ],
    };
  };

  // Opciones para gráfico de barras
  const barChartOptions: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Asistencia por Clase (%)",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + "%";
          },
        },
      },
    },
  };

  // Opciones para gráfico de líneas
  const lineChartOptions: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Tendencia de Asistencias",
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  // Opciones para gráfico circular
  const pieChartOptions: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        position: "top",
      },
      title: {
        display: true,
        text: "Distribución Maestros vs Miembros",
        font: {
          size: 16,
        },
      },
    },
  };

  // Funciones para calcular rankings
  const getTopClasses = () => {
    const attendanceByClass: Record<string, { count: number; name: string }> = {};

    attendances.forEach((att) => {
      if (att.class_id && att.classes) {
        const className = `${att.classes.name} - ${att.classes.class_number}`;
        if (!attendanceByClass[att.class_id]) {
          attendanceByClass[att.class_id] = { count: 0, name: className };
        }
        attendanceByClass[att.class_id].count++;
      }
    });

    const sorted = Object.entries(attendanceByClass)
      .map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const maxCount = sorted[0]?.count || 1;
    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
      percentage: Math.round((item.count / maxCount) * 100),
    }));
  };

  const getTopTeachers = () => {
    const attendanceByTeacher: Record<string, { count: number; name: string }> = {};

    attendances
      .filter((att) => att.person_type === "teacher")
      .forEach((att) => {
        const teacher = teachers.find((t) => t.id === att.person_id);
        if (teacher) {
          const name = `${teacher.first_name} ${teacher.last_name}`;
          if (!attendanceByTeacher[att.person_id]) {
            attendanceByTeacher[att.person_id] = { count: 0, name };
          }
          attendanceByTeacher[att.person_id].count++;
        }
      });

    const sorted = Object.entries(attendanceByTeacher)
      .map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const maxCount = sorted[0]?.count || 1;
    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
      percentage: Math.round((item.count / maxCount) * 100),
    }));
  };

  const getTopMembers = () => {
    const attendanceByMember: Record<string, { count: number; name: string }> = {};

    attendances
      .filter((att) => att.person_type === "member")
      .forEach((att) => {
        const member = members.find((m) => m.id === att.person_id);
        if (member) {
          const name = `${member.first_name} ${member.last_name}`;
          if (!attendanceByMember[att.person_id]) {
            attendanceByMember[att.person_id] = { count: 0, name };
          }
          attendanceByMember[att.person_id].count++;
        }
      });

    const sorted = Object.entries(attendanceByMember)
      .map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const maxCount = sorted[0]?.count || 1;
    return sorted.map((item, index) => ({
      ...item,
      rank: index + 1,
      percentage: Math.round((item.count / maxCount) * 100),
    }));
  };

  // Calcular estadísticas
  const totalAttendances = attendances.length;
  const teacherAttendances = attendances.filter(
    (a) => a.person_type === "teacher"
  ).length;
  const memberAttendances = attendances.filter(
    (a) => a.person_type === "member"
  ).length;
  const uniqueClasses = new Set(
    attendances.map((a) => a.class_id).filter(Boolean)
  ).size;

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <BarChartOutlined /> Reportes y Gráficos
      </Title>

      {/* Estadísticas */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Asistencias"
              value={totalAttendances}
              prefix={<BarChartOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Maestros"
              value={teacherAttendances}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Miembros"
              value={memberAttendances}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Clases Diferentes" value={uniqueClasses} />
          </Card>
        </Col>
      </Row>

      {/* Filtros */}
      <Card style={{ marginBottom: 16 }} title="Filtros">
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
                onChange={setClassFilter}
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
                  setPersonFilter(null);
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
                  (option?.label?.toString() ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
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
        </Space>
      </Card>

      {loading ? (
        <Card>
          <div style={{ textAlign: "center", padding: 50 }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>
              <Text>Cargando datos...</Text>
            </div>
          </div>
        </Card>
      ) : attendances.length === 0 ? (
        <Card>
          <div style={{ textAlign: "center", padding: 50 }}>
            <Text type="secondary">
              No hay datos para mostrar en el rango seleccionado
            </Text>
          </div>
        </Card>
      ) : (
        <Card>
          <Tabs
            activeKey={mainView}
            onChange={(key) => setMainView(key as "rankings" | "charts")}
            size="large"
            items={[
              {
                key: "rankings",
                label: (
                  <span>
                    <TrophyOutlined /> Rankings
                  </span>
                ),
                children: (
                  <Card
                    title={
                      <Space>
                        <CrownOutlined />
                        <span>Rankings Top 10</span>
                      </Space>
                    }
                    bordered={false}
                  >
                    <Tabs
                      activeKey={rankingView}
                      onChange={(key) => setRankingView(key as "classes" | "teachers" | "members")}
                      items={[
                        {
                          key: "classes",
                          label: "Por Clase",
                          children: (
                            <Table
                              dataSource={getTopClasses()}
                              rowKey="id"
                              pagination={false}
                              columns={[
                                {
                                  title: "Posición",
                                  dataIndex: "rank",
                                  key: "rank",
                                  width: 100,
                                  render: (rank: number) => {
                                    if (rank === 1) return <span style={{ fontSize: 20 }}>🥇 {rank}</span>;
                                    if (rank === 2) return <span style={{ fontSize: 20 }}>🥈 {rank}</span>;
                                    if (rank === 3) return <span style={{ fontSize: 20 }}>🥉 {rank}</span>;
                                    return <span>{rank}</span>;
                                  },
                                },
                                {
                                  title: "Clase",
                                  dataIndex: "name",
                                  key: "name",
                                },
                                {
                                  title: "Total de Asistencias",
                                  dataIndex: "count",
                                  key: "count",
                                  align: "center",
                                },
                                {
                                  title: "Porcentaje",
                                  dataIndex: "percentage",
                                  key: "percentage",
                                  align: "center",
                                  render: (percentage: number) => (
                                    <Tag color={percentage === 100 ? "gold" : "blue"}>
                                      {percentage}%
                                    </Tag>
                                  ),
                                },
                              ]}
                            />
                          ),
                        },
                        {
                          key: "teachers",
                          label: "Por Maestro",
                          children: (
                            <Table
                              dataSource={getTopTeachers()}
                              rowKey="id"
                              pagination={false}
                              columns={[
                                {
                                  title: "Posición",
                                  dataIndex: "rank",
                                  key: "rank",
                                  width: 100,
                                  render: (rank: number) => {
                                    if (rank === 1) return <span style={{ fontSize: 20 }}>🥇 {rank}</span>;
                                    if (rank === 2) return <span style={{ fontSize: 20 }}>🥈 {rank}</span>;
                                    if (rank === 3) return <span style={{ fontSize: 20 }}>🥉 {rank}</span>;
                                    return <span>{rank}</span>;
                                  },
                                },
                                {
                                  title: "Maestro",
                                  dataIndex: "name",
                                  key: "name",
                                  render: (name: string) => (
                                    <span>
                                      👨‍🏫 {name}
                                    </span>
                                  ),
                                },
                                {
                                  title: "Total de Asistencias",
                                  dataIndex: "count",
                                  key: "count",
                                  align: "center",
                                },
                                {
                                  title: "Porcentaje",
                                  dataIndex: "percentage",
                                  key: "percentage",
                                  align: "center",
                                  render: (percentage: number) => (
                                    <Tag color={percentage === 100 ? "gold" : "blue"}>
                                      {percentage}%
                                    </Tag>
                                  ),
                                },
                              ]}
                            />
                          ),
                        },
                        {
                          key: "members",
                          label: "Por Miembro",
                          children: (
                            <Table
                              dataSource={getTopMembers()}
                              rowKey="id"
                              pagination={false}
                              columns={[
                                {
                                  title: "Posición",
                                  dataIndex: "rank",
                                  key: "rank",
                                  width: 100,
                                  render: (rank: number) => {
                                    if (rank === 1) return <span style={{ fontSize: 20 }}>🥇 {rank}</span>;
                                    if (rank === 2) return <span style={{ fontSize: 20 }}>🥈 {rank}</span>;
                                    if (rank === 3) return <span style={{ fontSize: 20 }}>🥉 {rank}</span>;
                                    return <span>{rank}</span>;
                                  },
                                },
                                {
                                  title: "Miembro",
                                  dataIndex: "name",
                                  key: "name",
                                  render: (name: string) => (
                                    <span>
                                      👤 {name}
                                    </span>
                                  ),
                                },
                                {
                                  title: "Total de Asistencias",
                                  dataIndex: "count",
                                  key: "count",
                                  align: "center",
                                },
                                {
                                  title: "Porcentaje",
                                  dataIndex: "percentage",
                                  key: "percentage",
                                  align: "center",
                                  render: (percentage: number) => (
                                    <Tag color={percentage === 100 ? "gold" : "green"}>
                                      {percentage}%
                                    </Tag>
                                  ),
                                },
                              ]}
                            />
                          ),
                        },
                      ]}
                    />
                  </Card>
                ),
              },
              {
                key: "charts",
                label: (
                  <span>
                    <BarChartOutlined /> Gráficos
                  </span>
                ),
                children: (
                  <>
                    {/* Gráfico de Barras - Asistencia por Clase */}
                    <Card
            style={{ marginBottom: 16 }}
            title={
              <Space>
                <BarChartOutlined />
                <span>Asistencia por Clase</span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() =>
                  downloadChart(barChartRef, "Asistencia_por_Clase")
                }
              >
                Descargar
              </Button>
            }
          >
            <Bar ref={barChartRef} data={getBarChartData()} options={barChartOptions} />
          </Card>

          {/* Gráfico de Líneas - Tendencia Temporal */}
          <Card
            style={{ marginBottom: 16 }}
            title={
              <Space>
                <LineChartOutlined />
                <span>Tendencia de Asistencias</span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() =>
                  downloadChart(lineChartRef, "Tendencia_Asistencias")
                }
              >
                Descargar
              </Button>
            }
          >
            <Line
              ref={lineChartRef}
              data={getLineChartData()}
              options={lineChartOptions}
            />
          </Card>

          {/* Gráfico Circular - Maestros vs Miembros */}
          <Card
            title={
              <Space>
                <PieChartOutlined />
                <span>Distribución Maestros vs Miembros</span>
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<DownloadOutlined />}
                onClick={() =>
                  downloadChart(pieChartRef, "Distribucion_Maestros_Miembros")
                }
              >
                Descargar
              </Button>
            }
          >
            <Row justify="center">
              <Col xs={24} sm={20} md={16} lg={12}>
                <Pie
                  ref={pieChartRef}
                  data={getPieChartData()}
                  options={pieChartOptions}
                />
              </Col>
            </Row>
          </Card>
        </>
                ),
              },
            ]}
          />
        </Card>
      )}
    </div>
  );
};
