import sys
import json
import os
from dotenv import load_dotenv
import mysql.connector
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import SpectralClustering
from qiskit.circuit.library import ZZFeatureMap
from qiskit_machine_learning.kernels import FidelityQuantumKernel

# Cargar las variables del archivo .env
load_dotenv()

# Leer zona_id desde línea de comandos
zona_id = int(sys.argv[1])

# Conexión a MySQL (Railway)
conn = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT", 3306)),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME")
)

cursor = conn.cursor(dictionary=True)

# Consulta de sensores por zona
cursor.execute("""
    SELECT s.tipo AS tipo_sensor, l.valor
    FROM lecturas_sensor l
    JOIN dispositivos_sensor d ON l.dispositivo_id = d.id
    JOIN sensores s ON d.sensor_id = s.id
    WHERE d.zona_id = %s
""", (zona_id,))
rows = cursor.fetchall()

cursor.close()
conn.close()

# Agrupar por tipo de sensor
datos = {}
for row in rows:
    tipo = row['tipo_sensor'].lower()
    valor = float(row['valor'])
    datos.setdefault(tipo, []).append(valor)

# Tipos de sensores esperados
tipos_referencia = ['temperatura', 'humedad', 'ph', 'nitrógeno', 'fósforo', 'potasio']
num_datos = len(datos.get('temperatura', []))
X = []

# Construir matriz de datos
for i in range(num_datos):
    fila = []
    for tipo in tipos_referencia:
        fila.append(datos.get(tipo, [0]*num_datos)[i])
    X.append(fila)

X = np.array(X)
X = StandardScaler().fit_transform(X)

# Kernel cuántico y clustering
feature_map = ZZFeatureMap(feature_dimension=X.shape[1], reps=2)
kernel = FidelityQuantumKernel(feature_map=feature_map)
kernel_matrix = kernel.evaluate(x_vec=X)

clustering = SpectralClustering(n_clusters=2, affinity='precomputed')
labels = clustering.fit_predict(kernel_matrix)

# Resultado
resultado = {
    "zona_id": zona_id,
    "clusters": labels.tolist(),
    "tipos": tipos_referencia,
    "valores": X.tolist()
}

print(json.dumps(resultado))
