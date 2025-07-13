# 🏋️‍♂️ Discyn

**Discyn** es una aplicación móvil tipo red social para personas que entrenan o van al gimnasio. La app permite conectar con otros usuarios, compartir entrenamientos, crear rutinas personalizadas y seguir la actividad de tus *gymbros*. Es el lugar ideal para motivarte, descubrir nuevas rutinas y construir comunidad en torno al fitness.

---

## 🚀 Funcionalidades principales

- 🤝 Conéctate con otros usuarios (haz gymbros)
- 🏋️ Publica y visualiza entrenamientos
- 📋 Crea, edita y sigue rutinas de entrenamiento
- 🔍 Descubre los entrenos y progresos de tus gymbros
- 📈 Próximamente: estadísticas de progreso y más

---

## 🛠️ Tecnologías utilizadas

### Backend
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/)
- **Base de datos:** PostgreSQL
- **ORM:** SQLAlchemy

### Frontend
- **Framework:** [React Native](https://reactnative.dev/) con [Expo](https://expo.dev/) (`npx expo`)
- **Lenguaje:** JavaScript o TypeScript (según implementación)

---

## 📦 Estructura del proyecto

```
/discyn-backend
  ├── app/
  │   ├── core/
  │   ├── database/
  │   ├── models/
  │   ├── routes/
  │   └── schemas/
  ├── static/
  │   └── images/
  │       ├── exercicis/
  │       ├── grupmuscular/
  │       └── persona/
  ├── venv/
  ├── docker-compose.yml  # (no se usa actualmente)
  ├── Dockerfile
  └── requirements.txt

/discyn-frontend
  ├── app/
  │   ├── auth/
  │   ├── tabs/
  │   └── tabsadmin/
  ├── screens/
  ├── assets/
  ├── components/
  ├── node_modules/
  └── scripts/
```

---

## ⚙️ Instalación y ejecución

### Backend

1. Clona el repositorio y entra al directorio del backend:
   ```bash
   cd discyn-backend
   ```
2. Crea y activa un entorno virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # En Windows: venv\Scripts\activate
   ```
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Ejecuta el servidor de desarrollo:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend

1. Entra al directorio del frontend:
   ```bash
   cd discyn-frontend
   ```
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Ejecuta la app:
   ```bash
   npx expo start
   ```

---

## 📌 Estado del proyecto

- [x] Registro e inicio de sesión de usuarios
- [x] Creación de entrenamientos y rutinas
- [x] Visualización de rutinas propias y de gymbros
- [ ] Notificaciones y mensajería
- [ ] Estadísticas de progreso
- [ ] Mejoras de diseño e interacción social

---
Contributors: Pau Martin Nadal
