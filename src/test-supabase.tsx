import { useEffect, useState } from "react";
import { supabaseClient } from "./utility/supabaseClient";

export const TestSupabase = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        console.log("Intentando conectar a Supabase...");
        const { data, error } = await supabaseClient
          .from("classes")
          .select("*");

        console.log("Respuesta de Supabase:", { data, error });

        if (error) {
          setError(error);
          console.error("Error de Supabase:", error);
        } else {
          setData(data);
          console.log("Datos recibidos:", data);
        }
      } catch (err) {
        console.error("Error al conectar:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    testConnection();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Test de Conexión a Supabase</h1>
      {loading && <p>Cargando...</p>}
      {error && (
        <div style={{ color: "red" }}>
          <h2>Error:</h2>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
      {data && (
        <div style={{ color: "green" }}>
          <h2>Éxito! Datos recibidos:</h2>
          <pre>{JSON.stringify(data, null, 2)}</pre>
          <p>Total de registros: {data.length}</p>
        </div>
      )}
    </div>
  );
};
