CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT '',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  due_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);




-- Datos de ejemplo

INSERT INTO tasks (title, description, status, due_date) VALUES
    ('Relevar requerimientos', 'Hablar con el cliente para evaluar requerimientos', 'completed', '2026-08-15'),
    ('Definir prioridades', 'evaluar las prioridades de los requerimientos', 'pending', '2026-09-15');
