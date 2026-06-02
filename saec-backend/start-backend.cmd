@echo off
:: ============================================================
:: SAEC Backend - Script de arranque
:: Agrega Maven al PATH y lanza Spring Boot
:: ============================================================

SET MAVEN_HOME=C:\Users\Karen Gaitan\Documents\apache-maven-3.9.6
SET PATH=%MAVEN_HOME%\bin;%PATH%
SET DB_PASSWORD=120624

echo.
echo  ========================================
echo   SAEC Backend - Iniciando...
echo   Puerto: http://localhost:8080/api
echo  ========================================
echo

cd /d "%~dp0"
mvn spring-boot:run -DskipTests

pause
