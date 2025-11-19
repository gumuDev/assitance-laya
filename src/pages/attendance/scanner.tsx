import React, { useEffect, useRef, useState } from "react";
import { Card, Alert, Tag, Spin, Button, Typography, Upload, Divider, Row, Col } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, CameraOutlined, UploadOutlined, FileImageOutlined } from "@ant-design/icons";
import { BrowserMultiFormatReader, BrowserQRCodeReader } from "@zxing/library";
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

  // Auto-ocultar solo mensajes de éxito después de 3 segundos
  useEffect(() => {
    if (lastResult && lastResult.success) {
      const timer = setTimeout(() => {
        setLastResult(null);
        if (!scanning) {
          startScanning();
        }
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [lastResult]);

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

  const handleImageUpload = async (file: File) => {
    setProcessing(true);

    try {
      const codeReader = new BrowserQRCodeReader();

      // Crear URL del archivo para decodificar directamente
      const imageUrl = URL.createObjectURL(file);

      try {
        // Método 1: Intentar decodificar directamente desde la URL del archivo
        console.log("Intentando leer QR desde archivo...");
        const result = await codeReader.decodeFromImageUrl(imageUrl);

        if (result) {
          const qrCode = result.getText();
          console.log("✅ QR detectado desde imagen:", qrCode);
          URL.revokeObjectURL(imageUrl); // Limpiar URL
          await handleQRCode(qrCode);
          return false;
        }
      } catch (error1) {
        console.log("Método 1 falló, intentando método alternativo...", error1);

        // Método 2: Intentar con imagen element
        try {
          const img = new Image();
          img.src = imageUrl;

          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
          });

          console.log("Imagen cargada, intentando decodificar...");
          const result2 = await codeReader.decodeFromImageElement(img);

          if (result2) {
            const qrCode = result2.getText();
            console.log("✅ QR detectado desde elemento imagen:", qrCode);
            URL.revokeObjectURL(imageUrl); // Limpiar URL
            await handleQRCode(qrCode);
            return false;
          }
        } catch (error2) {
          console.log("Método 2 falló, intentando método con canvas...", error2);

          // Método 3: Usar canvas manualmente
          try {
            const img = new Image();
            img.src = imageUrl;

            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
            });

            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');

            if (!context) {
              throw new Error("No se pudo crear el contexto del canvas");
            }

            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);

            console.log("Canvas creado, intentando decodificar...");

            // Usar BrowserMultiFormatReader como última opción
            const multiReader = new BrowserMultiFormatReader();
            const result3 = await multiReader.decodeFromImageElement(img);

            if (result3) {
              const qrCode = result3.getText();
              console.log("✅ QR detectado con MultiFormatReader:", qrCode);
              URL.revokeObjectURL(imageUrl); // Limpiar URL
              await handleQRCode(qrCode);
              return false;
            }
          } catch (error3) {
            console.error("Todos los métodos fallaron:", error3);
            throw new Error("No se pudo detectar un código QR en la imagen");
          }
        }
      }

      URL.revokeObjectURL(imageUrl); // Limpiar URL
      throw new Error("No se detectó ningún código QR");

    } catch (error: any) {
      console.error("❌ Error al procesar la imagen:", error);
      setLastResult({
        success: false,
        message: "No se pudo detectar un código QR en la imagen.\n\nAsegúrate de que:\n- La imagen contenga un código QR visible y claro\n- El QR no esté borroso o pixelado\n- La imagen tenga buena iluminación\n- El QR ocupe una buena parte de la imagen",
      });
      setProcessing(false);
    }

    return false; // Prevenir upload automático
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
            class_number,
            start_time,
            end_time
          )
        `)
        .eq("qr_code", qrCode)
        .single();

      if (teacher) {
        await registerAttendance(teacher, "teacher");
        setProcessing(false);
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
            class_number,
            start_time,
            end_time
          )
        `)
        .eq("qr_code", qrCode)
        .single();

      if (member) {
        await registerAttendance(member, "member");
        setProcessing(false);
        return;
      }

      // 3. QR no encontrado
      setLastResult({
        success: false,
        message: "Código QR no válido. No se encontró ningún maestro o miembro con este código.",
      });

      setProcessing(false);
    } catch (error) {
      console.error("Error al procesar QR:", error);
      setLastResult({
        success: false,
        message: "Error al procesar el código QR",
      });

      setProcessing(false);
    }
  };

  const registerAttendance = async (
    person: ITeacher | IMember,
    type: "teacher" | "member"
  ) => {
    try {
      // 1. Validar que la persona tenga una clase asignada
      if (!person.classes) {
        setLastResult({
          success: false,
          message: `⚠️ ${person.first_name} ${person.last_name} no tiene clase asignada\n\nPor favor, asigna una clase a esta persona antes de registrar asistencia.`,
          personName: `${person.first_name} ${person.last_name}`,
          personType: type,
        });
        return;
      }

      // 2. Validar horario permitido según la clase
      const now = new Date();
      const currentTime = now.toTimeString().split(" ")[0]; // HH:MM:SS
      const classStartTime = person.classes.start_time;
      const classEndTime = person.classes.end_time;

      console.log("=== VALIDACIÓN DE HORARIO ===");
      console.log("Hora actual:", currentTime);
      console.log("Inicio clase:", classStartTime);
      console.log("Fin clase:", classEndTime);
      console.log("Clase:", person.classes.name);

      // Normalizar tiempos a formato HH:MM:SS para comparación correcta
      const normalizeTime = (time: string) => {
        // Si el tiempo ya tiene formato HH:MM:SS, devolverlo
        if (time.split(':').length === 3) return time;
        // Si solo tiene HH:MM, agregar :00
        if (time.split(':').length === 2) return `${time}:00`;
        return time;
      };

      const normalizedStartTime = normalizeTime(classStartTime);
      const normalizedEndTime = normalizeTime(classEndTime);

      console.log("Inicio normalizado:", normalizedStartTime);
      console.log("Fin normalizado:", normalizedEndTime);

      if (currentTime < normalizedStartTime || currentTime > normalizedEndTime) {
        const startTime = classStartTime.substring(0, 5); // HH:MM
        const endTime = classEndTime.substring(0, 5); // HH:MM
        console.log("❌ FUERA DE HORARIO");
        setLastResult({
          success: false,
          message: `⏰ Fuera de horario permitido\n\nLa clase "${person.classes.name} - ${person.classes.class_number}" permite registro de asistencia entre las ${startTime} y las ${endTime}.\n\nHora actual: ${now.toLocaleTimeString("es-ES")}`,
          personName: `${person.first_name} ${person.last_name}`,
          personType: type,
          className: `${person.classes.name} - ${person.classes.class_number}`,
        });
        return;
      }

      console.log("✅ DENTRO DE HORARIO - Continuando con registro...");

      // 3. Verificar si ya registró asistencia hoy
      const today = new Date().toISOString().split("T")[0];

      const { data: existingAttendance } = await supabaseClient
        .from("attendance")
        .select("*")
        .eq("person_type", type)
        .eq("person_id", person.id)
        .eq("date", today)
        .maybeSingle();

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
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>📸 Registrar Asistencia</h1>
      <p style={{ marginBottom: 24 }}>
        Escanea el código QR de la credencial para registrar asistencia
      </p>

      <Row gutter={[24, 24]}>
        {/* Columna Izquierda: Scanner y Opciones */}
        <Col xs={24} lg={14}>
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

          {/* Opción alternativa: Subir imagen */}
          <Card style={{ marginTop: 24 }} title={<><FileImageOutlined /> Opción Alternativa</>}>
            <p style={{ marginBottom: 16 }}>
              Si la cámara no funciona, puedes subir una imagen del código QR:
            </p>
            <Upload
              accept="image/*"
              beforeUpload={handleImageUpload}
              showUploadList={false}
              disabled={processing}
            >
              <Button
                icon={<UploadOutlined />}
                size="large"
                block
                disabled={processing}
                loading={processing}
              >
                {processing ? "Procesando imagen..." : "Subir Imagen del QR"}
              </Button>
            </Upload>
            <p style={{ marginTop: 12, fontSize: 12, color: "#888" }}>
              Formatos soportados: JPG, PNG, JPEG. La imagen debe contener un código QR visible.
            </p>
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
                    <Button
                      type="primary"
                      onClick={() => {
                        setLastResult(null);
                        if (!scanning) {
                          startScanning();
                        }
                      }}
                      style={{ marginTop: 12 }}
                      size="large"
                      block
                    >
                      Aceptar
                    </Button>
                  </>
                }
                showIcon
                icon={lastResult.success ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
              />
            </div>
          )}
        </Col>

        {/* Columna Derecha: Instrucciones */}
        <Col xs={24} lg={10}>
          <Card title="📋 Instrucciones" style={{ position: "sticky", top: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <strong>Opción 1: Escaneo con Cámara</strong>
              <ol style={{ marginTop: 8, marginBottom: 0 }}>
                <li>Permite el acceso a la cámara cuando el navegador lo solicite</li>
                <li>Coloca el código QR de la credencial frente a la cámara</li>
                <li>El sistema registrará la asistencia automáticamente</li>
              </ol>
            </div>

            <Divider />

            <div style={{ marginBottom: 20 }}>
              <strong>Opción 2: Subir Imagen</strong>
              <ol style={{ marginTop: 8, marginBottom: 0 }}>
                <li>Toma una foto del código QR con tu teléfono o cámara</li>
                <li>Usa el botón "Subir Imagen del QR"</li>
                <li>Selecciona la imagen del código QR</li>
                <li>El sistema procesará la imagen automáticamente</li>
              </ol>
            </div>

            <Alert
              message="Nota Importante"
              description="Solo se puede registrar una asistencia por persona por día, y debe estar dentro del horario permitido de la clase."
              type="info"
              showIcon
              style={{ marginTop: 16 }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
