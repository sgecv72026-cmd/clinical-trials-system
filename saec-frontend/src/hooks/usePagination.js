import { useState, useEffect } from 'react';

/**
 * Hook de paginación del lado del cliente.
 *
 * Uso:
 *   const { page, pageItems, totalPages, totalItems, pageSize, goToPage } =
 *     usePagination(myArray, 20);
 *
 * Mapeo directo al componente <Pagination>:
 *   <Pagination
 *     page={page}
 *     totalPages={totalPages}
 *     totalElements={totalItems}
 *     size={pageSize}
 *     onPageChange={goToPage}
 *   />
 *
 * @param {Array}  items    - Array completo de elementos a paginar.
 * @param {number} pageSize - Elementos por página (default: 20).
 */
export function usePagination(items = [], pageSize = 20) {
  const [page, setPage] = useState(0);

  // Vuelve a la primera página cuando cambia el array (p.ej. tras un filtro)
  useEffect(() => {
    setPage(0);
  }, [items.length]);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  // Ajuste defensivo: si la página guardada ya no existe (array se redujo), va a la última
  const safePage  = Math.min(page, totalPages - 1);

  const start     = safePage * pageSize;
  const pageItems = items.slice(start, start + pageSize);

  function goToPage(p) {
    setPage(Math.max(0, Math.min(p, totalPages - 1)));
  }

  return {
    page:       safePage,
    pageItems,
    totalPages,
    totalItems,
    pageSize,
    goToPage,
  };
}
