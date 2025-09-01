// Componente de prueba para verificar colores de marca en Tailwind v4
export default function ColorTest() {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Test de Colores de Marca (Tailwind v4)</h2>
      
      {/* Prueba de backgrounds */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-brand-dark text-white p-4 rounded">brand-dark</div>
        <div className="bg-brand-neon text-black p-4 rounded">brand-neon</div>
        <div className="bg-brand-pale text-black p-4 rounded">brand-pale</div>
        <div className="bg-brand-light text-black p-4 rounded border">brand-light</div>
        <div className="bg-brand-green-light text-black p-4 rounded">brand-green-light</div>
        <div className="bg-brand-footer text-black p-4 rounded">brand-footer</div>
        <div className="bg-brand-blue text-white p-4 rounded">brand-blue</div>
        <div className="bg-brand-yellow text-black p-4 rounded">brand-yellow</div>
        <div className="bg-brand-red text-white p-4 rounded">brand-red</div>
        <div className="bg-brand-orange text-black p-4 rounded">brand-orange</div>
        <div className="bg-brand-dark-blue text-white p-4 rounded">brand-dark-blue</div>
      </div>

      {/* Prueba de text colors */}
      <div className="space-y-2 bg-white p-4 rounded border">
        <p className="text-brand-dark">Texto brand-dark</p>
        <p className="text-brand-blue">Texto brand-blue</p>
        <p className="text-brand-red">Texto brand-red</p>
        <p className="text-brand-dark-blue">Texto brand-dark-blue</p>
      </div>

      {/* Prueba de borders */}
      <div className="grid grid-cols-2 gap-4">
        <div className="border-2 border-brand-dark p-4 rounded">Border brand-dark</div>
        <div className="border-2 border-brand-blue p-4 rounded">Border brand-blue</div>
      </div>

      {/* Prueba usando estilos inline como alternativa */}
      <div className="space-y-2">
        <h3 className="font-bold">Alternativa con estilos inline:</h3>
        <div 
          className="p-4 rounded text-white"
          style={{ backgroundColor: 'var(--color-brand-dark)' }}
        >
          Con CSS variable directa
        </div>
      </div>
    </div>
  );
}
