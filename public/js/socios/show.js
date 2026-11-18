document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    const container = document.getElementById('socio-detail');
    
    if (!id) {
        container.innerHTML = '<p style="color: #b91c1c;">ID no válido.</p>';
        return;
    }

    const token = localStorage.getItem('token');

    try {
        // Añadimos limit=1000 para asegurarnos de que el socio esté en la respuesta
        const response = await fetch('/api/socios?limit=1000', { 
            headers: { 'Authorization': `Bearer ${token}` } 
        });
        
        if (!response.ok) throw new Error('Error al obtener datos');

        const result = await response.json(); // Ahora es un objeto, no un array
        
        // AQUÍ LA CORRECCIÓN: Buscamos dentro de result.data
        const socio = result.data.find(s => s.id == id);

        if (socio) {
            let htmlContent = `
                <div style="display: grid; gap: 1.5rem;">
                    <div>
                        <div class="detail-label">Legajo</div>
                        <div class="detail-value">${socio.legajo}</div>
                    </div>
                    <div>
                        <div class="detail-label">Nombre Completo</div>
                        <div class="detail-value">${socio.nombre_completo}</div>
                    </div>
                    <div>
                        <div class="detail-label">DNI</div>
                        <div class="detail-value">${socio.dni || 'No registrado'}</div>
                    </div>
                    <div>
                        <div class="detail-label">Tipo de Socio</div>
                        <div class="detail-value">${socio.tipo_socio}</div>
                    </div>
            `;

            if (socio.tipo_socio === 'Alumno' && socio.curso) {
                htmlContent += `
                    <div>
                        <div class="detail-label">Curso</div>
                        <div class="detail-value">${socio.curso}</div>
                    </div>
                `;
            }

            if (socio.telefono) {
                htmlContent += `
                    <div>
                        <div class="detail-label">Teléfono</div>
                        <div class="detail-value">${socio.telefono}</div>
                    </div>
                `;
            }

            if (socio.email) {
                htmlContent += `
                    <div>
                        <div class="detail-label">Email</div>
                        <div class="detail-value">${socio.email}</div>
                    </div>
                `;
            }

            htmlContent += `
                </div>
                <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid var(--border-color); display: flex; gap: 1rem;">
                    <a href="/pages/socios/edit?id=${socio.id}" class="btn-minimal" style="text-decoration: none; flex: 1; text-align: center;">Editar Socio</a>
                </div>
            `;

            container.innerHTML = htmlContent;
        } else {
            container.innerHTML = '<p style="color: #b91c1c;">Socio no encontrado.</p>';
        }
    } catch (error) {
        console.error("Error:", error);
        container.innerHTML = '<p style="color: #b91c1c;">Error de conexión con el servidor.</p>';
    }
});