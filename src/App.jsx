import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Tv, Flame, AlertCircle, VolumeX } from 'lucide-react';

// URL de tu Web App de Google Apps Script (Reemplazar cuando esté lista)
const API_URL = "https://script.google.com/macros/s/AKfycbw3w5eD2rEJOyIr1xIfbc-J9rKcLG4Vx9JyU6jOXnBk-Kxqh-kCGapQLfj7-FZU1uwcqw/exec";

// Mock Data idéntico a la estructura de Google Sheets para pruebas inmediatas
const MOCK_DATA = {
  success: true,
  slogan: "Zero Alcohol, Zero Humo, Zero Broncas",
  productos: [
    {
      ID: "P001",
      Nombre: "Mega Combo ZONAZERO",
      Costo: 180,
      Producido: true,
      Descripcion: "2 Hamburguesas Especiales + Papas Grandes + 2 Bebidas Frías Artesanales.",
      ImagenUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
      VideoUrl: "",
      EnOferta: true,
      TextoPromocion: "¡40% OFF HOY!",
      Categoria: "Combos"
    },
    {
      ID: "P002",
      Nombre: "Frappé Oreo Supremo",
      Costo: 55,
      Producido: true,
      Descripcion: "Delicioso frappé con galleta Oreo, crema batida y jarabe de chocolate premium.",
      ImagenUrl: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80",
      VideoUrl: "https://assets.mixkit.co/videos/preview/mixkit-pouring-chocolate-sauce-on-ice-cream-42211-large.mp4", // Video directo de prueba
      EnOferta: false,
      TextoPromocion: "",
      Categoria: "Bebidas Frías"
    },
    {
      ID: "P003",
      Nombre: "Alitas BBQ Fire",
      Costo: 120,
      Producido: true,
      Descripcion: "10 piezas crujientes bañadas en nuestra salsa BBQ secreta de la casa.",
      ImagenUrl: "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=800&auto=format&fit=crop&q=80",
      VideoUrl: "",
      EnOferta: true,
      TextoPromocion: "¡2x1 JUEVES!",
      Categoria: "Snacks"
    },
    {
      ID: "P004",
      Nombre: "Crepa Nutella Banana",
      Costo: 65,
      Producido: true,
      Descripcion: "Crepa gigante rellena de Nutella original, rodajas de plátano y helado.",
      ImagenUrl: "https://images.unsplash.com/photo-1519676867240-f03562e64548?w=800&auto=format&fit=crop&q=80",
      VideoUrl: "",
      EnOferta: false,
      TextoPromocion: "",
      Categoria: "Postres"
    }
  ],
  comerciales: [
    { ID: "C001", Titulo: "Intro Comercial ZONAZERO", YoutubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", Activo: true }, // Reemplazar ID de YT real
    { ID: "C002", Titulo: "Promo Fin de Semana", YoutubeUrl: "https://www.youtube.com/embed/9bZkp7q19f0", Activo: true }
  ]
};

export default function App() {
  const [productos, setProductos] = useState([]);
  const [comerciales, setComerciales] = useState([]);
  const [slogan, setSlogan] = useState("Zero Alcohol, Zero Humo, Zero Broncas");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados de Control de Pantalla
  const [layoutMode, setLayoutMode] = useState('grid4'); // 'grid4', 'grid2', 'slider'
  const [currentSliderIndex, setCurrentSliderIndex] = useState(0);
  const [showCommercial, setShowCommercial] = useState(false);
  const [currentComIndex, setCurrentComIndex] = useState(0);

  // Reloj local en pantalla (Crucial para menús de restaurante/snacks)
  const [time, setTime] = useState(new Date().toLocaleTimeString());

  // Intervalos de Referencia
  const layoutTimer = useRef(null);
  const sliderTimer = useRef(null);
  const commercialTriggerTimer = useRef(null);

  // Actualizar hora cada segundo
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch de Datos Real con Fallback al Mock Data
  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(API_URL);
        const json = await res.json();
        if (json.success) {
          setProductos(json.productos);
          setComerciales(json.comerciales);
          setSlogan(json.slogan || slogan);
        } else {
          throw new Error(json.error || "Error desconocido");
        }
      } catch (err) {
        console.warn("Usando datos de prueba locales (Mock Data).");
        setProductos(MOCK_DATA.productos);
        setComerciales(MOCK_DATA.comerciales);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    // Re-checar base de datos cada 2 minutos en segundo plano por si cambian los precios
    const apiInterval = setInterval(fetchData, 120000);
    return () => clearInterval(apiInterval);
  }, []);

  // Orquestador de Layouts Automáticos
  // Cambia de Modos de Pantalla para mantener el dinamismo y evitar quemar píxeles en la TV
  useEffect(() => {
    if (loading || showCommercial) return;

    layoutTimer.current = setInterval(() => {
      setLayoutMode((prev) => {
        if (prev === 'grid4') return 'grid2';
        if (prev === 'grid2') return 'slider';
        return 'grid4';
      });
    }, 30000); // Cambia el tipo de pantalla cada 30 segundos

    return () => clearInterval(layoutTimer.current);
  }, [loading, showCommercial]);

  // Manejador del Slider Infinito (Cada 10 segundos cambia de producto en modo slider)
  useEffect(() => {
    if (layoutMode !== 'slider' || showCommercial) {
      clearInterval(sliderTimer.current);
      return;
    }

    sliderTimer.current = setInterval(() => {
      setCurrentSliderIndex((prev) => (prev + 1) % productos.length);
    }, 10000); // 10 segundos por slide

    return () => clearInterval(sliderTimer.current);
  }, [layoutMode, productos, showCommercial]);

  // Lanzador de Comerciales a pantalla completa cada 3 minutos
  useEffect(() => {
    if (loading || comerciales.length === 0) return;

    commercialTriggerTimer.current = setInterval(() => {
      setShowCommercial(true);
      // Pausar layouts de fondo temporalmente
      clearInterval(layoutTimer.current);
      clearInterval(sliderTimer.current);
    }, 180000); // 3 minutos (180000ms)

    return () => clearInterval(commercialTriggerTimer.current);
  }, [loading, comerciales]);

  // Extraer ID de YouTube de cualquier URL provista
  const getYoutubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Cuando termina el Comercial (Simulamos duración de 20s para la prueba del Iframe)
  const handleCommercialEnd = () => {
    setShowCommercial(false);
    setCurrentComIndex((prev) => (prev + 1) % comerciales.length);
    setLayoutMode('grid4'); // Reinicia en cuadrícula estándar
  };

  // Escuchador del temporizador para el comercial en reproducción
  useEffect(() => {
    if (!showCommercial) return;
    const duration = setTimeout(handleCommercialEnd, 20000); // Cada comercial dura 20s expuesto
    return () => clearTimeout(duration);
  }, [showCommercial, currentComIndex]);

  if (loading) {
    return (
      <div className="w-screen h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-cyan-500 mb-6"></div>
        <h1 className="text-4xl font-black tracking-widest text-cyan-400 animate-pulse">ZONAZERO MENU SYSTEM</h1>
        <p className="text-xl text-slate-400 mt-2">Cargando base de datos en tiempo real...</p>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-slate-950 text-white select-none relative font-sans">
      
      {/* MODO COMERCIAL INTERRUPTOR A PANTALLA COMPLETA */}
      {showCommercial && comerciales.length > 0 && (
        <div className="absolute inset-0 bg-black z-50 w-full h-full flex flex-col justify-between">
          <div className="w-full h-full relative">
            {getYoutubeId(comerciales[currentComIndex].YoutubeUrl) ? (
              <iframe
                className="w-full h-full pointer-events-none"
                src={`https://www.youtube.com/embed/${getYoutubeId(comerciales[currentComIndex].YoutubeUrl)}?autoplay=1&mute=1&controls=0&loop=1&playlist=${getYoutubeId(comerciales[currentComIndex].YoutubeUrl)}&rel=0`}
                title={comerciales[currentComIndex].Titulo}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            ) : (
              <div className="w-full h-full bg-gradient-to-tr from-cyan-900 to-slate-950 flex items-center justify-center">
                <Tv className="w-48 h-48 text-cyan-500 animate-bounce" />
              </div>
            )}
            {/* Banner Informativo Inferior en Comercial */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black via-black/80 to-transparent p-12 flex justify-between items-center">
              <div>
                <span className="bg-red-600 text-white text-2xl font-bold px-6 py-2 rounded-full uppercase tracking-widest animate-pulse">
                  Espacio Comercial
                </span>
                <h2 className="text-5xl font-black text-white mt-4">{comerciales[currentComIndex].Titulo}</h2>
              </div>
              <div className="text-right">
                <p className="text-cyan-400 text-3xl font-bold tracking-wider">{slogan}</p>
                <div className="flex items-center text-slate-400 text-xl justify-end mt-2">
                  <VolumeX className="w-6 h-6 mr-2 animate-pulse" /> Silenciado por restricciones de TV
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* HEADER FIJO SUPERIOR */}
      <header className="h-[12vh] bg-slate-900/90 border-b border-slate-800 flex items-center justify-between px-16 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-6">
          <div className="bg-cyan-500 text-slate-950 px-6 py-2 rounded-xl text-4xl font-black tracking-tighter shadow-lg shadow-cyan-500/20">
            ZONAZERO
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold text-slate-400 tracking-widest uppercase">Menú Inteligente</span>
            <span className="text-lg text-cyan-400 font-medium tracking-wide">{slogan}</span>
          </div>
        </div>

        {/* Indicadores de Modo actuales para monitoreo visual en pruebas */}
        <div className="flex items-center gap-4 bg-slate-950 px-6 py-3 rounded-2xl border border-slate-800">
          <span className={`px-4 py-1.5 rounded-lg font-bold text-lg transition-colors ${layoutMode === 'grid4' ? 'bg-cyan-500 text-slate-950' : 'text-slate-500'}`}>Mesa 2X2</span>
          <span className={`px-4 py-1.5 rounded-lg font-bold text-lg transition-colors ${layoutMode === 'grid2' ? 'bg-amber-500 text-slate-950' : 'text-slate-500'}`}>Destacados</span>
          <span className={`px-4 py-1.5 rounded-lg font-bold text-lg transition-colors ${layoutMode === 'slider' ? 'bg-pink-500 text-slate-950' : 'text-slate-500'}`}>Mega Carrusel</span>
        </div>

        <div className="text-5xl font-black tracking-tight font-mono text-cyan-400 drop-shadow-md">
          {time}
        </div>
      </header>

      {/* CONTENEDOR PRINCIPAL DINÁMICO (88vh restante) */}
      <main className="h-[88vh] p-12 bg-slate-950 transition-all duration-1000 ease-in-out">
        
        {/* LAYOUT 1: CUADRÍCULA 2X2 (Perfecto para explorar menú general) */}
        {layoutMode === 'grid4' && (
          <div className="grid grid-cols-2 grid-rows-2 gap-10 h-full w-full animate-fadeIn">
            {productos.slice(0, 4).map((prod) => (
              <ProductCard key={prod.ID} prod={prod} size="normal" />
            ))}
          </div>
        )}

        {/* LAYOUT 2: GRID DE 2 ELEMENTOS (Grandes Promos del Día) */}
        {layoutMode === 'grid2' && (
          <div className="grid grid-cols-2 gap-12 h-full w-full animate-fadeIn">
            {productos.slice(0, 2).map((prod) => (
              <ProductCard key={prod.ID} prod={prod} size="mega" />
            ))}
          </div>
        )}

        {/* LAYOUT 3: MODO SLIDER INFRAESTRUCTURA GIGANTE */}
        {layoutMode === 'slider' && productos.length > 0 && (
          <div className="h-full w-full animate-fadeIn relative">
            <ProductCard prod={productos[currentSliderIndex]} size="full" />
            {/* Indicador de barra de progreso visual de cambio de slide */}
            <div className="absolute bottom-4 inset-x-0 h-2 bg-slate-800 rounded-full overflow-hidden mx-12">
              <div key={currentSliderIndex} className="h-full bg-pink-500 animate-progressBar" />
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

/**
 * COMPONENTE HIJO ATÓMICO: Tarjeta de Producto Modular de Alta Densidad Visual
 */
function ProductCard({ prod, size }) {
  const isFull = size === 'full';
  const isMega = size === 'mega';

  return (
    <div className={`relative bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl overflow-hidden flex transition-all duration-500 shadow-2xl ${
      isFull ? 'flex-row w-full h-full border-pink-500/30' : isMega ? 'flex-col h-full border-amber-500/20' : 'flex-row h-full'
    }`}>
      
      {/* ETIQUETA EN OFERTA ANIMADA */}
      {prod.EnOferta && (
        <div className="absolute top-6 left-6 z-30 flex items-center gap-2 bg-red-600 text-white font-black text-2xl px-6 py-3 rounded-2xl shadow-xl animate-bounce">
          <Flame className="w-8 h-8 text-yellow-300 fill-yellow-300" />
          <span>{prod.TextoPromocion || "OFERTA"}</span>
        </div>
      )}

      {/* CONTENEDOR MULTIMEDIA (Video o Imagen en Alta Definición) */}
      <div className={`relative overflow-hidden flex-shrink-0 bg-black ${
        isFull ? 'w-[55%] h-full' : isMega ? 'w-full h-[55%]' : 'w-[40%] h-full'
      }`}>
        {prod.VideoUrl ? (
          <video
            className="w-full h-full object-cover"
            src={prod.VideoUrl}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <img
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            src={prod.ImagenUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600"}
            alt={prod.Nombre}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
      </div>

      {/* CONTENEDOR DE CONTENIDO (TÍTULOS, DESCRIPCIONES, PRECIO) */}
      <div className={`flex flex-col justify-between p-10 flex-grow relative z-20 ${isMega ? 'h-[45%]' : 'h-full'}`}>
        <div>
          {/* Categoría superior */}
          <span className="text-cyan-400 font-extrabold tracking-widest text-xl uppercase bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl inline-block mb-4">
            {prod.Categoria}
          </span>
          
          {/* Título de Producto Dinámico según tamaño */}
          <h2 className={`font-black tracking-tight text-white ${
            isFull ? 'text-7xl mb-6' : isMega ? 'text-5xl mb-3' : 'text-4xl mb-2'
          }`}>
            {prod.Nombre}
          </h2>
          
          {/* Descripción */}
          <p className={`text-slate-400 font-medium leading-snug ${
            isFull ? 'text-2xl max-w-2xl' : isMega ? 'text-xl' : 'text-lg line-clamp-2'
          }`}>
            {prod.Descripcion}
          </p>
        </div>

        {/* CONTENEDOR DE PRECIO GIGANTE */}
        <div className="flex items-center justify-between border-t border-slate-800/80 pt-6 mt-4">
          <span className="text-slate-500 font-bold uppercase tracking-wider text-lg">Precio Neto</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-emerald-400">$</span>
            <span className={`font-black text-emerald-400 font-mono tracking-tighter ${
              isFull ? 'text-8xl' : isMega ? 'text-7xl' : 'text-6xl'
            }`}>
              {prod.Costo}
            </span>
            <span className="text-xl font-bold text-slate-500 ml-2">MXN</span>
          </div>
        </div>
      </div>
    </div>
  );
}