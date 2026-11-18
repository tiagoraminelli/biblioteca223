document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const tableBody = document.getElementById('socios-table-body');
    
    // Elementos del DOM
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const paginationInfo = document.getElementById('pagination-info');
    const searchInput = document.getElementById('search-input');
    const limitSelect = document.getElementById('limit-select');
    
    // Elementos de Exportación
    const exportContainer = document.getElementById('export-container');
    const btnExportToggle = document.getElementById('btn-export-toggle');
    const exportMenu = document.getElementById('export-menu');
    const exportItems = document.querySelectorAll('.dropdown-item');

    // Variables de estado
    let currentPage = 1;
    let totalPages = 1;
    let currentLimit = 10;
    let currentSearch = '';
    let debounceTimer;
    let currentData = [];

    // 1. RECUPERAR ESTADO
    const savedState = sessionStorage.getItem('sociosTableState');
    if (savedState) {
        const parsed = JSON.parse(savedState);
        currentPage = parsed.page || 1;
        currentLimit = parsed.limit || 10;
        currentSearch = parsed.search || '';
        searchInput.value = currentSearch;
        limitSelect.value = currentLimit;
        sessionStorage.removeItem('sociosTableState');
    }

    const saveTableState = () => {
        sessionStorage.setItem('sociosTableState', JSON.stringify({
            page: currentPage,
            limit: currentLimit,
            search: currentSearch
        }));
    };

    // 2. FUNCIÓN EXPORTAR A CSV (EXCEL)
    const exportToCSV = (data, filename) => {
        if (data.length === 0) {
            showToast('No hay datos para exportar', 'error');
            return;
        }

        const headers = ['Legajo', 'Nombre Completo', 'DNI', 'Tipo de Socio', 'Curso', 'Teléfono', 'Email'];
        const rows = data.map(socio => [
            socio.legajo,
            `"${socio.nombre_completo}"`,
            socio.dni || '',
            socio.tipo_socio,
            socio.curso || '',
            socio.telefono || '',
            socio.email || ''
        ]);

        let csvContent = headers.join(',') + '\n';
        rows.forEach(row => { csvContent += row.join(',') + '\n'; });

        // \uFEFF asegura que Excel detecte los acentos correctamente
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' }); 
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('Archivo Excel (CSV) descargado', 'success');
    };

    // 3. FUNCIÓN EXPORTAR A JSON
    const exportToJSON = (data, filename) => {
        if (data.length === 0) {
            showToast('No hay datos para exportar', 'error');
            return;
        }

        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.json`;
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showToast('Archivo JSON descargado', 'success');
    };

   // 4. FUNCIÓN EXPORTAR A PDF (Encabezado y leyendas institucionales arriba)
    const exportToPDF = (data, filename, title) => {
        if (data.length === 0) {
            showToast('No hay datos para exportar', 'error');
            return;
        }

        const printWindow = window.open('', '_blank');
        const fechaActual = new Date().toLocaleDateString('es-AR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        let tableHTML = `
            <html>
            <head>
                <title>${title} - Escuela N° 223</title>
                <style>
                    @page {
                        size: A4;
                        margin: 1.5cm;
                    }
                    body {
                        font-family: Arial, sans-serif;
                        color: #111;
                        margin: 0;
                        padding: 0;
                        font-size: 11pt;
                        line-height: 1.4;
                    }
                    .header-container {
                        display: flex;
                        align-items: center;
                        border-bottom: 2px solid #2c3e50;
                        padding-bottom: 12px;
                        margin-bottom: 15px;
                    }
                    .logo-placeholder {
                        width: 60px;
                        height: 60px;
                        border: 2px dashed #bbb;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 8pt;
                        color: #666;
                        text-align: center;
                        background: #f9f9f9;
                        margin-right: 15px;
                    }
                    .institution-info h1 {
                        font-size: 14pt;
                        margin: 0 0 4px 0;
                        color: #2c3e50;
                        text-transform: uppercase;
                    }
                    .institution-info h2 {
                        font-size: 11pt;
                        margin: 0;
                        color: #555;
                        font-weight: normal;
                    }
                    /* Bloque superior para leyendas y datos */
                    .top-metadata-box {
                        background: #f4f6f8;
                        border-left: 4px solid #2c3e50;
                        padding: 12px 15px;
                        margin-bottom: 20px;
                        font-size: 10pt;
                    }
                    .top-metadata-box p {
                        margin: 4px 0;
                    }
                    .institutional-legend {
                        font-style: italic;
                        color: #555;
                        margin-bottom: 6px;
                        font-size: 9.5pt;
                    }
                    h3.document-title {
                        text-align: center;
                        font-size: 13pt;
                        margin: 15px 0;
                        color: #111;
                        text-transform: uppercase;
                    }
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 10pt;
                    }
                    th, td {
                        border: 1px solid #ccc;
                        padding: 6px 8px;
                        text-align: left;
                    }
                    th {
                        background-color: #2c3e50;
                        color: white;
                        font-weight: bold;
                    }
                    tr:nth-child(even) {
                        background-color: #fcfcfc;
                    }
                </style>
            </head>
            <body>
                <!-- ENCABEZADO INSTITUCIONAL -->
                <div class="header-container">
                    <!-- Si tienes el logo, puedes cambiar el div por: <img src="/ruta/logo.png" style="width: 60px; height: 60px; object-fit: contain; margin-right: 15px;"> -->
                    <div class="logo-placeholder">LOGO / ESCUDO</div>
                    <div class="institution-info">
                        <h1>Escuela N° 223 "José V. Oroño"</h1>
                        <h2>Biblioteca Escolar - Registro Oficial de Socios</h2>
                    </div>
                </div>

                <!-- LEYENDAS Y DATOS IMPORTANTES (UBICADOS ARRIBA) -->
                <div class="top-metadata-box">
                    <div class="institutional-legend">"Sistema de Gestión de Biblioteca - Documento de uso interno administrativo"</div>
                    <hr style="border: none; border-top: 1px solid #ddd; margin: 8px 0;">
                    <p><strong>Reporte:</strong> ${title}</p>
                    <p><strong>Fecha de Emisión:</strong> ${fechaActual}</p>
                    <p><strong>Total de Registros:</strong> ${data.length}</p>
                    ${currentSearch ? `<p><strong>Filtro aplicado:</strong> "${currentSearch}"</p>` : ''}
                </div>

                <h3 class="document-title">${title}</h3>

                <!-- TABLA DE DATOS -->
                <table>
                    <thead>
                        <tr>
                            <th style="width: 12%;">Legajo</th>
                            <th style="width: 32%;">Nombre Completo</th>
                            <th style="width: 15%;">DNI</th>
                            <th style="width: 15%;">Tipo</th>
                            <th style="width: 26%;">Contacto</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        data.forEach(socio => {
            const contacto = [socio.email, socio.telefono].filter(Boolean).join(' / ');
            tableHTML += `
                <tr>
                    <td>${socio.legajo}</td>
                    <td>${socio.nombre_completo}</td>
                    <td>${socio.dni || '-'}</td>
                    <td>${socio.tipo_socio}</td>
                    <td>${contacto || '-'}</td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(tableHTML);
        printWindow.document.close();
        
        printWindow.onload = function() {
            printWindow.print();
            setTimeout(() => printWindow.close(), 500);
        };
        
        showToast('Generando PDF institucional...', 'info');
    };

    // 5. CARGAR DATOS
    const fetchSocios = async () => {
        try {
            const url = new URL('/api/socios', window.location.origin);
            url.searchParams.append('page', currentPage);
            url.searchParams.append('limit', currentLimit);
            if (currentSearch) url.searchParams.append('search', currentSearch);

            const response = await fetch(url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!response.ok) throw new Error('Error al obtener los datos');
            
            const result = await response.json();
            
            currentPage = result.page;
            totalPages = result.totalPages;
            currentData = result.data;

            tableBody.innerHTML = '';
            
            if (result.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">No se encontraron socios.</td></tr>';
            } else {
                result.data.forEach(socio => {
                    let waLink = '#';
                    let waClass = 'action-icon disabled';
                    if (socio.telefono) {
                        const cleanPhone = socio.telefono.replace(/\D/g, '');
                        waLink = `https://wa.me/${cleanPhone}`;
                        waClass = 'action-icon';
                    }

                    let mailLink = '#';
                    let mailClass = 'action-icon disabled';
                    if (socio.email) {
                        mailLink = `mailto:${socio.email}`;
                        mailClass = 'action-icon';
                    }

                    tableBody.innerHTML += `
                        <tr>
                            <td>${socio.legajo}</td>
                            <td>${socio.nombre_completo}</td>
                            <td>${socio.dni || '-'}</td>
                            <td>${socio.tipo_socio}</td>
                            <td style="text-align: right; display: flex; justify-content: flex-end; gap: 12px; align-items: center;">
                                
                                <a href="${waLink}" target="_blank" class="${waClass}" title="Enviar WhatsApp">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 18px; height: 18px;">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                    </svg>
                                </a>

                                <a href="${mailLink}" class="${mailClass}" title="Enviar Email">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 18px; height: 18px;">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                                    </svg>
                                </a>

                                <div style="width: 1px; height: 16px; background-color: var(--border-color);"></div>

                                <a href="/pages/socios/show?id=${socio.id}" data-action="show" class="btn-text btn-show" style="text-decoration: none;">Ver</a>
                                <a href="/pages/socios/edit?id=${socio.id}" data-action="edit" class="btn-text btn-edit" style="text-decoration: none;">Editar</a>
                                <button class="btn-text btn-delete" style="color: #b91c1c;" data-id="${socio.id}">Eliminar</button>
                            </td>
                        </tr>
                    `;
                });
            }

            paginationInfo.textContent = `Pág ${currentPage} de ${totalPages} (Total: ${result.total})`;
            
            btnPrev.disabled = currentPage === 1;
            btnNext.disabled = currentPage === totalPages || totalPages === 0;
            btnPrev.style.opacity = currentPage === 1 ? '0.5' : '1';
            btnNext.style.opacity = (currentPage === totalPages || totalPages === 0) ? '0.5' : '1';

            document.querySelectorAll('.btn-show, .btn-edit').forEach(btn => {
                btn.addEventListener('click', () => saveTableState());
            });

            document.querySelectorAll('.btn-delete').forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    const id = e.target.getAttribute('data-id');
                    await deleteSocio(id);
                });
            });

        } catch (error) {
            console.error("Error fetching socios:", error);
        }
    };

    // 6. EVENTOS DEL MENÚ DE EXPORTACIÓN
    btnExportToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        exportMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!exportContainer.contains(e.target)) {
            exportMenu.classList.remove('active');
        }
    });

    exportItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            const type = item.getAttribute('data-type');
            const scope = item.getAttribute('data-scope');
            
            exportMenu.classList.remove('active');

            if (scope === 'page') {
                if (type === 'excel') exportToCSV(currentData, 'socios_pagina');
                if (type === 'json') exportToJSON(currentData, 'socios_pagina');
                if (type === 'pdf') exportToPDF(currentData, 'socios_pagina', 'Listado de Socios (Página Actual)');
            } else if (scope === 'all') {
                showToast('Preparando descarga completa...', 'info');
                try {
                    const url = new URL('/api/socios', window.location.origin);
                    url.searchParams.append('page', 1);
                    url.searchParams.append('limit', 10000);
                    if (currentSearch) url.searchParams.append('search', currentSearch);

                    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
                    const result = await response.json();

                    if (type === 'excel') exportToCSV(result.data, 'socios_todos');
                    if (type === 'json') exportToJSON(result.data, 'socios_todos');
                    if (type === 'pdf') exportToPDF(result.data, 'socios_todos', 'Listado Completo de Socios');
                } catch (error) {
                    showToast('Error al preparar la descarga', 'error');
                }
            }
        });
    });

    // 7. FILTROS Y PAGINACIÓN
    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            currentSearch = e.target.value.trim();
            currentPage = 1;
            fetchSocios();
        }, 400);
    });

    limitSelect.addEventListener('change', (e) => {
        currentLimit = parseInt(e.target.value);
        currentPage = 1;
        fetchSocios();
    });

    btnPrev.addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; fetchSocios(); }
    });

    btnNext.addEventListener('click', () => {
        if (currentPage < totalPages) { currentPage++; fetchSocios(); }
    });

    const deleteSocio = async (id) => {
        if (!confirm('¿Está seguro de eliminar este socio?')) return;
        
        try {
            await fetch(`/api/socios/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (tableBody.children.length === 1 && currentPage > 1) {
                currentPage--;
            }
            showToast('Socio eliminado correctamente', 'success');
            fetchSocios();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    fetchSocios();
});