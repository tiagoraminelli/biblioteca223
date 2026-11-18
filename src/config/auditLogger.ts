export const auditLog = (usuarioEmail: string, accion: string, detalles: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[AUDITORIA:] ${timestamp} | Usuario: ${usuarioEmail} | Acción: ${accion} | Detalles: ${detalles}`;
    
    // Lo mostramos en la consola en color cian
    console.log('\x1b[36m%s\x1b[0m', logMessage); 
};