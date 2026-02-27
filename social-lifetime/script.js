(function(){
  const input = document.getElementById('hours');
  const btn = document.getElementById('calc');
  const hoursYearEl = document.getElementById('hoursYear');
  const daysYearEl = document.getElementById('daysYear');
  const percentEl = document.getElementById('percentLife');

  function clamp(v,min,max){return Math.max(min,Math.min(max,v))}

  // animate numeric value (supports decimals)
  function animateValue(el, start, end, duration=800, decimals=0, suffix=''){
    let startTime=null;
    const diff = end - start;
    function step(ts){
      if(!startTime) startTime = ts;
      const t = Math.min(1,(ts - startTime)/duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const cur = start + diff * eased;
      el.textContent = Number(cur).toFixed(decimals) + suffix;
      if(t<1) requestAnimationFrame(step);
      else {
        el.classList.add('anim');
        setTimeout(()=>el.classList.remove('anim'),600);
      }
    }
    requestAnimationFrame(step);
  }

  function calculate(){
    let daily = parseFloat(input.value);
    if(isNaN(daily) || daily < 0) daily = 0;
    daily = clamp(daily,0,24);

    const hoursPerYear = daily * 365;
    const daysPerYear = hoursPerYear / 24;
    const wakingPerYear = 16 * 365; // 16 waking hours per day assumed
    const percentWaking = (hoursPerYear / wakingPerYear) * 100;

    // animate from previous values (parse existing text)
    const prevHours = parseFloat(hoursYearEl.textContent) || 0;
    const prevDays = parseFloat(daysYearEl.textContent) || 0;
    const prevPct = parseFloat(percentEl.textContent) || 0;

    animateValue(hoursYearEl, prevHours, hoursPerYear, 900, 1, '');
    animateValue(daysYearEl, prevDays, daysPerYear, 900, 2, '');
    animateValue(percentEl, prevPct, percentWaking, 900, 2, '%');
  }

  btn.addEventListener('click', calculate);
  input.addEventListener('keydown', (e)=>{if(e.key==='Enter') calculate();});

  // initial
  window.addEventListener('load', calculate);
})();
