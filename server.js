import express from "express";
import { pool } from "./db.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
const app = express();
const PORT = process.env.PORT || 3000;

// Pequeño agregado para mostrar una pagina con los codigos de error.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Funcion para devolver una pagina de error o un mensaje con json, depende de donde se lo use.
function sendErrorPage(req, res, statusCode, message) {
  if (req.accepts("html")) {
    const filePath = path.join(__dirname, "views", `${statusCode}.html`);
    const html = fs.readFileSync(filePath, "utf8");
    const htmlWithMessage = html.replace("{{MESSAGE}}", message);

    return res.status(statusCode).send(htmlWithMessage);
  }

  return res.status(statusCode).json({
    error: message,
  });
}

app.use(express.json());

// GET /tasks - Listar todas las tareas
// Con Filtro opcional concatenando ?status={pending, completed}
// Opcion de usar limit y offset ?limit={numero} o ?offset={numero}
app.get("/tasks", async (req, res) => {
  try {
    const { status, limit, offset } = req.query;
    let query = "SELECT * FROM tasks";
    let values = [];

    if (status) {
      query += ` WHERE status = $${values.length + 1}`;
      values.push(status);
    }

    query += ` ORDER BY id`;
    if (limit) {
      query += ` LIMIT $${values.length + 1}`;
      values.push(limit);
    }

    if (offset) {
      query += ` OFFSET $${values.length + 1}`;
      values.push(offset);
    }

    const result = await pool.query(query, values);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    sendErrorPage(
      req,
      res,
      500,
      "Ocurrio un error inesperado en el servidor...",
    );
  }
});

// GET /tasks/:id - Obtener una tarea por id
app.get("/tasks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM tasks WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /tasks - Crear una nueva tarea
app.post("/tasks", async (req, res) => {
  try {
    const { title, description, status, dueDate } = req.body;
    const validStatuses = ["pending", "completed"];
    const taskStatus = status || "pending";

    if (!title) {
      return sendErrorPage(req, res, 400, "Title cant be empty...");
    }

    if (!validStatuses.includes(taskStatus)) {
      return sendErrorPage(
        req,
        res,
        400,
        "Status must be pending or completed.",
      );
    }

    const result = await pool.query(
      `INSERT INTO tasks (title, description, status, due_date)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
      [title, description || "", taskStatus, dueDate || null],
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    sendErrorPage(
      req,
      res,
      500,
      "Ocurrio un error inesperado en el servidor...",
    );
  }
});

// Post para modificar la tarea, actualizando el updated_at.
app.put("/tasks/:id", async (req, res) => {
  const { title, description, status, dueDate } = req.body;
  const { id } = req.params;

  try {
    //Validamos si los estados son valores validos. Como en el post
    const validStatuses = ["pending", "completed"];
    //NOTE: Valores tomados del body, que si no estan en el body, se usan lo que estan de antes.
    const values = [
      title ?? null,
      description ?? null,
      status ?? null,
      dueDate ?? null,
      id,
    ];
    if (status !== undefined && !validStatuses.includes(status)) {
      return sendErrorPage(
        req,
        res,
        400,
        "Status must be pending or completed",
      );
    }
    const query = `UPDATE tasks SET 
    title = COALESCE($1, title), 
    description = COALESCE($2, description),
    status = COALESCE($3, status),
    due_date = COALESCE($4, due_date),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return sendErrorPage(req, res, 404, "Tarea no encontrada...");
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    sendErrorPage(req, res, 500, "Error interno del servidor...");
  }
});

app.delete("/tasks/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const query = "DELETE FROM tasks WHERE id = $1 RETURNING *";
    const result = await pool.query(query, [id]);
    if (result.rows.length === 0) {
      return sendErrorPage(req, res, 404, "Tarea no encontrada...");
    }
    res.status(204).send();
  } catch (err) {
    sendErrorPage(
      req,
      res,
      500,
      "Ocurrió un erorr inesperado en el servidor...",
    );
  }
});

app.use((req, res) => {
  sendErrorPage(req, res, 404, "La ruta solicitada no existe");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`API endpoints available at /tasks`);
});
