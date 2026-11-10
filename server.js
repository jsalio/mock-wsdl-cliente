// Mock SOAP de prueba para ConsultaGeneralProducto.
// Solo devuelve datos ficticios. No valida autenticación ni consulta bases de datos.
const fs = require('fs');
const path = require('path');
const express = require('express');

// WSDL de referencia (copia de Utilidades/WSDL/NovoSignWSDL.wsdl)
const WSDL_TEMPLATE = fs.readFileSync(path.join(__dirname, 'NovoSignWSDL.wsdl'), 'utf8');

const app = express();
app.use(express.text({ type: '*/*', limit: '1mb' }));

// Registra en consola (stderr) toda respuesta 4xx o 5xx, con un extracto del body recibido
app.use((req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      console.error(JSON.stringify({
        ts: new Date().toISOString(),
        level: res.statusCode >= 500 ? 'error' : 'warn',
        status: res.statusCode,
        method: req.method,
        path: req.originalUrl,
        proto: req.get('x-forwarded-proto') || req.protocol,
        soapAction: soapAction(req),
        bodyPreview: typeof req.body === 'string' ? req.body.slice(0, 500) : '',
      }));
    }
  });
  next();
});

const soapAction = (req) => (req.get('SOAPAction') || '').replace(/"/g, '');

const escapeXml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function log(req, extra = {}) {
  console.log(JSON.stringify({
    ts: new Date().toISOString(),
    method: req.method,
    path: req.originalUrl,
    proto: req.get('x-forwarded-proto') || req.protocol,
    soapAction: soapAction(req),
    ...extra,
  }));
}

function respuesta(producto) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <ConsultaGeneralProductoResponse xmlns="http://tempuri.org/">
      <ConsultaGeneralProductoResult>
        <Canal>NovoSign</Canal>
        <Usuario>mock</Usuario>
        <Terminal>mock-broker</Terminal>
        <FechaHora>${new Date().toISOString()}</FechaHora>
        <TRN_ID>0</TRN_ID>
        <Resultado>0</Resultado>
        <Mensaje></Mensaje>
        <Nombre>CLIENTE DE PRUEBA</Nombre>
        <Estado>ACTIVO</Estado>
        <Identificacion>${escapeXml(producto)}</Identificacion>
        <TipoIdentificacion>Cedula</TipoIdentificacion>
        <Moneda>DOP</Moneda>
        <FechaExpiracion></FechaExpiracion>
        <TipoProducto>CuentaAhorro</TipoProducto>
      </ConsultaGeneralProductoResult>
    </ConsultaGeneralProductoResponse>
  </soap:Body>
</soap:Envelope>`;
}

function fault(mensaje) {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <soap:Fault>
      <faultcode>soap:Server</faultcode>
      <faultstring>${escapeXml(mensaje)}</faultstring>
    </soap:Fault>
  </soap:Body>
</soap:Envelope>`;
}

// GET <ruta>?wsdl: devuelve el WSDL apuntando al propio mock (no al host original)
app.get(/.*/, (req, res, next) => {
  // ASMX acepta ?wsdl y ?WSDL
  const pideWsdl = Object.keys(req.query).some((k) => k.toLowerCase() === 'wsdl');
  if (!pideWsdl) return next();
  const base = `${req.get('x-forwarded-proto') || req.protocol}://${req.get('host')}`;
  const wsdl = WSDL_TEMPLATE.replace(
    /(<soap:address location=")[^"]*(")/,
    (_, a, b) => `${a}${base}${req.path}${b}`
  );
  log(req, { wsdl: true });
  res.type('text/xml; charset=utf-8').send(wsdl);
});

app.get('/health', (req, res) => {
  log(req);
  res.type('text').send('ok');
});

app.post(/.*/, (req, res) => {
  const body = typeof req.body === 'string' ? req.body : '';
  const producto = (body.match(/<Producto>([^<]*)<\/Producto>/) || [])[1] || '';
  log(req, { producto, bytes: body.length });

  if (!soapAction(req).endsWith('/ConsultaGeneralProducto')) {
    return res.status(500).type('text/xml; charset=utf-8').send(fault('Operacion no soportada por el mock'));
  }
  res.type('text/xml; charset=utf-8').send(respuesta(producto));
});

app.all(/.*/, (req, res) => {
  log(req);
  res.status(404).type('text').send('No route');
});

module.exports = app;

if (require.main === module) {
  const port = process.env.PORT || 4000;
  app.listen(port, () => console.log(`mock escuchando en http://localhost:${port}`));
}
