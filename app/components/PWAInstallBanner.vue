<script setup lang="ts">
import { ref, onMounted } from "vue";

const showBanner = ref(false);
const deferredPrompt = ref<any>(null);

const dismissBanner = () => {
	showBanner.value = false;
	localStorage.setItem("pwa-install-dismissed", "true");
};

const installPWA = async () => {
	if (deferredPrompt.value) {
		deferredPrompt.value.prompt();
		const { outcome } = await deferredPrompt.value.userChoice;

		if (outcome === "accepted") {
			console.log("PWA installed successfully");
		}

		deferredPrompt.value = null;
		dismissBanner();
	}
};

onMounted(() => {
	console.log("PWA Banner: Component mounted");

	// Check if user already dismissed the banner
	const dismissed = localStorage.getItem("pwa-install-dismissed");
	if (dismissed) {
		console.log("PWA Banner: Previously dismissed by user");
		return;
	}

	// Check if app is already installed
	if (
		window.matchMedia &&
		window.matchMedia("(display-mode: standalone)").matches
	) {
		console.log("PWA Banner: App already running in standalone mode");
		return;
	}

	// Check if running in PWA mode on iOS
	const isInStandaloneMode = (navigator as any).standalone;
	if (isInStandaloneMode) {
		console.log("PWA Banner: Running in iOS standalone mode");
		return;
	}

	// Listen for beforeinstallprompt event
	window.addEventListener("beforeinstallprompt", (e) => {
		console.log("PWA Banner: beforeinstallprompt event fired");
		e.preventDefault();
		deferredPrompt.value = e;
		showBanner.value = true;
	});

	// Show banner for iOS users (Safari doesn't support beforeinstallprompt)
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
	const isSafari =
		/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

	console.log("PWA Banner: Device detection", {
		isIOS,
		isSafari,
		userAgent: navigator.userAgent,
		isInStandaloneMode,
	});

	if (isIOS && isSafari && !isInStandaloneMode) {
		console.log("PWA Banner: Showing for iOS Safari");
		showBanner.value = true;
	}

	// For testing purposes - show banner after 3 seconds if no other conditions met
	// Remove this in production
	setTimeout(() => {
		if (!showBanner.value && !dismissed && !isInStandaloneMode) {
			console.log("PWA Banner: Showing test banner (remove in production)");
			showBanner.value = true;
		}
	}, 3000);
});
</script>

<template>
  <Transition name="banner">
    <div v-if="showBanner" class="pwa-banner">
      <div class="banner-content">
        <div class="banner-info">
          <div class="banner-icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" />
            </svg>
          </div>
          <div class="banner-text">
            <h4>📱 Installa come App</h4>
            <p>Accesso rapido dalla home screen</p>
          </div>
        </div>
        <div class="banner-actions">
          <button @click="installPWA" class="install-btn" v-if="deferredPrompt">
            Installa
          </button>
          <div v-else class="ios-hint">
            <span>Tocca</span>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.58L19 8l-9 9z" />
            </svg>
          </div>
          <button @click="dismissBanner" class="dismiss-btn" aria-label="Chiudi">
            ✕
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.pwa-banner {
  position: fixed;
  bottom: var(--sp-2);
  left: var(--sp-2);
  right: var(--sp-2);
  z-index: 1000;
  max-width: 28rem;
  margin: 0 auto;
}

.banner-content {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--sp-1);
  padding: var(--sp-2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--sp-2);
  backdrop-filter: blur(8px);
  position: relative;
}

.banner-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--primary);
  border-radius: var(--sp-1) var(--sp-1) 0 0;
}

.banner-info {
  display: flex;
  align-items: center;
  gap: var(--sp-2);
  flex: 1;
  min-width: 0;
}

.banner-icon {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  background: var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--white);
}

.banner-icon svg {
  width: 1rem;
  height: 1rem;
}

.banner-text {
  flex: 1;
  min-width: 0;
}

.banner-text h4 {
  margin: 0 0 var(--sp-05) 0;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-base-content);
  line-height: 1.3;
}

.banner-text p {
  margin: 0;
  font-size: 0.75rem;
  color: var(--text-secodary-content);
  line-height: 1.3;
}

.banner-actions {
  display: flex;
  align-items: center;
  gap: var(--sp-1);
  flex-shrink: 0;
}

.install-btn {
  background: var(--primary);
  color: var(--white);
  border: none;
  border-radius: var(--sp-05);
  padding: var(--sp-05) var(--sp-2);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.install-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.install-btn:active {
  transform: translateY(0);
}

.ios-hint {
  display: flex;
  align-items: center;
  gap: var(--sp-05);
  font-size: 0.7rem;
  color: var(--text-secodary-content);
  max-width: 4rem;
  text-align: center;
}

.ios-hint span {
  white-space: nowrap;
}

.ios-hint svg {
  width: 0.75rem;
  height: 0.75rem;
  color: var(--primary);
  flex-shrink: 0;
}

.dismiss-btn {
  background: none;
  border: none;
  color: var(--text-secodary-content);
  cursor: pointer;
  padding: var(--sp-05);
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  width: 1.5rem;
  height: 1.5rem;
  line-height: 1;
}

.dismiss-btn:hover {
  background: var(--bg-neutral);
  color: var(--text-base-content);
}

/* Animations */
.banner-enter-active {
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.banner-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 1, 1);
}

.banner-enter-from {
  opacity: 0;
  transform: translateY(100%) scale(0.9);
}

.banner-leave-to {
  opacity: 0;
  transform: translateY(50px) scale(0.95);
}

.banner-enter-to,
.banner-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Responsive */
@media (max-width: 640px) {
  .pwa-banner {
    bottom: var(--sp-1);
    left: var(--sp-1);
    right: var(--sp-1);
  }

  .banner-content {
    padding: var(--sp-1) var(--sp-2);
    gap: var(--sp-1);
  }

  .banner-info {
    gap: var(--sp-1);
  }

  .banner-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  .banner-icon svg {
    width: 0.875rem;
    height: 0.875rem;
  }

  .banner-text h4 {
    font-size: 0.8rem;
  }

  .banner-text p {
    font-size: 0.7rem;
  }

  .install-btn {
    padding: var(--sp-05) var(--sp-1);
    font-size: 0.7rem;
  }

  .ios-hint {
    font-size: 0.65rem;
    max-width: 3rem;
  }

  .dismiss-btn {
    width: 1.25rem;
    height: 1.25rem;
    font-size: 0.75rem;
  }
}

/* Subtle pulse animation for the icon */
@keyframes pulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.banner-icon {
  animation: pulse 3s ease-in-out infinite;
}
</style>