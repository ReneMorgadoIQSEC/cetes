Esta aplicación esta diseñanda para realizar la validación de indentidad de los usuarios, que implica la captura de imágenes de una identificación oficial (INE) y la verificación del rostro del usuario, incluyendo medidas de seguridad para evitar fraudes (antispoofing). A continuación, se detalla la estructura y las funciones clave del código.

### Variables Globales:
1. **Variables de imágenes y datos**:
   - `frontImage`, `backImage`: Contienen las imágenes de la parte frontal y trasera de la identificación.
   - `framesCaptured`: Almacena los frames capturados para la verificación del rostro.
   - **Respuestas de servicios**: `OCRIneResponse`, `ComparaFotoResponse`, `ConsultaIneResponse`, `dataSendIne` mantienen las respuestas de los servicios externos.
   - **Firma y Token**: `signature`, `token`, `hostname` contienen información relacionada con la sesión y la firma.
   - **Referencia**: `referencia` será el dato compartido por el equipo de integración de cetes.

2. **Elementos del DOM**:
   - Se hace referencia a varios elementos de la interfaz de usuario, como pantallas, botones y vídeos para la captura de imágenes, verificación del rostro y firma digital.

### Interacciones del Usuario:
1. **Enfoque de rostro (Antispoofing)**:
   - El flujo de trabajo comienza con el enfoque del rostro del usuario (`PDVI`). Si se detecta un intento de suplantación (spoofing), se muestra un error; si no, se avanza a la siguiente etapa.

2. **Captura de imágenes**:
   - Se captura una foto del rostro frontal (`TFF`) y reverso de la INE (`TFR`) a través de la cámara. Después, el usuario puede verificar la foto capturada.

3. **Firma digital**:
   - El usuario puede firmar en una caja de firma (`CONFI_SIGN`), y esta firma se guarda para ser enviada a un servicio.

### Funciones Principales:

#### 1. **Configuración de Antispoofing**:
   - `configureAntispoofing`: Configura un sistema para capturar video y detectar si la persona está haciendo un intento de suplantación utilizando un servicio de detección facial (sdk `AntiSpoofing`).
   - Se muestra un mensaje en la interfaz sobre el estado del proceso y se captura la imagen del rostro en caso de ser necesario.

#### 2. **Captura de Foto Frontal y Trasera**:
   - Se utilizan las funciones `configureTakeFrontPhoto` y `configureTakeBackPhoto` para capturar las imágenes de las partes frontal y trasera de la identificación.
   - Las imágenes son tomadas desde un `video` y se almacenan en las variables `frontImage` y `backImage`.

#### 3. **Verificación de Identidad**:
   - **OCR de INE**: La imagen del frente y reverso se envían a un servicio OCR (Reconocimiento Óptico de Caracteres) para leer la información de la INE.
   - **Comparación de fotos**: Se compara el rostro del usuario con la foto de la INE usando un servicio externo.
   - **Consulta a INE**: Se realiza una consulta a los servidores de INE con los datos extraídos y se verifica si la información es válida.

#### 4. **Firma Digital**:
   - El usuario firma en una caja de firma (`CONFI_SIGN`), y el sistema captura esta firma para ser enviada al servicio de autenticación.

#### 5. **Flujo de Páginas**:
   - El código controla la navegación entre diferentes pantallas utilizando la función `changePage` que oculta todas las páginas y muestra la página correspondiente. Estas páginas incluyen la bienvenida, los intentos de verificación, la firma y los resultados.

#### 6. **Manejo de Errores**:
   - Si ocurre un error en cualquier etapa (como un error en la verificación de la foto o en la firma), el sistema muestra la pantalla de error correspondiente.

#### 7. **Llamadas a Servicios Externos**:
   - El código realiza varias llamadas a APIs externas para validar la información y realizar comparaciones de fotos, usando `fetch` con el método POST.
   - Estas llamadas incluyen la verificación OCR de la INE, la comparación de fotos y la consulta de datos de la INE.

### Funciones de Navegación:
- `changePage(page)`: Cambia entre las diferentes pantallas de la interfaz, ocultando las pantallas actuales y mostrando la nueva página según el valor de `page`.
- `hideAllPages()`: Oculta todas las páginas activas.
  
### Respuestas y Manejo de Éxitos:
- **Manejo de éxito**: Cuando todas las etapas se completan con éxito (captura de fotos, firma, verificación de datos), se muestra la pantalla de éxito con un resumen de todos los datos procesados.

### Funciones Auxiliares:
- `showLoader()`, `showErrorAS()`, `showErrorINE()`, `showErrorSignature()`, `showSuccess()`: Estas funciones controlan las pantallas de error o éxito, mostrando el cargador o la pantalla correspondiente según el estado del proceso.