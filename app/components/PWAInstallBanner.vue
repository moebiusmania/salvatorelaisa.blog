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

<style>
@import './PWAInstallBanner.css';
</style>