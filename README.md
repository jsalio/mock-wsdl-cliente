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

## Netlify (HTTPS)

Conectar el directorio a Netlify (o `netlify deploy --prod`). Netlify sirve solo HTTPS, así que la prueba HTTP debe hacerse en local o en otro host HTTP.

Ruta pública: `https://<sitio>.netlify.app/<cualquier-ruta>` (el redirect manda todo a la función).

## Notas

- No poner datos reales de clientes en este mock.
- Si se despliega en un sitio público, cualquiera puede llamarlo. Retirarlo al terminar la prueba.
- Para que NovoSignWebServices lo use, poner en `UrlServices` la URL base (sin ?wsdl) del mock.
