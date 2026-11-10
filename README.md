# Mock ConsultaGeneralProducto

Mock SOAP para probar NovoSignWebServices. Devuelve datos ficticios fijos. No valida credenciales ni consulta bases de datos.

## Local (HTTP)

```
pnpm install
pnpm start           # http://localhost:3000
curl -v -X POST http://localhost:3000/soap/api/v1/novosign \
  -H "Content-Type: text/xml; charset=utf-8" \
  -H 'SOAPAction: "http://tempuri.org/ConsultaGeneralProducto"' \
  --data-binary '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body><ConsultaGeneralProducto xmlns="http://tempuri.org/"><ConsultaGeneralProductoReq><Producto>123</Producto></ConsultaGeneralProductoReq></ConsultaGeneralProducto></soap:Body></soap:Envelope>'
```

Cada petición se registra en consola en una línea JSON con `path`, `proto` y `producto`.

## Render (HTTPS)

El repo incluye `render.yaml` (Blueprint): servicio web con runtime Docker, plan free y health check en `/health`.

1. En Render: **New → Blueprint** y seleccionar el repo `mock-wsdl-cliente`.
2. Aplicar. Render construye el `Dockerfile` e inyecta `PORT`, que el servidor ya usa.

Ruta pública: `https://<servicio>.onrender.com/<cualquier-ruta>`; el WSDL en `https://<servicio>.onrender.com/<ruta>?wsdl`.
En el plan free el servicio se suspende tras inactividad y la primera petición tarda en responder.

## Netlify (HTTPS)

Conectar el directorio a Netlify (o `netlify deploy --prod`). Netlify sirve solo HTTPS, así que la prueba HTTP debe hacerse en local o en otro host HTTP.

Ruta pública: `https://<sitio>.netlify.app/<cualquier-ruta>` (el redirect manda todo a la función).

## Notas

- No poner datos reales de clientes en este mock.
- Si se despliega en un sitio público, cualquiera puede llamarlo. Retirarlo al terminar la prueba.
- Para que NovoSignWebServices lo use, poner en `UrlServices` la URL base (sin ?wsdl) del mock.
