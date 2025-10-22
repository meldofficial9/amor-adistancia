import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Music, Pause, Play, Upload, ImagePlus, Pencil, Check, X, ChevronLeft, ChevronRight, BookOpen, Gamepad2, Settings2, Download, UploadCloud } from 'lucide-react'

function cryptoRandomId() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}
const STORAGE_KEY = 'amorLD_config_v1'

const defaultConfig = {
  title: 'Para mi amor 💌',
  letter: `Mi vida,
Gracias por caminar conmigo aunque la distancia nos pruebe. Abre este sobre para leer mi carta, escuchar nuestra canción y ver recuerdos que me hacen sonreír. Después hay un pequeño juego… si lo pasas, te espera una sorpresita 💖`,
  music: { type: 'none', url: '' },
  slides: [
    { id: cryptoRandomId(), caption: 'Nuestro comienzo ✨', url: '' },
    { id: cryptoRandomId(), caption: 'La risa que me encanta 😍', url: '' },
  ],
  quiz: {
    phases: [
      { title: 'Fase 1 — Lo básico', passScore: 2, questions: [
        { q: '¿Cuál es mi color favorito?', a: 'azul' },
        { q: '¿En qué mes nos conocimos?', a: 'mayo' },
        { q: '¿Café o té?', a: 'café' },
      ]},
      { title: 'Fase 2 — Más profundo', passScore: 2, questions: [
        { q: '¿Qué es lo que más admiro de ti?', a: 'paciencia' },
        { q: '¿A dónde sueño viajar contigo?', a: 'parís' },
        { q: '¿Qué canción siento que es “nuestra”?', a: 'sorpresa' },
      ]},
    ],
    finalMessage: '¡Lo lograste! Eres mi respuesta favorita a todas las preguntas. 💘'
  }
}

function loadConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultConfig
    const parsed = JSON.parse(raw)
    return {
      ...defaultConfig,
      ...parsed,
      slides: parsed.slides?.length ? parsed.slides : defaultConfig.slides,
      quiz: parsed.quiz || defaultConfig.quiz,
    }
  } catch { return defaultConfig }
}
function saveConfig(cfg){ localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg)) }

/* ---------------- Envelope (agrandado en desktop) ---------------- */
function Envelope({ onOpen }){
  return (
    <motion.div
      className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-100 to-pink-200 pt-16"
      initial={{opacity:0}}
      animate={{opacity:1}}
    >
      <motion.div
        className="relative w-[360px] h-[250px] md:w-[420px] md:h-[280px] cursor-pointer"
        onClick={onOpen}
        whileHover={{scale:1.03}}
        whileTap={{scale:0.98}}
      >
        <div className="absolute inset-0 bg-white shadow-xl rounded-lg" />
        <div className="absolute inset-0 rounded-lg overflow-hidden">
          <div className="absolute inset-0 bg-rose-200" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 55%)' }} />
          <div className="absolute inset-0 bg-rose-300" style={{ clipPath: 'polygon(0 100%, 100% 100%, 50% 45%)' }} />
        </div>
        <motion.div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
          <Heart className="text-rose-500" size={36} />
          <span className="text-rose-600 font-semibold">Abrir carta</span>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

function TopBar({ onShowConfig, onGoGallery, onGoQuiz, playing, togglePlay }){
  return (
    <div className="fixed top-0 left-0 right-0 z-40 backdrop-blur bg-white/60 border-b">
      <div className="max-w-4xl mx-auto px-4 py-2 flex items-center gap-3">
        <BookOpen className="text-rose-600" />
        <span className="font-semibold">Amor a Distancia</span>
        <div className="ml-auto flex items-center gap-2">
          <button className="btn" onClick={onGoGallery}><ImagePlus size={18}/> Recuerdos</button>
          <button className="btn" onClick={onGoQuiz}><Gamepad2 size={18}/> Juego</button>
          <button className="btn" onClick={togglePlay}>{playing ? <Pause size={18}/> : <Play size={18}/>} Música</button>
          <button className="btn" onClick={onShowConfig}><Settings2 size={18}/> Configurar</button>
        </div>
      </div>
    </div>
  )
}

function LetterModal({ title, text, onClose }){
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 p-4">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Heart className="text-rose-600"/>
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{text}</p>
        <div className="mt-4 flex justify-end">
          <button className="btn" onClick={onClose}><Check size={16}/> Cerrar</button>
        </div>
      </motion.div>
    </div>
  )
}

/* ---------------- Gallery (fix w-full + más aire top) ---------------- */
function Gallery({ cfg, setCfg }){
  const [index, setIndex] = useState(0)
  const [edit, setEdit] = useState(false)
  const fileRef = useRef(null)
  const slides = cfg.slides
  const current = slides[index]

  function next(){ setIndex((i)=> (i+1) % slides.length) }
  function prev(){ setIndex((i)=> (i-1+slides.length) % slides.length) }

  function onUpload(e){
    const f = e.target.files?.[0]
    if(!f) return
    const url = URL.createObjectURL(f)
    const s = { id: cryptoRandomId(), caption: 'Nuevo recuerdo', url }
    const newCfg = { ...cfg, slides: [...slides, s] }
    setCfg(newCfg); saveConfig(newCfg); setIndex(slides.length)
  }
  function onCaptionChange(val){
    const updated = slides.map(s=> s.id===current.id? {...s, caption: val}: s)
    const newCfg = { ...cfg, slides: updated }
    setCfg(newCfg); saveConfig(newCfg)
  }
  function removeCurrent(){
    if(slides.length <= 1) return
    const updated = slides.filter(s => s.id !== current.id)
    const newCfg = { ...cfg, slides: updated }
    setCfg(newCfg); saveConfig(newCfg); setIndex(0)
  }

  return (
    <div className="max-w-4xl mx-auto pt-24 px-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">Nuestros recuerdos</h3>
        <div className="flex items-center gap-2">
          <button className="btn" onClick={()=>fileRef.current?.click()}><Upload size={16}/> Añadir foto</button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onUpload}/>
          <button className="btn" onClick={()=>setEdit(v=>!v)}>{edit? <Check size={16}/> : <Pencil size={16}/>} {edit? 'Guardar' : 'Editar texto'}</button>
          <button className="btn" onClick={removeCurrent}><X size={16}/> Eliminar</button>
        </div>
      </div>

      <div className="relative bg-white rounded-2xl shadow overflow-hidden">
        <div className="aspect-video flex items-center justify-center bg-gray-100">
          {current?.url ? (
            <img src={current.url} alt="recuerdo" className="max-h-full max-w-full object-contain"/>
          ) : (
            <div className="text-gray-500 text-sm p-6 text-center">
              Sube una foto para este recuerdo.
              <br/>También puedes añadir más imágenes con “Añadir foto”.
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-rose-50/60">
          {edit ? (
            <input
              value={current?.caption||''}
              onChange={(e)=>onCaptionChange(e.target.value)}
              className="w-full rounded-md border px-3 py-2"  /* <- corregido w-full */
            />
          ) : (
            <p className="text-center text-rose-700 font-medium">{current?.caption}</p>
          )}
        </div>
        <div className="absolute inset-y-0 left-0 flex items-center">
          <button className="nav-btn ml-2" onClick={prev}><ChevronLeft/></button>
        </div>
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button className="nav-btn mr-2" onClick={next}><ChevronRight/></button>
        </div>
      </div>
    </div>
  )
}

/* ---------------- Quiz (más aire top) ---------------- */
function Quiz({ cfg }){
  const [phase, setPhase] = useState(0)
  const [answers, setAnswers] = useState({})
  const p = cfg.quiz.phases[phase]
  const [score, setScore] = useState(0)
  const [done, setDone] = useState(false)

  if(done) return (
    <div className="max-w-xl mx-auto pt-24 px-4 text-center">
      <h3 className="text-2xl font-semibold text-rose-700 mb-3">{cfg.quiz.finalMessage}</h3>
      <p className="text-gray-600">Pista: puedes volver a las fotos cuando quieras. 💞</p>
    </div>
  )

  function normalize(s){ return (s||'').trim().toLowerCase() }
  function submit(){
    let s=0
    for(const q of p.questions){
      if(normalize(answers[q.q])===normalize(q.a)) s++
    }
    setScore(s)
    if(s>=p.passScore){
      if(phase < cfg.quiz.phases.length-1){ setPhase(phase+1); setAnswers({}); setScore(0) }
      else { setDone(true) }
    }
  }

  return (
    <div className="max-w-2xl mx-auto pt-24 px-4">
      <h3 className="text-xl font-semibold text-rose-700 mb-1">{p.title}</h3>
      <p className="text-sm text-gray-600 mb-4">Responde correctamente al menos {p.passScore} para avanzar.</p>
      <div className="space-y-4">
        {p.questions.map((item, idx)=>(
          <div key={idx} className="bg-white rounded-xl border p-4">
            <p className="font-medium mb-2">{item.q}</p>
            <input
              className="w-full rounded-md border px-3 py-2"
              value={answers[item.q]||''}
              onChange={(e)=>setAnswers(prev=>({...prev, [item.q]: e.target.value}))}
              placeholder="Tu respuesta"
            />
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-4">
        <button className="btn" onClick={submit}><Check size={16}/> Enviar</button>
        {score>0 && <span className="text-sm text-gray-600">Aciertos: {score}</span>}
      </div>
    </div>
  )
}

function ConfigPanel({ cfg, setCfg, onClose }){
  const [local, setLocal] = useState(JSON.stringify(cfg, null, 2))
  const fileRef = useRef(null)

  function save(){
    try{
      const parsed = JSON.parse(local)
      setCfg(parsed); saveConfig(parsed); onClose()
    }catch(e){ alert('JSON inválido: ' + e.message) }
  }
  function exportJson(){
    const blob = new Blob([JSON.stringify(cfg, null, 2)], { type:'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'amor-config.json'; a.click()
  }
  function onImport(e){
    const f = e.target.files?.[0]; if(!f) return
    const reader = new FileReader(); reader.onload = () => setLocal(reader.result); reader.readAsText(f)
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 p-4 flex items-center justify-center">
      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} className="bg-white max-w-3xl w-full rounded-2xl shadow-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Settings2 className="text-rose-600"/><h4 className="font-semibold">Configurar página</h4>
          <div className="ml-auto flex items-center gap-2">
            <button className="btn" onClick={exportJson}><Download size={16}/> Exportar</button>
            <button className="btn" onClick={()=>fileRef.current?.click()}><UploadCloud size={16}/> Importar</button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={onImport}/>
          </div>
        </div>
        <textarea value={local} onChange={(e)=>setLocal(e.target.value)} className="w-full h-96 border rounded-md p-2 font-mono text-sm"/>
        <div className="flex justify-end gap-2 mt-3">
          <button className="btn" onClick={onClose}><X size={16}/> Cancelar</button>
          <button className="btn" onClick={save}><Check size={16}/> Guardar</button>
        </div>
      </motion.div>
    </div>
  )
}

export default function App(){
  const [cfg, setCfg] = useState(loadConfig())
  const [showLetter, setShowLetter] = useState(false)
  const [view, setView] = useState('envelope')
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [showCfg, setShowCfg] = useState(false)

  useEffect(()=>{ saveConfig(cfg) }, [cfg])

  function handleOpen(){
    setShowLetter(true)
    if(audioRef.current && cfg.music.type !== 'none'){
      audioRef.current.play().then(()=> setPlaying(true)).catch(()=>{})
    }
  }
  function togglePlay(){
    if(!audioRef.current) return
    if(playing){ audioRef.current.pause(); setPlaying(false) }
    else { audioRef.current.play().then(()=> setPlaying(true)).catch(()=>{}) }
  }

  const [uploadedURL, setUploadedURL] = useState('')
  const musicSrc = useMemo(()=>{
    if(cfg.music.type==='url') return cfg.music.url
    if(cfg.music.type==='upload') return uploadedURL
    return ''
  }, [cfg.music, uploadedURL])

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white text-gray-800">
      <TopBar
        onShowConfig={()=>setShowCfg(true)}
        onGoGallery={()=>setView('gallery')}
        onGoQuiz={()=>setView('quiz')}
        playing={playing}
        togglePlay={togglePlay}
      />

      {cfg.music.type!=='none' && (<audio ref={audioRef} src={musicSrc} loop />)}

      {cfg.music.type==='upload' && (
        <div className="fixed bottom-3 right-3 z-40">
          <label className="btn cursor-pointer"><Music size={16}/> Subir música
            <input
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e)=>{
                const f = e.target.files?.[0]; if(!f) return;
                const u = URL.createObjectURL(f); setUploadedURL(u)
              }}
            />
          </label>
        </div>
      )}

      {view==='envelope' && (<Envelope onOpen={handleOpen} />)}

      <AnimatePresence>
        {showLetter && (
          <LetterModal
            title={cfg.title}
            text={cfg.letter}
            onClose={()=>{ setShowLetter(false); setView('gallery') }}
          />
        )}
      </AnimatePresence>

      {view==='gallery' && (<Gallery cfg={cfg} setCfg={setCfg} />)}
      {view==='quiz' && (<Quiz cfg={cfg} />)}
      {showCfg && (<ConfigPanel cfg={cfg} setCfg={setCfg} onClose={()=>setShowCfg(false)} />)}
    </div>
  )
}
