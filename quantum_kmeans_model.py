import sys
import json
import mysql.connector
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import SpectralClustering

from qiskit.circuit.library import ZZFeatureMap
from qiskit_machine_learning.kernels import FidelityQuantumKernel

# Leer zona_id desde línea de comandos
zona_id = int(sys.argv[1])

# Conexión a MySQL
conn = mysql.connector.connect(
    host='localhost',
    user='Erick',
    password='erickMV123@',
    database='Qiskit'
)
cursor = conn.cursor(dictionary=True)

# Consulta de sensores
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

# Agrupar valores por tipo de sensor
datos = {}
for row in rows:
    tipo = row['tipo_sensor'].lower()
    valor = float(row['valor'])
    if tipo not in datos:
        datos[tipo] = []
    datos[tipo].append(valor)

tipos_referencia = ['temperatura', 'humedad', 'ph', 'nitrógeno', 'fósforo', 'potasio']
X = []
num_datos = len(datos.get('temperatura', []))

# Convertir datos a matriz numérica completa
for i in range(num_datos):
    fila = []
    for tipo in tipos_referencia:
        fila.append(datos.get(tipo, [0]*num_datos)[i])
    X.append(fila)

X = np.array(X)
X = StandardScaler().fit_transform(X)

# Quantum kernel con FidelityQuantumKernel (sin sampler manual)
feature_map = ZZFeatureMap(feature_dimension=X.shape[1], reps=2)
kernel = FidelityQuantumKernel(feature_map=feature_map)
kernel_matrix = kernel.evaluate(x_vec=X)

# Clustering con Spectral Clustering usando el kernel cuántico
clustering = SpectralClustering(n_clusters=2, affinity='precomputed')
labels = clustering.fit_predict(kernel_matrix)

# Resultado final
resultado = {
    "zona_id": zona_id,
    "clusters": labels.tolist(),
    "tipos": tipos_referencia,
    "valores": X.tolist()  # ← Agregado para devolver los datos usados
}


print(json.dumps(resultado))
