// Script para manejar enlaces a referencias
document.addEventListener('DOMContentLoaded', function() {
    // Encuentra todos los enlaces que apuntan a references.html
    const referenceLinks = document.querySelectorAll('a[href*="references.html#"]');

    referenceLinks.forEach(link => {
        // Agrega target="_blank" para abrir en nueva ventana
        link.setAttribute('target', '_blank');

        // Opcional: agrega rel="noopener noreferrer" por seguridad
        link.setAttribute('rel', 'noopener noreferrer');

        // Opcional: agrega un indicador visual de que se abre en nueva ventana
        if (!link.querySelector('.external-link-icon')) {
            const icon = document.createElement('span');
            icon.className = 'external-link-icon';
            icon.innerHTML = ' ↗';
            icon.style.fontSize = '0.8em';
            icon.style.opacity = '0.6';
            link.appendChild(icon);
        }
    });

    // Si estamos en la página de referencias y hay un hash, hacer scroll suave al elemento
    if (window.location.pathname.includes('references.html') && window.location.hash) {
        setTimeout(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }
});
