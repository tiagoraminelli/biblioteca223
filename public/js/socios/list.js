document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const tableBody = document.getElementById('socios-table-body');
    
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');
    const paginationInfo = document.getElementById('pagination-info');
    const searchInput = document.getElementById('search-input');
    const limitSelect = document.getElementById('limit-select');

    let currentPage = 1;
    let totalPages = 1;
    let currentLimit = 10;
    let currentSearch = '';
    let debounceTimer;

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

    // 2. GUARDAR ESTADO (Ya no es window, ahora es una función normal)
    const saveTableState = () => {
        sessionStorage.setItem('sociosTableState', JSON.stringify({
            page: currentPage,
            limit: currentLimit,
            search: currentSearch
        }));
    };

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

                    // CAMBIO: Usamos clases en lugar de onclick
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

                                <!-- CAMBIO: ID de datos y clases -->
                                <a href="/pages/socios/show?id=${socio.id}" data-action="show" class="btn-text btn-show" style="text-decoration: none;">Ver</a>
                                <a href="/pages/socios/edit?id=${socio.id}" data-action="edit" class="btn-text btn-edit" style="text-decoration: none;">Editar</a>
                                <button class="btn-text btn-delete" style="color: #b91c1c;" data-id="${socio.id}">Eliminar</button>
                            </td>
                        </tr>
                    `;
                });
            }

            paginationInfo.textContent = `Página ${currentPage} de ${totalPages} (Total: ${result.total})`;
            
            btnPrev.disabled = currentPage === 1;
            btnNext.disabled = currentPage === totalPages || totalPages === 0;
            btnPrev.style.opacity = currentPage === 1 ? '0.5' : '1';
            btnNext.style.opacity = (currentPage === totalPages || totalPages === 0) ? '0.5' : '1';

            // 3. ASIGNAR EVENTOS A LOS BOTONES DINÁMICOS
            document.querySelectorAll('.btn-show, .btn-edit').forEach(btn => {
                btn.addEventListener('click', () => {
                    saveTableState();
                });
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
        if (currentPage > 1) {
            currentPage--;
            fetchSocios();
        }
    });

    btnNext.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            fetchSocios();
        }
    });

    // Función deleteSocio ahora es interna y no usa window
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
            fetchSocios();
        } catch (error) {
            console.error("Error:", error);
        }
    };

    fetchSocios();
});