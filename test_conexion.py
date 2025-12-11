import mysql.connector

try:
    print("ingreso al try")
    connection = mysql.connector.connect(
        host="localhost",
        port="3306",
        user="root",
        password="root",
        database="portal_empleos"
    )
    print("Conexión exitosa")
except mysql.connector.Error as err:
    print(f"Error: {err}")