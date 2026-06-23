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
		await deferredPrompt.value.userChoice;

		deferredPrompt.value = null;
		dismissBanner();
	}
};

onMounted(() => {
	// Check if user already dismissed the banner
	const dismissed = localStorage.getItem("pwa-install-dismissed");
	if (dismissed) {
		return;
	}

	// Check if app is already installed
	if (
		window.matchMedia &&
		window.matchMedia("(display-mode: standalone)").matches
	) {
		return;
	}

	// Check if running in PWA mode on iOS
	const isInStandaloneMode = (navigator as any).standalone;
	if (isInStandaloneMode) {
		return;
	}

	// Listen for beforeinstallprompt event
	window.addEventListener("beforeinstallprompt", (e) => {
		e.preventDefault();
		deferredPrompt.value = e;
		showBanner.value = true;
	});

	// Show banner for iOS users (Safari doesn't support beforeinstallprompt)
	const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
	const isSafari =
		/Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);

	if (isIOS && isSafari && !isInStandaloneMode) {
		showBanner.value = true;
	}
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
            <h4>Installa come App</h4>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round"
              stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style>
@import './PWAInstallBanner.css';
</style>