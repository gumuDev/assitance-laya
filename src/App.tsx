import { Refine } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import {
  ErrorComponent,
  ThemedLayoutV2,
  useNotificationProvider,
} from "@refinedev/antd";
import { dataProvider } from "@refinedev/supabase";
import { BrowserRouter, Outlet, Route, Routes, Navigate } from "react-router-dom";
import { ConfigProvider } from "antd";
import esES from "antd/locale/es_ES";
import "@refinedev/antd/dist/reset.css";

import { supabaseClient } from "./utility/supabaseClient";
import { ClassListSimple } from "./pages/classes/list-simple";
import { ClassCreateSimple } from "./pages/classes/create-simple";
import { ClassEditSimple } from "./pages/classes/edit-simple";
import { ClassShowSimple } from "./pages/classes/show-simple";
import { TeacherList, TeacherCreate, TeacherEdit, TeacherShow } from "./pages/teachers";
import { MemberList, MemberCreate, MemberEdit, MemberShow } from "./pages/members";
import { AttendanceScanner, AttendanceHistory } from "./pages/attendance";

function App() {
  return (
    <BrowserRouter>
      <ConfigProvider locale={esES}>
        <RefineKbarProvider>
          <Refine
            dataProvider={dataProvider(supabaseClient)}
            notificationProvider={useNotificationProvider}
            resources={[
              {
                name: "classes",
                list: "/classes",
                create: "/classes/create",
                edit: "/classes/edit/:id",
                show: "/classes/show/:id",
                meta: {
                  label: "Clases",
                },
              },
              {
                name: "teachers",
                list: "/teachers",
                create: "/teachers/create",
                edit: "/teachers/edit/:id",
                show: "/teachers/show/:id",
                meta: {
                  label: "Maestros",
                },
              },
              {
                name: "members",
                list: "/members",
                create: "/members/create",
                edit: "/members/edit/:id",
                show: "/members/show/:id",
                meta: {
                  label: "Miembros",
                },
              },
              {
                name: "attendance",
                list: "/attendance",
                meta: {
                  label: "Registrar Asistencia",
                },
              },
              {
                name: "history",
                list: "/history",
                meta: {
                  label: "Historial de Asistencia",
                },
              },
            ]}
          >
            <Routes>
              <Route
                element={
                  <ThemedLayoutV2>
                    <Outlet />
                  </ThemedLayoutV2>
                }
              >
                <Route index element={<Navigate to="/history" replace />} />

                <Route path="/classes">
                  <Route index element={<ClassListSimple />} />
                  <Route path="create" element={<ClassCreateSimple />} />
                  <Route path="edit/:id" element={<ClassEditSimple />} />
                  <Route path="show/:id" element={<ClassShowSimple />} />
                </Route>

                <Route path="/teachers">
                  <Route index element={<TeacherList />} />
                  <Route path="create" element={<TeacherCreate />} />
                  <Route path="edit/:id" element={<TeacherEdit />} />
                  <Route path="show/:id" element={<TeacherShow />} />
                </Route>

                <Route path="/members">
                  <Route index element={<MemberList />} />
                  <Route path="create" element={<MemberCreate />} />
                  <Route path="edit/:id" element={<MemberEdit />} />
                  <Route path="show/:id" element={<MemberShow />} />
                </Route>

                <Route path="/attendance">
                  <Route index element={<AttendanceScanner />} />
                </Route>

                <Route path="/history">
                  <Route index element={<AttendanceHistory />} />
                </Route>

                <Route path="*" element={<ErrorComponent />} />
              </Route>
            </Routes>
            <RefineKbar />
          </Refine>
        </RefineKbarProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

export default App;
