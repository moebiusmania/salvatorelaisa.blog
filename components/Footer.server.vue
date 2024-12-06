<script setup lang="ts">
const today: Date = new Date();
</script>

<template>
  <footer>
    <div>
      <span>Salvatore Laisa Blog</span>
      <p>
        &copy; 2010 - {{ today.getFullYear() }} — sviluppato con
        <a href="https://nuxt.com/" rel="noopener noreferrer" target="_blank">Nuxt 3</a>
      </p>
      <div class="social">
        <a href="https://github.com/moebiusmania" target="_blank" rel="noopener noreferrer">
          <svg role="img" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <title>GitHub</title>
            <path
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12">
            </path>
          </svg>
        </a>

        <a href="https://www.youtube.com/channel/UCxaNVAQjuYZdpCrDukpVnxg" target="_blank" rel="noopener noreferrer">
          <svg role="img" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <title>YouTube</title>
            <path
              d="M23.499 6.203a3.008 3.008 0 00-2.089-2.089c-1.87-.501-9.4-.501-9.4-.501s-7.509-.01-9.399.501a3.008 3.008 0 00-2.088 2.09A31.258 31.26 0 000 12.01a31.258 31.26 0 00.523 5.785 3.008 3.008 0 002.088 2.089c1.869.502 9.4.502 9.4.502s7.508 0 9.399-.502a3.008 3.008 0 002.089-2.09 31.258 31.26 0 00.5-5.784 31.258 31.26 0 00-.5-5.808zm-13.891 9.4V8.407l6.266 3.604z">
            </path>
          </svg>
        </a>

        <a href="https://www.linkedin.com/in/salvatorelaisa" target="_blank" rel="noopener noreferrer">
          <svg role="img" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <title>LinkedIn</title>
            <path
              d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z">
            </path>
          </svg>
        </a>

        <!-- <a href="https://twitter.com/moebiusmania" target="_blank" rel="noopener noreferrer">
          <svg role="img" fill="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <title>X (Twitter)</title>
            <path
              d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z">
            </path>
          </svg>
        </a> -->

        <a href="https://threads.net/moebiusmania" target="_blank" rel="noopener noreferrer">
          <svg role="img" fill="currentColor" xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision"
            text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd"
            clip-rule="evenodd" viewBox="0 0 512 512" width="24px" height="24px">
            <title>Threads</title>
            <path
              d="M105 0h302c57.75 0 105 47.25 105 105v302c0 57.75-47.25 105-105 105H105C47.25 512 0 464.75 0 407V105C0 47.25 47.25 0 105 0z" />
            <path fill="#fff" fill-rule="nonzero"
              d="M337.36 243.58c-1.46-.7-2.95-1.38-4.46-2.02-2.62-48.36-29.04-76.05-73.41-76.33-25.6-.17-48.52 10.27-62.8 31.94l24.4 16.74c10.15-15.4 26.08-18.68 37.81-18.68h.4c14.61.09 25.64 4.34 32.77 12.62 5.19 6.04 8.67 14.37 10.39 24.89-12.96-2.2-26.96-2.88-41.94-2.02-42.18 2.43-69.3 27.03-67.48 61.21.92 17.35 9.56 32.26 24.32 42.01 12.48 8.24 28.56 12.27 45.26 11.35 22.07-1.2 39.37-9.62 51.45-25.01 9.17-11.69 14.97-26.84 17.53-45.92 10.51 6.34 18.3 14.69 22.61 24.73 7.31 17.06 7.74 45.1-15.14 67.96-20.04 20.03-44.14 28.69-80.55 28.96-40.4-.3-70.95-13.26-90.81-38.51-18.6-23.64-28.21-57.79-28.57-101.5.36-43.71 9.97-77.86 28.57-101.5 19.86-25.25 50.41-38.21 90.81-38.51 40.68.3 71.76 13.32 92.39 38.69 10.11 12.44 17.73 28.09 22.76 46.33l28.59-7.63c-6.09-22.45-15.67-41.8-28.72-57.85-26.44-32.53-65.1-49.19-114.92-49.54h-.2c-49.72.35-87.96 17.08-113.64 49.73-22.86 29.05-34.65 69.48-35.04 120.16v.24c.39 50.68 12.18 91.11 35.04 120.16 25.68 32.65 63.92 49.39 113.64 49.73h.2c44.2-.31 75.36-11.88 101.03-37.53 33.58-33.55 32.57-75.6 21.5-101.42-7.94-18.51-23.08-33.55-43.79-43.48zm-76.32 71.76c-18.48 1.04-37.69-7.26-38.64-25.03-.7-13.18 9.38-27.89 39.78-29.64 3.48-.2 6.9-.3 10.25-.3 11.04 0 21.37 1.07 30.76 3.13-3.5 43.74-24.04 50.84-42.15 51.84z" />
          </svg>
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
footer {
  color: var(--text);

  &>div {
    display: flex;
    padding: var(--sp-4) var(--sp-3);
    flex-direction: column;
    align-items: center;
    max-width: 64rem;
    margin: 0 auto;
    justify-content: center;

    @media (min-width: 640px) {
      flex-direction: row;
    }

    &>span {
      margin-left: var(--sp-3);
      font-size: 1.25rem;
      line-height: 1.75rem;
    }

    &>p {
      display: flex;
      margin: var(--sp-2) 0 0 0;
      font-size: 0.875rem;
      line-height: 1.25rem;
      color: var(--text-content-dark);

      @media (min-width: 640px) {
        padding: var(--sp-1) 0 var(--sp-1) var(--sp-2);
        margin-top: 0;
        margin-left: var(--sp-2);
        border-left-width: 2px;
      }

      & a {
        margin-left: 0.25rem;
        color: var(--primary);
      }
    }

    &>.social {
      display: flex;
      margin-top: var(--sp-2);
      gap: 0.75rem;
      justify-content: center;
      width: 9rem;

      @media (min-width: 640px) {
        margin-top: 0;
      }

      @media (min-width: 768px) {
        justify-content: flex-end;
      }

      &>a {
        color: var(--text-base-content) !important;

        & svg {
          width: 1.25rem;
          height: 1.25rem;
        }
      }

      & a:hover {
        color: var(--primary);
      }
    }
  }
}
</style>
