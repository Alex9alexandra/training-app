import { authStore } from "./authStore";

const INACTIVITY_LIMIT = 15 * 60 * 1000; 
let timer: ReturnType<typeof setTimeout> | null = null;

function resetTimer() {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    authStore.clear();
    window.dispatchEvent(new Event("auth:logout"));
  }, INACTIVITY_LIMIT);
}

const EVENTS = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"];

export function startInactivityTimer() {
  resetTimer();
  EVENTS.forEach(e => window.addEventListener(e, resetTimer));
}

export function stopInactivityTimer() {
  if (timer) clearTimeout(timer);
  EVENTS.forEach(e => window.removeEventListener(e, resetTimer));
}