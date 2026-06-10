// Builds branded controls while leaving native audio available if JavaScript fails.
(() => {
  const audioElements = Array.from(document.querySelectorAll(".track-card audio"));

  if (!audioElements.length) {
    return;
  }

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) {
      return "0:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainingSeconds}`;
  };

  const pauseOtherTracks = (activeAudio) => {
    audioElements.forEach((audio) => {
      if (audio !== activeAudio) {
        audio.pause();
      }
    });
  };

  document.body.classList.add("audio-enhanced");

  audioElements.forEach((audio, index) => {
    const card = audio.closest(".track-card");
    const title = card?.querySelector("h3")?.textContent?.trim() || `Track ${index + 1}`;
    const player = document.createElement("div");

    player.className = "custom-audio-player";
    player.innerHTML = `
      <button class="audio-toggle" type="button" aria-label="Play ${title}">
        <span class="audio-icon" aria-hidden="true"></span>
      </button>
      <div class="audio-control-body">
        <input class="audio-seek" type="range" min="0" max="100" step="0.1" value="0" aria-label="Seek ${title}">
        <div class="audio-time" aria-hidden="true">
          <span data-current-time>0:00</span>
          <span data-duration>0:00</span>
        </div>
      </div>
    `;

    audio.insertAdjacentElement("afterend", player);

    const toggle = player.querySelector(".audio-toggle");
    const seek = player.querySelector(".audio-seek");
    const currentTime = player.querySelector("[data-current-time]");
    const duration = player.querySelector("[data-duration]");

    const updateProgress = () => {
      const percentage = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      seek.value = percentage;
      seek.style.setProperty("--progress", `${percentage}%`);
      currentTime.textContent = formatTime(audio.currentTime);
      duration.textContent = formatTime(audio.duration);
    };

    const updatePlayState = () => {
      const isPlaying = !audio.paused;
      toggle.classList.toggle("is-playing", isPlaying);
      toggle.setAttribute("aria-label", `${isPlaying ? "Pause" : "Play"} ${title}`);
    };

    toggle.addEventListener("click", () => {
      if (audio.paused) {
        pauseOtherTracks(audio);
        audio.play().catch(updatePlayState);
      } else {
        audio.pause();
      }
    });

    seek.addEventListener("input", () => {
      if (!audio.duration) {
        return;
      }

      audio.currentTime = (Number(seek.value) / 100) * audio.duration;
      updateProgress();
    });

    audio.addEventListener("play", () => {
      pauseOtherTracks(audio);
      updatePlayState();
    });
    audio.addEventListener("pause", updatePlayState);
    audio.addEventListener("ended", updatePlayState);
    audio.addEventListener("loadedmetadata", updateProgress);
    audio.addEventListener("durationchange", updateProgress);
    audio.addEventListener("timeupdate", updateProgress);

    updateProgress();
    updatePlayState();
  });
})();
