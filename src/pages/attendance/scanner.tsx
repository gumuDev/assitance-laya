import React, { useEffect, useRef, useState } from "react";
import { Card, Alert, Tag, Spin, Button, Typography } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, CameraOutlined } from "@ant-design/icons";
import { BrowserMultiFormatReader } from "@zxing/library";
import { supabaseClient } from "../../utility/supabaseClient";
import type { ITeacher, IMember } from "../../interfaces";

const { Paragraph } = Typography;

type ScanResult = {
  success: boolean;
  message: string;
  personName?: string;
  personType?: "teacher" | "member";
  className?: string;
};

export const AttendanceScanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    // Solicitar permiso y luego iniciar escaneo
    requestCameraPermission();

    return () => {
      stopScanning();
    };
  }, []);

  const requestCameraPermission = async () => {
    try {
      // Intentar obtener permiso explícitamente primero
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Usar cámara trasera en móviles
      });

      // Detener el stream temporal
      stream.getTracks().forEach(track => track.stop());

      // Ahora iniciar el escáner
      startScanning();
    } catch (error: any) {
      console.error("Error al solicitar permiso:", error);

      let errorMessage = "Error al acceder a la cámara";
      let instructions = "";

      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage = "⚠️ Permiso de cámara denegado";
        instructions = `
Para usar esta función, necesitas permitir el acceso a la cámara:

📱 **Chrome Android:**
1. Toca el candado 🔒 en la barra de dirección
2. Toca "Permisos" o "Configuración del sitio"
3. Busca "Cámara" y selecciona "Permitir"
4. Toca el botón "Activar Cámara" abajo

⚠️ **IMPORTANTE:**
Si accedes desde tu teléfono a otra computadora (IP de red), Chrome requiere HTTPS por seguridad.

**Solución:** Usa la app directamente en la computadora donde está el servidor (http://localhost:5173)
        `;
      } else if (error.name === "NotFoundError") {
        errorMessage = "❌ No se encontró ninguna cámara";
        instructions = "Este dispositivo no tiene cámara disponible.";
      } else if (error.name === "NotReadableError") {
        errorMessage = "⚠️ Cámara en uso";
        instructions = "Cierra otras aplicaciones que estén usando la cámara e intenta de nuevo.";
      } else if (error.name === "NotSupportedError" || window.location.protocol === "http:" && window.location.hostname !== "localhost") {
        errorMessage = "🔒 Conexión no segura detectada";
        instructions = `
Los navegadores requieren HTTPS para usar la cámara cuando accedes remotamente.

**Estás accediendo por:** ${window.location.protocol}//${window.location.host}

**Opciones:**
1. ✅ Usa la app en la misma computadora: http://localhost:5173
2. 🌐 Usa ngrok para HTTPS: https://ngrok.com
3. 📱 Usa la laptop con dos pestañas (más fácil para probar)
        `;
      } else {
        instructions = `
Error técnico: ${error.message}

Si el problema persiste, intenta:
1. Recargar la página
2. Limpiar caché del navegador
3. Usar otro navegador
4. Acceder desde la misma computadora (localhost)
        `;
      }

      setLastResult({
        success: false,
        message: errorMessage + "\n\n" + instructions,
      });
    }
  };

  const startScanning = async () => {
    try {
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      const videoInputDevices = await codeReader.listVideoInputDevices();

      if (videoInputDevices.length === 0) {
        setLastResult({
          success: false,
          message: "No se encontró ninguna cámara en el dispositivo",
        });
        return;
      }

      // Preferir cámara trasera en móviles
      let selectedDeviceId = videoInputDevices[0].deviceId;
      const backCamera = videoInputDevices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('rear') ||
        device.label.toLowerCase().includes('trasera')
      );
      if (backCamera) {
        selectedDeviceId = backCamera.deviceId;
      }

      setScanning(true);

      codeReader.decodeFromVideoDevice(
        selectedDeviceId,
        videoRef.current!,
        async (result) => {
          if (result && !processing) {
            const qrCode = result.getText();
            console.log("QR detectado:", qrCode);
            await handleQRCode(qrCode);
          }
        }
      );
    } catch (error: any) {
      console.error("Error al iniciar el escáner:", error);
      setLastResult({
        success: false,
        message: "Error al iniciar el escáner. Por favor, recarga la página e intenta de nuevo.",
      });
    }
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
    }
    setScanning(false);
  };

  const handleQRCode = async (qrCode: string) => {
    setProcessing(true);

    // Pausar el escaneo mientras procesamos
    stopScanning();

    try {
      // 1. Buscar en maestros
      const { data: teacher } = await supabaseClient
        .from("teachers")
        .select(`
          *,
          classes (
            id,
            name,
            class_number
          )
        `)
        .eq("qr_code", qrCode)
        .single();

      if (teacher) {
        await registerAttendance(teacher, "teacher");
        setProcessing(false);
        // Esperar 3 segundos antes de reanudar escaneo
        setTimeout(() => {
          setLastResult(null);
          startScanning();
        }, 3000);
        return;
      }

      // 2. Buscar en miembros
      const { data: member } = await supabaseClient
        .from("members")
        .select(`
          *,
          classes (
            id,
            name,
            class_number
          )
        `)
        .eq("qr_code", qrCode)
        .single();

      if (member) {
        await registerAttendance(member, "member");
        setProcessing(false);
        // Esperar 3 segundos antes de reanudar escaneo
        setTimeout(() => {
          setLastResult(null);
          startScanning();
        }, 3000);
        return;
      }

      // 3. QR no encontrado
      setLastResult({
        success: false,
        message: "Código QR no válido. No se encontró ningún maestro o miembro con este código.",
      });

      setProcessing(false);
      // Esperar 3 segundos antes de reanudar escaneo
      setTimeout(() => {
        setLastResult(null);
        startScanning();
      }, 3000);
    } catch (error) {
      console.error("Error al procesar QR:", error);
      setLastResult({
        success: false,
        message: "Error al procesar el código QR",
      });

      setProcessing(false);
      // Esperar 3 segundos antes de reanudar escaneo
      setTimeout(() => {
        setLastResult(null);
        startScanning();
      }, 3000);
    }
  };

  const registerAttendance = async (
    person: ITeacher | IMember,
    type: "teacher" | "member"
  ) => {
    try {
      // Verificar si ya registró asistencia hoy
      const today = new Date().toISOString().split("T")[0];

      const { data: existingAttendance } = await supabaseClient
        .from("attendance")
        .select("*")
        .eq("person_type", type)
        .eq("person_id", person.id)
        .eq("date", today)
        .single();

      if (existingAttendance) {
        setLastResult({
          success: false,
          message: `⚠️ ${person.first_name} ${person.last_name} ya registró asistencia hoy a las ${new Date(existingAttendance.timestamp).toLocaleTimeString("es-ES")}`,
          personName: `${person.first_name} ${person.last_name}`,
          personType: type,
          className: person.classes ? `${person.classes.name} - ${person.classes.class_number}` : undefined,
        });
        return;
      }

      // Registrar asistencia
      const { error } = await supabaseClient
        .from("attendance")
        .insert([
          {
            person_type: type,
            person_id: person.id,
            class_id: person.class_id,
            date: today,
          },
        ]);

      if (error) {
        throw error;
      }

      setLastResult({
        success: true,
        message: "✅ ¡Asistencia registrada exitosamente!",
        personName: `${person.first_name} ${person.last_name}`,
        personType: type,
        className: person.classes ? `${person.classes.name} - ${person.classes.class_number}` : undefined,
      });
    } catch (error: any) {
      console.error("Error al registrar asistencia:", error);
      setLastResult({
        success: false,
        message: "Error al registrar asistencia: " + error.message,
      });
      setTimeout(() => setLastResult(null), 5000);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>📸 Registrar Asistencia</h1>
      <p style={{ marginBottom: 24 }}>
        Escanea el código QR de la credencial para registrar asistencia
      </p>

      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        {/* Video de la cámara */}
        <Card>
          <div style={{
            position: "relative",
            width: "100%",
            paddingBottom: "75%",
            background: "#000",
            borderRadius: 8,
            overflow: "hidden",
          }}>
            <video
              ref={videoRef}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
            {!scanning && (
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                color: "white",
                textAlign: "center",
              }}>
                <CameraOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                <div>Iniciando cámara...</div>
              </div>
            )}
            {processing && (
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                background: "rgba(0,0,0,0.7)",
                padding: 20,
                borderRadius: 8,
              }}>
                <Spin size="large" />
              </div>
            )}
          </div>

          <div style={{ marginTop: 16, textAlign: "center" }}>
            {scanning ? (
              <Tag color="green" icon={<CheckCircleOutlined />}>
                Cámara activa - Listo para escanear
              </Tag>
            ) : (
              <Tag color="orange">Iniciando cámara...</Tag>
            )}
          </div>
        </Card>

        {/* Resultado del último escaneo */}
        {lastResult && (
          <div style={{ marginTop: 24 }}>
            <Alert
              type={lastResult.success ? "success" : "error"}
              message={lastResult.success ? lastResult.message : <strong>{lastResult.message.split('\n')[0]}</strong>}
              description={
                <>
                  {lastResult.personName && (
                    <div style={{ marginTop: 8 }}>
                      <p><strong>Persona:</strong> {lastResult.personName}</p>
                      <p><strong>Tipo:</strong> {" "}
                        <Tag color={lastResult.personType === "teacher" ? "blue" : "green"}>
                          {lastResult.personType === "teacher" ? "MAESTRO" : "MIEMBRO"}
                        </Tag>
                      </p>
                      {lastResult.className && (
                        <p><strong>Clase:</strong> {lastResult.className}</p>
                      )}
                      <p><strong>Hora:</strong> {new Date().toLocaleTimeString("es-ES")}</p>
                    </div>
                  )}
                  {!lastResult.success && lastResult.message.includes('\n') && (
                    <Paragraph style={{ marginTop: 12, whiteSpace: "pre-line" }}>
                      {lastResult.message.split('\n').slice(1).join('\n')}
                    </Paragraph>
                  )}
                  {!lastResult.success && (
                    <Button
                      type="primary"
                      icon={<CameraOutlined />}
                      onClick={() => {
                        setLastResult(null);
                        stopScanning();
                        setTimeout(requestCameraPermission, 500);
                      }}
                      style={{ marginTop: 12 }}
                      size="large"
                    >
                      Activar Cámara
                    </Button>
                  )}
                </>
              }
              showIcon
              icon={lastResult.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
            />
          </div>
        )}

        <Card style={{ marginTop: 24 }} title="Instrucciones">
          <ol>
            <li>Permite el acceso a la cámara cuando el navegador lo solicite</li>
            <li>Coloca el código QR de la credencial frente a la cámara</li>
            <li>El sistema registrará la asistencia automáticamente</li>
            <li>Solo se puede registrar una asistencia por persona por día</li>
          </ol>
        </Card>
      </div>
    </div>
  );
};
