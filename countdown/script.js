const targetInput = document.getElementById('target');
const daysEl = document.getElementById('days');
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');

let intervalId;

function updateCountdown() {
    const targetDate = new Date(targetInput.value);
    const now = new Date();
    const diff = targetDate - now;

    if (isNaN(diff) || diff <= 0) {
        clearInterval(intervalId);
        daysEl.textContent = hoursEl.textContent = minutesEl.textContent = secondsEl.textContent = '0';
        return;
    }

    const secs = Math.floor(diff / 1000) % 60;
    const mins = Math.floor(diff / (1000 * 60)) % 60;
    const hrs = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    daysEl.textContent = days;
    hoursEl.textContent = hrs;
    minutesEl.textContent = mins;
    secondsEl.textContent = secs;

    // update data-value for glitch layers
    daysEl.setAttribute('data-value', days);
    hoursEl.setAttribute('data-value', hrs);
    minutesEl.setAttribute('data-value', mins);
    secondsEl.setAttribute('data-value', secs);
}

// Listen for pick
 targetInput.addEventListener('change', () => {
    clearInterval(intervalId);
    updateCountdown();
    intervalId = setInterval(updateCountdown, 1000);
});
