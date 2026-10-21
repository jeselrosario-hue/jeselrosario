import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { useMemo, type MouseEvent } from 'react'

/** Convierte Markdown a HTML seguro. [[Nota]] se vuelve un enlace interno. */
export function Markdown({ texto, onAbrir }: { texto: string; onAbrir: (nombre: string) => void }) {
  const html = useMemo(() => {
    const sinFrontmatter = texto.replace(/^---\n[\s\S]*?\n---\n?/, '')
    const conWiki = sinFrontmatter.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, (_m, destino: string, alias?: string) => {
      const etiqueta = (alias || destino.split('/').pop() || destino).replace(/[<>&"]/g, '')
      return `<a class="wiki" data-nota="${destino.replace(/[<>&"]/g, '')}">${etiqueta}</a>`
    })
    return DOMPurify.sanitize(marked.parse(conWiki, { async: false }) as string, { ADD_ATTR: ['data-nota'] })
  }, [texto])

  function alClic(e: MouseEvent<HTMLDivElement>) {
    const a = (e.target as HTMLElement).closest('a')
    if (!a) return
    const nota = a.getAttribute('data-nota')
    if (nota) {
      e.preventDefault()
      onAbrir(nota)
    } else if (a.href && new URL(a.href).origin !== location.origin) {
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
    }
  }

  return <div className="nota" onClick={alClic} dangerouslySetInnerHTML={{ __html: html }} />
}
