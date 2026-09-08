En esta prueba se comprobó qué pasa con los datos de la base de datos cuando se reinician los contenedores.

Primero creé una tarea nueva mediante un POST y verifiqué que se había guardado correctamente. Después reinicié solamente el contenedor `backend` con `docker compose restart backend`. Al volver a consultar las tareas, la tarea que había creado seguía existiendo. Esto se debe a que al reiniciar el contenedor `backend` no se elimina la información de la base de datos, ya que los datos de PostgreSQL están guardados en un volumen de Docker.

Luego ejecuté `docker compose down -v` y volví a levantar el proyecto. En este caso, la tarea ya no estaba. Esto pasó porque la opción `-v` elimina los volúmenes asociados al proyecto, incluyendo el volumen donde PostgreSQL guardaba los datos.

Con esta prueba pude comprobar que reiniciar un contenedor no borra los datos, mientras que eliminar el volumen sí provoca que se pierda la información almacenada en la base de datos.
