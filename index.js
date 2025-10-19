const $ = sel => document.querySelector(sel)
const format = n => n.toLocaleString('ko-KR') + '원'

const BAL_KEY = 'neon_balance_v1'

function loadBalance(){
  const raw = localStorage.getItem(BAL_KEY)
  return raw ? Number(raw) : 10000
}
function saveBalance(v){
  localStorage.setItem(BAL_KEY, String(v))
  $('#balance').textContent = format(v)
}

function showLog(id, text, ok){
  const el = $(id)
  el.textContent = text
  el.classList.toggle('ok', !!ok)
  el.classList.toggle('bad', ok===false)
}

let balance = loadBalance()
document.addEventListener('DOMContentLoaded', ()=>{
  saveBalance(balance)

  $('#depositBtn').addEventListener('click', ()=>{
    const v = Math.max(1, Number($('#depositAmt').value || 0))
    if(!v) return
    balance += v
    saveBalance(balance)
    $('#depositAmt').value = ''
    showLog('#cfLog', `충전 완료: ${format(v)}`, true)
  })

  $('#resetBtn').addEventListener('click', ()=>{
    if(!confirm('잔액을 초기화 하시겠습니까?')) return
    balance = 10000
    saveBalance(balance)
    showLog('#cfLog', '잔액이 초기화되었습니다.', true)
  })

  // play buttons
  document.querySelectorAll('.btn.play').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      const game = btn.dataset.game
      if(game === 'coin') await playCoin()
      if(game === 'slot') await playSlot()
      if(game === 'quick') await playQuick()
    })
  })
})

async function playCoin(){
  const amt = Math.max(0, Number($('#cfAmount').value || 0))
  if(amt<=0){ showLog('#cfLog','베팅 금액을 입력하세요.', false); return }
  if(amt>balance){ showLog('#cfLog','잔액이 부족합니다.', false); return }
  const pick = $('#cfPick').value
  // simple animation
  showLog('#cfLog','동전이 굴러갑니다...')
  await new Promise(r=>setTimeout(r,700))
  const result = Math.random() < 0.5 ? 'heads' : 'tails'
  if(result === pick){
    const win = amt * 2
    balance += win
    saveBalance(balance)
    showLog('#cfLog', `정답! ${format(win)} 획득.`, true)
  } else {
    balance -= amt
    saveBalance(balance)
    showLog('#cfLog', `꽝... ${format(amt)} 손실.`, false)
  }
}

const SLOT_ICONS = ['🍒','🍋','🔔','⭐','🍀']
function randomIcon(){ return SLOT_ICONS[Math.floor(Math.random()*SLOT_ICONS.length)] }

async function playSlot(){
  const amt = Math.max(0, Number($('#slotAmount').value || 0))
  if(amt<=0){ showLog('#slotLog','베팅 금액을 입력하세요.', false); return }
  if(amt>balance){ showLog('#slotLog','잔액이 부족합니다.', false); return }
  balance -= amt // cost to spin
  saveBalance(balance)

  const reels = [...document.querySelectorAll('.reel')]
  // spin visual
  for(const r of reels){ r.classList.add('spin') }
  await new Promise(r=>setTimeout(r,700))
  for(const r of reels){ r.classList.remove('spin') }

  const results = [randomIcon(), randomIcon(), randomIcon()]
  reels.forEach((r,i)=> r.textContent = results[i])

  const [a,b,c] = results
  if(a===b && b===c){
    const win = amt * 5
    balance += win
    saveBalance(balance)
    showLog('#slotLog', `대박! ${results.join(' ')} => ${format(win)} 획득!`, true)
  } else if(a===b || b===c || a===c){
    const win = Math.floor(amt * 1.5)
    balance += win
    saveBalance(balance)
    showLog('#slotLog', `아깝다! ${results.join(' ')} => ${format(win)} 획득`, true)
  } else {
    showLog('#slotLog', `꽝 ${results.join(' ')}...`, false)
  }
}

async function playQuick(){
  const amt = Math.max(0, Number($('#qdAmount').value || 0))
  const guess = Number($('#qdGuess').value)
  if(amt<=0){ showLog('#qdLog','베팅 금액을 입력하세요.', false); return }
  if(Number.isNaN(guess) || guess<0 || guess>9){ showLog('#qdLog','0~9 사이 숫자를 입력하세요.', false); return }
  if(amt>balance){ showLog('#qdLog','잔액이 부족합니다.', false); return }

  showLog('#qdLog','숫자를 뽑는 중...')
  await new Promise(r=>setTimeout(r,800))
  const drawn = Math.floor(Math.random()*10)
  if(drawn === guess){
    const win = amt * 10
    balance += win
    saveBalance(balance)
    showLog('#qdLog', `정답! ${drawn} => ${format(win)} 획득!`, true)
  } else {
    balance -= amt
    saveBalance(balance)
    showLog('#qdLog', `틀렸습니다 ${drawn} — ${format(amt)} 손실.`, false)
  }
}
