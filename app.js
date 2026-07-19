(() => {
  "use strict";

  const MAX = 260;

  const players = [
    { name: "Alan Shearer", position: "FWD", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", goals: 260 },
    { name: "Steven Gerrard", position: "MID", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", goals: 120 },
    { name: "Riyad Mahrez", position: "MID", flag: "🇩🇿", goals: 82 },
    { name: "Willian", position: "MID", flag: "🇧🇷", goals: 47 },
    { name: "Benjamin Mendy", position: "DEF", flag: "🇫🇷", goals: 2 }
  ];

  const multipliers = [1, 1, 2, 3, 3];

  const startScreen = document.getElementById("startScreen");
  const gameScreen = document.getElementById("gameScreen");
  const resultsScreen = document.getElementById("resultsScreen");
  const startButton = document.getElementById("startButton");
  const playAgainButton = document.getElementById("playAgainButton");
  const shareButton = document.getElementById("shareButton");
  const guessButton = document.getElementById("guessButton");
  const nextButton = document.getElementById("nextButton");
  const topStatus = document.getElementById("topStatus");
  const playerName = document.getElementById("playerName");
  const playerFlag = document.getElementById("playerFlag");
  const playerPosition = document.getElementById("playerPosition");
  const valueElement = document.getElementById("value");
  const sliderZone = document.getElementById("sliderZone");
  const track = document.getElementById("track");
  const fill = document.getElementById("fill");
  const thumb = document.getElementById("thumb");
  const guessLine = document.getElementById("guessLine");
  const answerLine = document.getElementById("answerLine");
  const precisionCopy = document.getElementById("precisionCopy");
  const feedback = document.getElementById("feedback");
  const finalScore = document.getElementById("finalScore");
  const roundBreakdown = document.getElementById("roundBreakdown");

  let roundIndex = 0;
  let value = 0;
  let dragging = false;
  let locked = false;
  let lastX = 0;
  let trackY = 0;
  let animationFrame = null;
  let totalScore = 0;
  let results = [];

  function setScreen(screen) {
    [startScreen, gameScreen, resultsScreen].forEach((item) => {
      item.classList.remove("active");
    });
    screen.classList.add("active");
  }

  // Keeps full-speed movement near the slider, then gradually slows the
  // horizontal movement as the user's finger moves farther down the screen.
  function speedForDown(distance) {
    if (distance <= 160) return 1;
    if (distance >= 380) return 0.1;

    const points = [
      [160, 1],
      [220, 0.5],
      [280, 0.25],
      [380, 0.1]
    ];

    for (let index = 0; index < points.length - 1; index += 1) {
      const [distanceStart, speedStart] = points[index];
      const [distanceEnd, speedEnd] = points[index + 1];

      if (distance <= distanceEnd) {
        const progress = (distance - distanceStart) / (distanceEnd - distanceStart);
        return speedStart + (speedEnd - speedStart) * progress;
      }
    }

    return 0.1;
  }

  function draw(displayValue = value) {
    const width = track.clientWidth;
    const position = (displayValue / MAX) * width;

    thumb.style.left = `${position}px`;
    fill.style.width = `${position}px`;
    valueElement.textContent = String(Math.round(displayValue));
    track.setAttribute("aria-valuenow", String(Math.round(displayValue)));
  }

  function positionMarker(element, markerValue) {
    element.style.left = `${(markerValue / MAX) * track.clientWidth}px`;
  }

  function feedbackFor(score) {
    if (score === 100) return "Couldn't have placed it any better!";
    if (score >= 95) return "Hit the post!";
    if (score >= 90) return "Inches wide!";
    if (score >= 80) return "Great strike!";
    if (score >= 70) return "On target!";
    if (score >= 60) return "Forced a good save.";
    if (score >= 50) return "Over the bar.";
    if (score >= 40) return "Flag stayed down.";
    if (score >= 30) return "A lapse of concentration.";
    if (score >= 20) return "Caught offside.";
    if (score >= 10) return "Lost possession.";
    if (score >= 1) return "Straight into Row Z!";
    return "Lost the match ball!";
  }

  function loadRound() {
    cancelAnimationFrame(animationFrame);

    const player = players[roundIndex];
    value = 0;
    locked = false;
    dragging = false;

    playerName.textContent = player.name;
    playerFlag.textContent = player.flag;
    playerPosition.textContent = player.position;
    topStatus.textContent = `${roundIndex + 1} / ${players.length}`;

    feedback.innerHTML = "";
    precisionCopy.classList.remove("hidden");
    guessLine.style.display = "none";
    answerLine.style.display = "none";
    guessButton.disabled = false;
    guessButton.classList.remove("hidden");
    nextButton.classList.add("hidden");
    nextButton.textContent = roundIndex === players.length - 1 ? "See Final Score" : "Next Player";

    draw();
  }

  function beginGame() {
    roundIndex = 0;
    totalScore = 0;
    results = [];
    setScreen(gameScreen);
    loadRound();
  }

  function updateValueByPointer(event) {
    const horizontalMovement = event.clientX - lastX;
    lastX = event.clientX;

    const distanceBelowTrack = Math.max(0, event.clientY - trackY);
    const speed = speedForDown(distanceBelowTrack);

    value += horizontalMovement * (MAX / track.clientWidth) * speed;
    value = Math.max(0, Math.min(MAX, value));
    draw();
  }

  function startDrag(event) {
    if (locked) return;

    dragging = true;
    lastX = event.clientX;
    trackY = track.getBoundingClientRect().top + track.clientHeight / 2;
    sliderZone.setPointerCapture(event.pointerId);
  }

  function stopDrag(event) {
    if (!dragging) return;

    dragging = false;
    if (sliderZone.hasPointerCapture(event.pointerId)) {
      sliderZone.releasePointerCapture(event.pointerId);
    }
  }

  function animateNumber(from, to, duration, update, onComplete) {
    const startedAt = performance.now();
    const difference = to - from;

    function step(now) {
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      update(from + difference * eased);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else if (onComplete) {
        onComplete();
      }
    }

    animationFrame = requestAnimationFrame(step);
  }

  function lockGuess() {
    if (locked) return;

    locked = true;
    dragging = false;
    guessButton.disabled = true;
    precisionCopy.classList.add("hidden");

    const player = players[roundIndex];
    const guess = Math.round(value);
    const baseScore = Math.max(0, 100 - Math.abs(guess - player.goals));
    const multiplier = multipliers[roundIndex];
    const awarded = baseScore * multiplier;

    positionMarker(guessLine, guess);
    positionMarker(answerLine, player.goals);
    guessLine.style.display = "block";

    feedback.innerHTML = `
      <div class="feedback-title">${feedbackFor(baseScore)}</div>
      <div class="feedback-detail">You guessed ${guess} · Answer ${player.goals}</div>
      <div id="feedbackScore" class="feedback-score">100</div>
    `;

    animateNumber(value, player.goals, 800, (currentValue) => {
      draw(currentValue);
    }, () => {
      value = player.goals;
      draw();
      answerLine.style.display = "block";

      const scoreElement = document.getElementById("feedbackScore");
      animateNumber(100, baseScore, 650, (currentScore) => {
        scoreElement.textContent = String(Math.round(currentScore));
      }, () => {
        scoreElement.textContent = multiplier === 1
          ? `+${awarded}`
          : `${baseScore} × ${multiplier} = +${awarded}`;

        totalScore += awarded;
        results.push({ player, guess, baseScore, multiplier, awarded });
        guessButton.classList.add("hidden");
        nextButton.classList.remove("hidden");
      });
    });
  }

  function nextRound() {
    if (roundIndex < players.length - 1) {
      roundIndex += 1;
      loadRound();
      return;
    }

    showResults();
  }

  function showResults() {
    setScreen(resultsScreen);
    topStatus.textContent = "FULL TIME";
    finalScore.innerHTML = `${totalScore}<span>out of 1000</span>`;

    roundBreakdown.innerHTML = results.map((result, index) => `
      <div class="round-row">
        <div class="round-number">R${index + 1}</div>
        <div class="round-player">${result.player.name} · ${result.guess}/${result.player.goals}</div>
        <div class="round-score">${result.awarded}</div>
      </div>
    `).join("");
  }

  function buildShareText() {
    const roundScores = results.map((result) => result.awarded).join(" · ");
    return `GOAL GUESS ⚽\n${totalScore}/1000\n${roundScores}`;
  }

  async function shareScore() {
    const text = buildShareText();

    if (navigator.share) {
      try {
        await navigator.share({ title: "Goal Guess", text });
        return;
      } catch (error) {
        if (error && error.name === "AbortError") return;
      }
    }

    shareButton.textContent = text.replaceAll("\n", "  ");
    window.setTimeout(() => {
      shareButton.textContent = "Share Score";
    }, 2500);
  }

  sliderZone.addEventListener("pointerdown", startDrag);
  sliderZone.addEventListener("pointermove", (event) => {
    if (!dragging || locked) return;
    updateValueByPointer(event);
  });
  sliderZone.addEventListener("pointerup", stopDrag);
  sliderZone.addEventListener("pointercancel", stopDrag);

  track.addEventListener("keydown", (event) => {
    if (locked) return;

    const amount = event.shiftKey ? 10 : 1;

    if (event.key === "ArrowRight" || event.key === "ArrowUp") {
      event.preventDefault();
      value = Math.min(MAX, value + amount);
    } else if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
      event.preventDefault();
      value = Math.max(0, value - amount);
    } else if (event.key === "Home") {
      event.preventDefault();
      value = 0;
    } else if (event.key === "End") {
      event.preventDefault();
      value = MAX;
    } else {
      return;
    }

    draw();
  });

  window.addEventListener("resize", () => {
    draw();

    if (guessLine.style.display === "block") {
      const currentResult = results[roundIndex];
      if (currentResult) positionMarker(guessLine, currentResult.guess);
    }

    if (answerLine.style.display === "block") {
      positionMarker(answerLine, players[roundIndex].goals);
    }
  });

  startButton.addEventListener("click", beginGame);
  playAgainButton.addEventListener("click", beginGame);
  shareButton.addEventListener("click", shareScore);
  guessButton.addEventListener("click", lockGuess);
  nextButton.addEventListener("click", nextRound);

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {
        // The game still works online if service-worker registration fails.
      });
    });
  }

  draw();
})();
