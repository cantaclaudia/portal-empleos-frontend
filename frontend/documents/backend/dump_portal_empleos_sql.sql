-- MySQL dump 10.13  Distrib 8.0.40, for Win64 (x86_64)
--
-- Host: localhost    Database: portal_empleos
-- ------------------------------------------------------
-- Server version	8.0.40

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `candidatos`
--

DROP TABLE IF EXISTS `candidatos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `candidatos` (
  `candidate_id` int NOT NULL,
  `resume_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`candidate_id`),
  CONSTRAINT `fk_candidate_user` FOREIGN KEY (`candidate_id`) REFERENCES `usuarios` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `candidatos`
--

LOCK TABLES `candidatos` WRITE;
/*!40000 ALTER TABLE `candidatos` DISABLE KEYS */;
INSERT INTO `candidatos` VALUES (1,'http://example.com/resumes/juan_perez.pdf'),(2,'http://example.com/resumes/maria_lopez.pdf'),(4,'http://example.com/resumes/ana_torres.pdf'),(5,'http://example.com/resumes/lucia_hernandez.pdf'),(11,'https://www.linkedin.com/in/facundo-tenor/'),(13,'https://www.linkedin.com/in/agus-universo/'),(14,'https://www.linkedin.com/in/joaquin-martinez/'),(15,'https://www.linkedin.com/in/valeria-lopez/'),(16,'https://www.linkedin.com/in/diego-fernandez/'),(17,'https://www.linkedin.com/in/carla-garcia/'),(18,'https://www.linkedin.com/in/mateo-morales/'),(19,'https://www.linkedin.com/in/elena-cruz/'),(20,'https://www.linkedin.com/in/tomas-herrera/'),(31,'https://www.linkedin.com/in/tomas-herrera1/');
/*!40000 ALTER TABLE `candidatos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleos`
--

DROP TABLE IF EXISTS `empleos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleos` (
  `job_id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) DEFAULT NULL,
  `description` text,
  `requirements` text,
  PRIMARY KEY (`job_id`)
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleos`
--

LOCK TABLES `empleos` WRITE;
/*!40000 ALTER TABLE `empleos` DISABLE KEYS */;
INSERT INTO `empleos` VALUES (1,'Desarrollador Web','Desarrollo de aplicaciones web','HTML, CSS, JavaScript, MySQL'),(2,'Diseñador UX/UI','Diseño de interfaces intuitivas','Adobe XD, Figma, creatividad'),(3,'Analista de Datos','Análisis y visualización de datos','Excel, SQL, Power BI'),(4,'Gerente de Proyecto','Gestión de proyectos de software','Scrum, liderazgo, comunicación'),(5,'Programador Python','Desarrollo de APIs con Flask','3 años de exp, Flask, MySQL, Docker'),(6,'Analista contable','Llevar contabilidad de la empresa','Licenciatura en curso. Experiencia de 1 año'),(7,'Analista contable ssr','Soporte','Licenciatura en curso. Experiencia de 3 años'),(8,'Abogado','Analista de compliance','Experiencia de mas de 4 años con clientes bancarios'),(9,'Tester QA sr','Testeo de aplicaciones de escritorio y moviles','Experiencia minima de 3 años. Titulo.'),(10,'Tester QA jr','Testeo de aplicaciones de escritorio y moviles','Secundario completo. Conocimientos basicos.'),(11,'Analista de Datos','Análisis de grandes volúmenes de datos','SQL, Python, Power BI, Excel avanzado'),(12,'Especialista en Marketing','Estrategias de marketing digital','SEO, Google Ads, Redes sociales'),(13,'Ingeniero DevOps','Implementación y mantenimiento de pipelines','Docker, Kubernetes, AWS, Jenkins'),(14,'Contador Público','Gestión de impuestos y auditorías','Título universitario, Excel, SAP'),(15,'Project Manager','Gestión de proyectos multidisciplinarios','Scrum, Agile, comunicación efectiva'),(16,'Técnico en Redes','Instalación y configuración de redes','TCP/IP, Cisco, Firewalls'),(17,'Diseñador UX/UI','Creación de interfaces y experiencias','Figma, Adobe XD, Principios de diseño'),(18,'Médico Clínico','Atención primaria y diagnóstico','Título habilitante, residencias'),(19,'Ingeniero Industrial','Optimización de procesos productivos','Lean Manufacturing, AutoCAD, SAP'),(20,'Tester QA SSR','Testeo de aplicaciones de escritorio y moviles','Secundario completo. Conocimientos basicos.');
/*!40000 ALTER TABLE `empleos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empleos_disponibles`
--

DROP TABLE IF EXISTS `empleos_disponibles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empleos_disponibles` (
  `job_offer_id` int NOT NULL AUTO_INCREMENT,
  `job_id` int DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `publication_date` date DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT NULL,
  `location_id` int DEFAULT NULL,
  `status` tinyint DEFAULT NULL,
  PRIMARY KEY (`job_offer_id`),
  KEY `location_id` (`location_id`),
  KEY `empleos_disponibles_ibfk_2` (`company_id`),
  KEY `empleos_disponibles_ibfk_1` (`job_id`),
  CONSTRAINT `empleos_disponibles_ibfk_1` FOREIGN KEY (`job_id`) REFERENCES `empleos` (`job_id`),
  CONSTRAINT `empleos_disponibles_ibfk_2` FOREIGN KEY (`company_id`) REFERENCES `empresas` (`company_id`),
  CONSTRAINT `empleos_disponibles_ibfk_3` FOREIGN KEY (`location_id`) REFERENCES `ubicaciones` (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empleos_disponibles`
--

LOCK TABLES `empleos_disponibles` WRITE;
/*!40000 ALTER TABLE `empleos_disponibles` DISABLE KEYS */;
INSERT INTO `empleos_disponibles` VALUES (1,1,1,'2024-11-01',120000.00,1,1),(2,2,2,'2024-11-05',95000.00,2,1),(3,3,3,'2024-11-10',140000.00,1,0),(4,5,1,'2024-11-25',1000.00,1,NULL),(5,5,1,'2024-11-25',1000.00,1,NULL),(6,5,1,'2024-11-25',1000.00,1,1),(7,3,2,'2024-11-25',2000.00,2,1),(8,10,4,'2024-11-25',4500.00,1,1),(9,11,11,'2024-11-27',4500.00,1,1),(10,12,12,'2024-11-27',6000.00,2,1),(11,13,13,'2024-11-27',7000.00,3,1),(12,14,14,'2024-11-27',9000.00,1,1),(13,15,15,'2024-11-27',12000.00,2,1),(14,16,16,'2024-11-27',3500.00,3,1),(15,17,17,'2024-11-27',8000.00,1,1),(16,18,18,'2024-11-27',15000.00,2,1),(17,19,19,'2024-11-27',5000.00,3,1),(20,10,20,'2024-11-27',10000.00,1,1),(21,6,21,'2024-12-24',10012.00,3,1),(22,7,21,'2025-04-23',10012.00,3,1);
/*!40000 ALTER TABLE `empleos_disponibles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empresas`
--

DROP TABLE IF EXISTS `empresas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresas` (
  `company_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `description` text,
  `tax_id` varchar(11) NOT NULL,
  `company_type` int NOT NULL,
  PRIMARY KEY (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresas`
--

LOCK TABLES `empresas` WRITE;
/*!40000 ALTER TABLE `empresas` DISABLE KEYS */;
INSERT INTO `empresas` VALUES (1,'TechCorp','Empresa de tecnología líder en innovación.','30213438776',1),(2,'CreativeStudio','Agencia creativa de diseño y publicidad.','30111118776',1),(3,'DataSolutions','Consultora especializada en análisis de datos.','3011111116',2),(4,'Empresa SRL 1','descripcion generica empresa 1','30256789019',2),(5,'Clínica Salud Total','Prestaciones de salud y servicios médicos','20123456780',4),(6,'Universidad del Futuro','Educación superior de excelencia','30123456781',5),(7,'Tienda La Esquina','Comercio de ropa y accesorios','40123456782',6),(8,'AgroTech Solutions','Innovación tecnológica para agricultura','20123456783',1),(9,'Hotel Luna de Miel','Servicios de hospedaje y eventos','30123456784',13),(10,'Energías Limpias S.A.','Generación de energías renovables','40123456785',10),(11,'Hospital Central','Atención médica especializada y quirúrgica','20123456789',4),(12,'Academia de Artes Lumina','Escuela de música y danza moderna','30123456790',5),(13,'Supermercados Global','Cadena de supermercados y distribución','40123456791',6),(14,'GreenTech Solutions','Software y tecnología ecológica','20123456792',1),(15,'Resort Paraíso Azul','Complejo turístico frente al mar','30123456793',13),(16,'SolarPower Argentina','Paneles solares y sistemas de energía renovable','40123456794',10),(17,'Transporte Andes Express','Servicio de logística y transporte interprovincial','20123456795',9),(18,'Editorial Saber','Producción de libros y contenido educativo','30123456796',5),(19,'AgroExport SA','Exportación de productos agrícolas','40123456797',12),(20,'Cine Estelar','Cadenas de cines y entretenimiento audiovisual','20123456798',11),(21,'Construcciones del Sur','Proyectos de ingeniería y construcción','30123456799',15),(22,'Telecomunicaciones Infinity','Servicios de internet y telefonía','40123456800',14),(23,'Empresa SRL 2','descripcion generica empresa2','3077777019',1),(24,'Empresa SRL 3','descripcion generica empresa3','3077777018',1);
/*!40000 ALTER TABLE `empresas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `empresas_x_usuario`
--

DROP TABLE IF EXISTS `empresas_x_usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `empresas_x_usuario` (
  `company_id` int NOT NULL,
  `user_id` int NOT NULL,
  PRIMARY KEY (`company_id`,`user_id`),
  KEY `empresas_x_usuario_ibfk_2` (`user_id`),
  CONSTRAINT `empresas_x_usuario_ibfk_1` FOREIGN KEY (`company_id`) REFERENCES `empresas` (`company_id`),
  CONSTRAINT `empresas_x_usuario_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `usuarios` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `empresas_x_usuario`
--

LOCK TABLES `empresas_x_usuario` WRITE;
/*!40000 ALTER TABLE `empresas_x_usuario` DISABLE KEYS */;
INSERT INTO `empresas_x_usuario` VALUES (1,3),(2,3),(3,3),(1,6),(2,7),(3,7),(3,8),(1,9),(3,12),(1,21),(2,22),(3,23),(5,24),(6,25),(12,26),(11,27),(13,28),(14,29),(16,30);
/*!40000 ALTER TABLE `empresas_x_usuario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `experiencias`
--

DROP TABLE IF EXISTS `experiencias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `experiencias` (
  `experience_id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int DEFAULT NULL,
  `job_id` int DEFAULT NULL,
  `company_id` int DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  PRIMARY KEY (`experience_id`),
  KEY `candidate_id` (`candidate_id`),
  KEY `experiencias_ibfk_3` (`company_id`),
  KEY `experiencias_ibfk_2` (`job_id`),
  CONSTRAINT `experiencias_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidatos` (`candidate_id`),
  CONSTRAINT `experiencias_ibfk_2` FOREIGN KEY (`job_id`) REFERENCES `empleos` (`job_id`),
  CONSTRAINT `experiencias_ibfk_3` FOREIGN KEY (`company_id`) REFERENCES `empresas` (`company_id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `experiencias`
--

LOCK TABLES `experiencias` WRITE;
/*!40000 ALTER TABLE `experiencias` DISABLE KEYS */;
INSERT INTO `experiencias` VALUES (1,1,1,1,'2022-01-01','2023-01-01'),(2,2,2,2,'2021-06-01','2023-06-01'),(4,11,5,4,'2022-06-23','2023-12-25');
/*!40000 ALTER TABLE `experiencias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `habilidades`
--

DROP TABLE IF EXISTS `habilidades`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `habilidades` (
  `skill_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`skill_id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `habilidades`
--

LOCK TABLES `habilidades` WRITE;
/*!40000 ALTER TABLE `habilidades` DISABLE KEYS */;
INSERT INTO `habilidades` VALUES (1,'HTML'),(2,'CSS'),(3,'JavaScript'),(4,'Figma'),(5,'SQL'),(6,'Python'),(7,'SQL'),(8,'Asertividad'),(9,'Liderazgo'),(10,'Trabajo en equipo'),(11,'Comunicación efectiva'),(12,'Resolución de problemas'),(13,'Gestión del tiempo'),(14,'Creatividad'),(15,'Empatía'),(16,'Negociación'),(17,'Adaptabilidad'),(18,'Análisis de datos'),(19,'Marketing digital'),(20,'Diseño gráfico'),(21,'Gestión de proyectos'),(22,'Toma de decisiones');
/*!40000 ALTER TABLE `habilidades` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `habilidades_x_candidato`
--

DROP TABLE IF EXISTS `habilidades_x_candidato`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `habilidades_x_candidato` (
  `skill_id` int NOT NULL,
  `candidate_id` int NOT NULL,
  PRIMARY KEY (`skill_id`,`candidate_id`),
  KEY `candidate_id` (`candidate_id`),
  CONSTRAINT `habilidades_x_candidato_ibfk_1` FOREIGN KEY (`skill_id`) REFERENCES `habilidades` (`skill_id`),
  CONSTRAINT `habilidades_x_candidato_ibfk_2` FOREIGN KEY (`candidate_id`) REFERENCES `candidatos` (`candidate_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `habilidades_x_candidato`
--

LOCK TABLES `habilidades_x_candidato` WRITE;
/*!40000 ALTER TABLE `habilidades_x_candidato` DISABLE KEYS */;
INSERT INTO `habilidades_x_candidato` VALUES (1,1),(2,1),(3,1),(4,2),(5,2),(4,11),(5,11),(4,13),(8,13),(9,13),(11,13),(7,14),(12,14),(15,14),(16,15),(18,15),(19,15),(20,15),(14,16),(17,16),(22,16),(9,17),(13,17),(21,17),(3,18),(11,18),(20,18),(2,19),(5,19),(7,19),(14,19),(1,20),(6,20),(12,20),(18,20),(1,31),(6,31),(12,31),(18,31);
/*!40000 ALTER TABLE `habilidades_x_candidato` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sector_empresa`
--

DROP TABLE IF EXISTS `sector_empresa`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sector_empresa` (
  `company_type_id` int NOT NULL AUTO_INCREMENT,
  `company_type` varchar(255) NOT NULL,
  PRIMARY KEY (`company_type_id`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sector_empresa`
--

LOCK TABLES `sector_empresa` WRITE;
/*!40000 ALTER TABLE `sector_empresa` DISABLE KEYS */;
INSERT INTO `sector_empresa` VALUES (1,'Technology'),(2,'Design'),(3,'Finances'),(4,'Healthcare'),(5,'Education'),(6,'Retail'),(7,'Manufacturing'),(8,'Real Estate'),(9,'Transportation'),(10,'Energy'),(11,'Entertainment'),(12,'Agriculture'),(13,'Hospitality'),(14,'Telecommunications'),(15,'Construction'),(16,'Government');
/*!40000 ALTER TABLE `sector_empresa` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitudes`
--

DROP TABLE IF EXISTS `solicitudes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitudes` (
  `application_id` int NOT NULL AUTO_INCREMENT,
  `candidate_id` int DEFAULT NULL,
  `job_offer_id` int DEFAULT NULL,
  `application_date` date DEFAULT NULL,
  `status` tinyint DEFAULT NULL,
  PRIMARY KEY (`application_id`),
  KEY `candidate_id` (`candidate_id`),
  KEY `solicitudes_ibfk_2` (`job_offer_id`),
  CONSTRAINT `solicitudes_ibfk_1` FOREIGN KEY (`candidate_id`) REFERENCES `candidatos` (`candidate_id`),
  CONSTRAINT `solicitudes_ibfk_2` FOREIGN KEY (`job_offer_id`) REFERENCES `empleos_disponibles` (`job_offer_id`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitudes`
--

LOCK TABLES `solicitudes` WRITE;
/*!40000 ALTER TABLE `solicitudes` DISABLE KEYS */;
INSERT INTO `solicitudes` VALUES (1,1,1,'2024-11-15',2),(2,2,2,'2024-11-16',1),(3,1,7,'2024-11-25',3),(4,2,7,'2024-11-25',2),(5,5,8,'2024-11-27',3),(6,11,9,'2024-11-27',1),(7,13,10,'2024-11-27',3),(8,14,12,'2024-11-27',3),(9,15,13,'2024-11-27',3),(10,16,14,'2024-11-27',1),(11,18,17,'2024-11-27',3),(12,19,20,'2024-11-27',3),(13,20,15,'2024-11-27',1);
/*!40000 ALTER TABLE `solicitudes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ubicaciones`
--

DROP TABLE IF EXISTS `ubicaciones`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ubicaciones` (
  `location_id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`location_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ubicaciones`
--

LOCK TABLES `ubicaciones` WRITE;
/*!40000 ALTER TABLE `ubicaciones` DISABLE KEYS */;
INSERT INTO `ubicaciones` VALUES (1,'Buenos Aires'),(2,'Córdoba'),(3,'Mendoza'),(4,'Rosario'),(5,'La Plata'),(6,'Salta'),(7,'Neuquén'),(8,'Tucumán'),(9,'Bariloche'),(10,'Rio Negro');
/*!40000 ALTER TABLE `ubicaciones` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `encrypted_password` varchar(255) DEFAULT NULL,
  `role` int DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'Juan','Pérez','juan.perez@example.com','encrypted123',0),(2,'María','López','maria.lopez@example.com','encrypted456',0),(3,'Carlos','García','carlos.garcia@example.com','encrypted789',1),(4,'Ana','Torres','ana.torres@example.com','encrypted101',0),(5,'Lucía','Hernández','lucia.hernandez@example.com','encrypted202',0),(6,'Roberto','Salinas','roberto.salinas@example.com','encrypted303',1),(7,'Paula','Martínez','paula.martinez@example.com','encrypted404',1),(8,'Sofía','Cruz','sofia.cruz@example.com','encrypted505',1),(9,'Martín','Díaz','martin.diaz@example.com','encrypted606',1),(11,'Facundo','Tenor','facundotenor@gmail.com','contraseña_Test123',0),(12,'Empleador','DataSolutions','empleador.datasolutions@gmail.com','contraseña_Test123',1),(13,'Agustina','Universo','agustina_universo@gmail.com','Contraseña_Test123',0),(14,'Joaquín','Martínez','joaquin_martinez@gmail.com','Contraseña_Test123',0),(15,'Valeria','López','valeria_lopez@gmail.com','Contraseña_Test123',0),(16,'Diego','Fernández','diego_fernandez@gmail.com','Contraseña_Test123',0),(17,'Carla','García','carla_garcia@gmail.com','Contraseña_Test123',0),(18,'Mateo','Morales','mateo_morales@gmail.com','Contraseña_Test123',0),(19,'Elena','Cruz','elena_cruz@gmail.com','Contraseña_Test123',0),(20,'Tomás','Herrera','tomas_herrera@gmail.com','Contraseña_Test123',0),(21,'Carlos','Gómez','carlos.gomez@techcorp.com','Contraseña_Test123',1),(22,'Mariana','López','mariana.lopez@creativestudio.com','Contraseña_Test123',1),(23,'Ricardo','Martínez','ricardo.martinez@datasolutions.com','Contraseña_Test123',1),(24,'Lucía','Pérez','lucia.perez@clinicasaludtotal.com','Contraseña_Test123',1),(25,'Esteban','Rodríguez','esteban.rodriguez@universidaddelfuturo.com','Contraseña_Test123',1),(26,'Matías','Herrera','matias.herrera@academialumina.com','Contraseña_Test123',1),(27,'Sofía','García','sofia.garcia@hospitalcentral.com','Contraseña_Test123',1),(28,'Natalia','Quiroga','natalia.quiroga@supermercadosglobal.com','Contraseña_Test123',1),(29,'Pablo','Fernández','pablo.fernandez@greentechsolutions.com','Contraseña_Test123',1),(30,'Valeria','Castro','valeria.castro@solarpower.com','Contraseña_Test123',1),(31,'Tomás','Herrera','tomas_herrera1@gmail.com','Contraseña_Test123',0);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-08-05 20:33:50
