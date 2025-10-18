// Interacciones simples: smooth scroll, modales y mini-juego de corazones
document.addEventListener('DOMContentLoaded', ()=>{
  // smooth scroll for nav
  document.querySelectorAll('a[href^="#"]').forEach(a=>{
    a.addEventListener('click', e=>{
      const href = a.getAttribute('href')
      if(href.startsWith('#')){
        e.preventDefault()
        const el = document.querySelector(href)
        if(el) el.scrollIntoView({behavior:'smooth',block:'start'})
      }
    })
  })

  // modal helpers
  function openModal(modal){ modal.setAttribute('aria-hidden','false') }
  function closeModal(modal){ modal.setAttribute('aria-hidden','true') }

  document.querySelectorAll('[data-close]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const modal = btn.closest('.modal')
      if(modal) closeModal(modal)
    })
  })

  // Game modal
  const openGame = document.getElementById('openGame')
  const gameModal = document.getElementById('gameModal')
  const startGame = document.getElementById('startGame')
  const gameArea = document.getElementById('gameArea')
  const scoreEl = document.getElementById('score')
  let hearts = []
  // big message element
  let bigMessage

  if(openGame && gameModal){
    openGame.addEventListener('click', ()=> openModal(gameModal))
  }

  // When the game modal opens, show the big message and emit hearts
  if(gameModal){
    gameModal.addEventListener('transitionend', (e)=>{
      // ignore closing transitions
      if(gameModal.getAttribute('aria-hidden') === 'true') return
      if(!gameArea) return
      // create or show big message
      if(!bigMessage){
        bigMessage = document.createElement('div')
        bigMessage.className = 'big-message'
        bigMessage.textContent = 'TE QUIERO MUCHO'
        gameArea.appendChild(bigMessage)
      }
      // show with animation
      requestAnimationFrame(()=>{
        bigMessage.classList.add('show')
      })
    // emit fewer hearts and slower so se noten mejor
    emitHeartsBurst(gameArea, 10, 240)
      // remove show after a while
      setTimeout(()=>{ if(bigMessage) bigMessage.classList.remove('show') },3500)
    })
  }

  function randomPos(maxX,maxY){
    return {x: Math.random()*maxX, y: Math.random()*maxY}
  }

  function spawnHeart(){
    const h = document.createElement('div')
    h.className = 'heart'
    h.textContent = '❤'
    const rect = gameArea.getBoundingClientRect()
    const pos = randomPos(rect.width-30, rect.height-30)
    h.style.left = (pos.x + 15) + 'px'
    h.style.top = (pos.y + 15) + 'px'
    gameArea.appendChild(h)
    hearts.push(h)
    h.addEventListener('click', ()=>{
      const s = parseInt(scoreEl.textContent.replace(/\D/g,'')) || 0
      scoreEl.textContent = 'Puntos: ' + (s+1)
      h.remove()
    })
    // auto remove after 2.5s
    setTimeout(()=>{ if(h.parentElement) h.remove() },2500)
  }

  // emit floating hearts from the center of gameArea or message
  function emitFloatingHeart(x,y){
    const fh = document.createElement('div')
    fh.className = 'floating-heart'
    fh.textContent = '❤'
    fh.style.left = x + 'px'
    fh.style.top = y + 'px'
    gameArea.appendChild(fh)
    // random upward movement
    const dx = (Math.random()-0.5) * 80
    const dy = 120 + Math.random()*160
    requestAnimationFrame(()=>{
      fh.style.transform = `translate(${dx}px, -${dy}px) scale(${1 + Math.random()*0.3})`
      fh.style.opacity = '0'
    })
    // keep a bit longer so the animation can be apreciable
    setTimeout(()=>{ if(fh.parentElement) fh.remove() },2200)
  }

  /** emit a burst of floating hearts; delayMs controls spacing between hearts */
  function emitHeartsBurst(container, count, delayMs = 30){
    const rect = container.getBoundingClientRect()
    // emitter position: if bigMessage exists, use its center
    let ex = rect.width/2
    let ey = rect.height/2
    if(bigMessage){
      const bmRect = bigMessage.getBoundingClientRect()
      ex = bmRect.left - rect.left + bmRect.width/2
      ey = bmRect.top - rect.top + bmRect.height/2
    }
    for(let i=0;i<count;i++){
      setTimeout(()=>{ emitFloatingHeart(ex + (Math.random()-0.5)*60, ey + (Math.random()-0.5)*20) }, i*delayMs)
    }
  }

  // If there's an #inicio section (in index.html), show a welcome burst of hearts
  const inicio = document.getElementById('inicio')
  if(inicio){
    // create relative container for absolute particles
    const wrapper = inicio.querySelector('.hero-inner') || inicio
    // small delay so user sees the page first; use confetti instead of hearts
    setTimeout(()=>{ emitConfettiBurst(wrapper, 24, 60) }, 700)
  }

  // --- Confetti emitter (for portada) ---
  function emitConfettiParticle(container, x, y, color){
    const cf = document.createElement('div')
    cf.className = 'confetti'
    cf.style.left = x + 'px'
    cf.style.top = y + 'px'
    cf.style.background = color
    container.appendChild(cf)
    // random fall and rotation
    const dx = (Math.random()-0.5) * 120
    const dy = 160 + Math.random()*260
    const rot = (Math.random()-0.5) * 720
    requestAnimationFrame(()=>{
      cf.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`
      cf.style.opacity = '0'
    })
    setTimeout(()=>{ if(cf.parentElement) cf.remove() }, 3600)
  }

  function emitConfettiBurst(container, count, delayMs = 40){
    const rect = container.getBoundingClientRect()
    const ex = rect.width/2
    const ey = rect.height/2
    const colors = ['#ffd166','#ef476f','#06d6a0','#118ab2','#ffd6e0']
    for(let i=0;i<count;i++){
      setTimeout(()=>{
        const x = ex + (Math.random()-0.5)* (rect.width*0.6)
        const y = ey + (Math.random()-0.5)*20
        const color = colors[Math.floor(Math.random()*colors.length)]
        emitConfettiParticle(container, x, y, color)
      }, i*delayMs)
    }
  }

  if(startGame && gameArea && scoreEl){
    startGame.addEventListener('click', ()=>{
    // reset
    scoreEl.textContent = 'Puntos: 0'
    // remove existing hearts
    hearts.forEach(h=>h.remove())
    hearts = []
    let count = 0
    const interval = setInterval(()=>{
      spawnHeart()
      count++
      if(count>25){ clearInterval(interval) }
    },350)
    // stop after 10 seconds
    setTimeout(()=>{ clearInterval(interval) },10000)
    })
  }

  // Message modal for cards
  const messageModal = document.getElementById('messageModal')
  const messageBody = document.getElementById('messageBody')
  document.querySelectorAll('[data-open-message]').forEach((btn,i)=>{
    btn.addEventListener('click', ()=>{
      const card = btn.closest('.card')
      const text = card.querySelector('p').innerHTML
      const title = card.querySelector('h3').innerText
      messageBody.innerHTML = `<h3>${title}</h3><p>${text}</p>`
      openModal(messageModal)
    })
  })

  // Lightbox for history images (if present)
  const lightbox = document.getElementById('lightbox')
  const lightboxImg = document.getElementById('lightboxImg')
  const lightboxCaption = document.getElementById('lightboxCaption')
  document.querySelectorAll('.thumb').forEach(img=>{
    img.addEventListener('click', ()=>{
      const full = img.dataset.full || img.src
      lightboxImg.src = full
      lightboxImg.alt = img.alt || ''
      // try to use next sibling time-meta as caption
      const caption = img.closest('.timeline-item')?.querySelector('.time-meta')?.innerText || ''
      lightboxCaption.innerText = caption
      openModal(lightbox)
    })
  })

})
