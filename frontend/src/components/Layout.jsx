// En tu Layout.jsx existente, verifica que tenga esto:
import { Outlet } from 'react-router-dom';

// Dentro del return, después del sidebar y header:
<main className="flex-1 overflow-auto">
  <Outlet /> {/* Esto renderiza las rutas hijas */}
</main>