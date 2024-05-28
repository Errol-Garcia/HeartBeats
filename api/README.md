# Guía Paso a Paso para Ejecutar la API de Predicción de Precios de Viviendas en California

## Paso 1: Verificación de Python y Virtualenv

Antes de comenzar, asegúrate de tener Python instalado en tu sistema. Puedes verificar su versión ejecutando el siguiente comando en la terminal:
Además, comprueba si tienes instalado globalmente el paquete 'virtualenv' mediante el siguiente comando:

## Paso 2: Creación del Entorno Virtual

Para evitar conflictos con otros proyectos, crearemos un entorno virtual específico para nuestra API. Ejecuta el siguiente comando para crear un entorno virtual llamado 'env':

## Paso 3: Activación del Entorno Virtual

Activa el entorno virtual recién creado utilizando el siguiente comando:

Cuando el entorno esté activo, todas las dependencias y paquetes instalados serán utilizados desde este entorno aislado.

## Paso 4: Instalación de Dependencias

Ahora que estamos en el entorno virtual, podemos instalar todas las dependencias requeridas para la API. Usa el siguiente comando para instalar todas las dependencias listadas en el archivo 'requirements.txt':

Este archivo contiene una lista de paquetes junto con sus versiones, lo que nos permitirá recrear exactamente el mismo entorno en otro sistema.

## Paso 5: Ejecución de la API

¡Estamos listos para ejecutar la API! Utiliza el siguiente comando para iniciar la aplicación Flask llamada 'app':

Flask es un framework web de Python popular y este comando iniciará el servidor para que la API sea accesible desde un navegador web.

## Paso 6: Modo de Depuración (Opcional)

Si estás desarrollando la API y necesitas realizar cambios frecuentes, puedes habilitar el modo de depuración con el siguiente comando:

El modo de depuración reiniciará automáticamente el servidor cuando se detecten cambios en los archivos del proyecto, facilitando el desarrollo y la depuración de la API.

¡Felicidades! Ahora la API de Predicción de Precios de Viviendas en California está en funcionamiento y lista para recibir solicitudes.

---

## Paquetes Utilizados

- virtualenv
- flask
- numpy
- pandas
- joblib
- flask-cors
- scikit-learn==1.2.2

---

## Información Adicional

- `python --version`: Este comando muestra la versión de Python instalada en tu sistema y te permite asegurarte de estar utilizando la versión correcta.

- `pip list`: Muestra una lista de todos los paquetes de Python instalados en tu sistema, lo que es útil para verificar qué paquetes están disponibles en el entorno de Python.

- `py -3 -m venv env`: Crea un entorno virtual llamado "env" utilizando el módulo 'venv' de Python. Un entorno virtual aísla y mantiene las dependencias de un proyecto específico.

- `deactivate`: Este comando se utiliza para desactivar el entorno virtual actual y volver al entorno de Python global del sistema.

- `pip freeze > requirements.txt`: Guarda una lista de todos los paquetes instalados y sus versiones en un archivo llamado "requirements.txt". Este archivo se usa comúnmente para compartir la lista de dependencias de un proyecto y permitir que otros puedan replicar el mismo entorno virtual con las mismas versiones de paquetes.

---
