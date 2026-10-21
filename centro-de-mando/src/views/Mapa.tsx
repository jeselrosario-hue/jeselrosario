import { Grafo } from '@/components/Grafo'
import type { Grafo as GrafoDatos } from '@/api'
import { useApi } from '@/hooks'

export function Mapa({ alSinSesion, abrir }: { alSinSesion: () => void; abrir: (ruta: string) => void }) {
  const { datos, error } = useApi<GrafoDatos>('/api/grafo', alSinSesion)
  return (
    <div className="entra flex h-full min-h-[70vh] flex-col">
      <p className="eyebrow">Mapa del Cerebro</p>
      <h1 className="mt-2 text-5xl">Cómo se conectan tus ideas.</h1>
      <p className="mt-3 max-w-xl text-white/65">Cada punto es una nota y cada línea un [[enlace]]. Los puntos grandes son los temas más conectados. Cuando Graphify esté activo, aquí se suma su mapa de conceptos.</p>
      <div className="panel mt-6 min-h-[28rem] flex-1 overflow-hidden">
        {error && <p className="p-6 text-red-300">{error}</p>}
        {datos && <Grafo datos={datos} onAbrir={abrir} />}
      </div>
    </div>
  )
}
