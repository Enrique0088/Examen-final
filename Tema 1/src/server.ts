import { serve } from "https://deno.land/std@0.182.0/http/server.ts";
import { extname, join } from "https://deno.land/std@0.182.0/path/mod.ts";

const PORT = 8000;

const pedidos: { nombre: string; producto: string; precio: number; cantidad: number; total: number }[] = [];
let contactos: { nombre: string; correo: string; mensaje: string }[] = [];

async function guardarContactosJSON() {
  const filePath = join(Deno.cwd(), "data", "contactos.json");
  await Deno.writeTextFile(filePath, JSON.stringify(contactos, null, 2));
}

async function guardarPedidosJSON() {
  const filePath = join(Deno.cwd(), "data", "pedidos.json");
  await Deno.writeTextFile(filePath, JSON.stringify(pedidos, null, 2));
}

async function serveStaticFile(path: string) {
  const ext = extname(path);
  let contentType = "text/plain";

  if (ext === ".html") {
    contentType = "text/html";
  } else if (ext === ".css") {
    contentType = "text/css";
  } else if (ext === ".js") {
    contentType = "application/javascript";
  } else if (ext === ".jpg" || ext === ".jpeg") {
    contentType = "image/jpeg";
  } else if (ext === ".png") {
    contentType = "image/png";
  } else if (ext === ".gif") {
    contentType = "image/gif";
  }

  try {
    const filePath = join(Deno.cwd(), "public", path);

    if (ext === ".jpg" || ext === ".jpeg" || ext === ".png" || ext === ".gif") {
      const fileContent = await Deno.readFile(filePath); 
      return new Response(fileContent, {
        headers: { "Content-Type": contentType },
      });
    } else {
      const fileContent = await Deno.readTextFile(filePath); 
      return new Response(fileContent, {
        headers: { "Content-Type": contentType },
      });
    }
  } catch (err) {
    console.error("Error al leer el archivo:", err);
    return new Response("File not found", { status: 404 });
  }
}

async function handleRequest(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const method = req.method;

  if (url.pathname === "/" && method === "GET") {
    return serveStaticFile("index.html");
  }

  if (url.pathname.endsWith(".css") || url.pathname.endsWith(".js")) {
    return serveStaticFile(url.pathname.slice(1));
  }

  if (url.pathname.startsWith("/img/")) {
    return serveStaticFile(url.pathname.slice(1));
  }

  if (url.pathname === "/contacto" && method === "POST") {
    const formData = await req.formData();
    const nombre = formData.get("nombre")?.toString();
    const correo = formData.get("correo")?.toString();
    const mensaje = formData.get("mensaje")?.toString();

    if (nombre && correo && mensaje) {
      contactos.push({ nombre, correo, mensaje });
      await guardarContactosJSON();

      return new Response("Formulario enviado correctamente", { status: 200 });
    } else {
      return new Response("Faltan datos en el formulario", { status: 400 });
    }
  }
  if (url.pathname === "/pedido" && method === "POST") {
    const formData = await req.formData();
    const nombre = formData.get("nombre")?.toString();
    const producto = formData.get("producto")?.toString();
    const precio = parseFloat(formData.get("precio")?.toString() || "0");
    const cantidad = parseInt(formData.get("cantidad")?.toString() || "0", 10);
    const total = precio * cantidad;

    if (nombre && producto && !isNaN(precio) && !isNaN(cantidad)) {
      pedidos.push({ nombre, producto, precio, cantidad, total });
      await guardarPedidosJSON();

      return new Response(JSON.stringify({ message: "Pedido registrado correctamente" }), { status: 200 });
    } else {
      return new Response("Faltan datos del pedido", { status: 400 });
    }
  }
  return new Response("Ruta no encontrada", { status: 404 });
}
console.log(`Servidor corriendo en http://localhost:${PORT}`);
await serve(handleRequest, { addr: `:${PORT}` });
