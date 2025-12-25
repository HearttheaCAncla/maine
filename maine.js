const container = document.getElementById("cardCont");
let startY = 0;
let isHorizontal = null;

if (container) {
    let isDragging = false;
    let startX = 0;
    let currentCard = null;

    function getTopCard() {
        // This now matches the class created in the loop
        return container.querySelector(".ctextCont:last-child");
    }

    // --- Swipe Logic (Stays the same, but now it finds the cards!) ---
    container.addEventListener("mousedown", (e) => {
        currentCard = getTopCard();
        if (!currentCard) return;
        isDragging = true;
        startX = e.clientX;
        currentCard.style.transition = "none";
    });

    // Use window for mousemove/up so it doesn't "glitch" if you move too fast
    window.addEventListener("mousemove", (e) => {
        if (!isDragging || !currentCard) return;
        const deltaX = e.clientX - startX;
        currentCard.style.transform = `translateX(${deltaX}px) rotate(${deltaX / 15}deg)`;
    });

    window.addEventListener("mouseup", (e) => {
        if (!isDragging || !currentCard) return;
        const deltaX = e.clientX - startX;
        handleSwipe(deltaX);
    });

    // Touch Events
    container.addEventListener("touchstart", (e) => {
        currentCard = getTopCard();
        if (!currentCard) return;

        isDragging = true;
        isHorizontal = null;

        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;

        currentCard.style.transition = "none";
    });

    container.addEventListener("touchmove", (e) => {
        if (!isDragging || !currentCard) return;

        const deltaX = e.touches[0].clientX - startX;
        const deltaY = e.touches[0].clientY - startY;

        // Decide direction only once
        if (isHorizontal === null) {
            isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        }

        // If vertical scroll → do NOTHING (let browser scroll)
        if (!isHorizontal) return;

        // Horizontal swipe only
        e.preventDefault();
        currentCard.style.transform =
            `translateX(${deltaX}px) rotate(${deltaX / 15}deg)`;
    });

    container.addEventListener("touchend", (e) => {
        if (!isDragging || !currentCard) return;
        const deltaX = e.changedTouches[0].clientX - startX;
        handleSwipe(deltaX);
    });

    function handleSwipe(deltaX) {
        const sensitivity = 80;
        if (Math.abs(deltaX) > sensitivity) {
            currentCard.style.transition = "transform 0.4s ease, opacity 0.4s ease";
            currentCard.style.transform = `translateX(${deltaX > 0 ? 1000 : -1000}px) rotate(${deltaX > 0 ? 45 : -45}deg)`;
            currentCard.style.opacity = 0;
            const cardToRemove = currentCard;
            setTimeout(() => {
                cardToRemove.remove();
            }, 400);
        } else {
            currentCard.style.transition = "transform 0.3s ease";
            currentCard.style.transform = "translateX(0) rotate(0)";
        }
        isDragging = false;
        currentCard = null;
    }

    function fitText(card) {
        const p = card.querySelector('p');
        if (!p) return;
        let fontSize = 48; 
        p.style.fontSize = fontSize + "px";
        p.style.height = "auto";
        const maxHeight = card.clientHeight - 40;
        while (p.scrollHeight > maxHeight && fontSize > 14) {
            fontSize--;
            p.style.fontSize = fontSize + "px";
        }

        if(p.scrollHieght > maxHeight) {
            p.style.height = maxHeight + "px";
            p.style.overflowY = "auto";
        }
    }

    // Run fitText on all cards
    document.querySelectorAll('.ctextCont').forEach(card => {
        fitText(card);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.icons a').forEach(link => {
    const dot = link.querySelector('.iconText');
    if (!dot) return;

    link.addEventListener('click', () => {
      dot.classList.add('visited'); // hide dot temporarily
    });
  });

  if (document.querySelector('.card-wrapper')) {
    new Swiper('.card-wrapper', {
        spaceBetween: 25,
        loop: true,
        
        // If we need pagination
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
            dynamicBullets: true
        },

        // Navigation arrows
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },

        breakpoints: {
            0: {
                slidesPerView: 1
            },
            768: {
                slidesPerView: 2
            },
            1024: {
                slidesPerView: 3,
            }
        }
    });
  }
    const dvdCont = document.querySelector('.dvdCont');
    const logoEls = dvdCont ? dvdCont.querySelectorAll('div') : [];

    if (dvdCont && logoEls.length > 0) {
        let logoStates = Array.from(logoEls).map((el, i) => ({
            el: el,
            toRight: i % 2 === 0,
            toBottom: i % 3 === 0,
            speed: 2
        }));

        setInterval(() => {
            logoStates.forEach((logo, i) => {
                const rect = logo.el.getBoundingClientRect();
                let top = logo.el.offsetTop;
                let left = logo.el.offsetLeft;

                // --- A. Screen Edge Collision (STRICT) ---
                // We use 0 and window height/width to ensure they use the WHOLE screen
                if (top <= 0) {
                    logo.toBottom = true;
                    top = 1; 
                }
                if (top + rect.height >= window.innerHeight) {
                    logo.toBottom = false;
                    top = window.innerHeight - rect.height - 1; 
                }
                if (left <= 0) {
                    logo.toRight = true;
                    left = 1; 
                }
                if (left + rect.width >= window.innerWidth) {
                    logo.toRight = false;
                    left = window.innerWidth - rect.width - 1; 
                }

                // --- C. Logo vs Logo Collision (With Anti-Stuck Shove) ---
                logoStates.forEach((otherLogo, j) => {
                    if (i === j) return;
                    const otherRect = otherLogo.el.getBoundingClientRect();

                    if (rect.right >= otherRect.left && rect.left <= otherRect.right &&
                        rect.bottom >= otherRect.top && rect.top <= otherRect.bottom) {
                        
                        // Bounce them away from each other
                        logo.toRight = !logo.toRight;
                        logo.toBottom = !logo.toBottom;
                        
                        // Instant shove to prevent the "vibration" glitch
                        top += logo.toBottom ? 2 : -2;
                        left += logo.toRight ? 2 : -2;
                    }
                });

                // Update Position
                top = logo.toBottom ? top + logo.speed : top - logo.speed;
                left = logo.toRight ? left + logo.speed : left - logo.speed;

                logo.el.style.top = `${top}px`;
                logo.el.style.left = `${left}px`;
            });
        }, 20);
    }
});

//where the mic button starts ver4
const URL = "https://teachablemachine.withgoogle.com/models/Se6yM_94j/";
let recognizer = null;
let classLabels = [];
let lastDetectionTime = 0;
let isPressed = false; // <--- The Gatekeeper

async function initModel() {
    if (!recognizer) {
        recognizer = speechCommands.create(
            "BROWSER_FFT",
            undefined,
            URL + "model.json",
            URL + "metadata.json"
        );
        await recognizer.ensureModelLoaded();
        classLabels = recognizer.wordLabels();
    }
}

async function startMic() {
    isPressed = true; 
    micButton.classList.add('is-recording');

    await initModel();
    
    // Check if user let go during loading
    if (!isPressed) return; 

    // --- MOVE STARTTIME HERE ---
    // This resets the timer AFTER the model and permissions are ready
    const startTime = Date.now(); 

    recognizer.listen(result => {
        if (!isPressed) return; 

        // Now this 500ms actually protects against the initial 'pop'
        if (Date.now() - startTime < 500) return; 
        
        if (!result || !result.scores) return;
        
        const scores = result.scores;
        const maxScore = Math.max(...scores);
        const index = scores.indexOf(maxScore);
        const detectedLabel = classLabels[index];

        if (maxScore > 0.77 && detectedLabel === "blow") {
            console.log("SUCCESS: Candles Blown!");

            const flames = document.querySelectorAll('.flame');
            flames.forEach(flame => {
                flame.classList.add('flame-out');
            });

            const nextBtn = document.querySelector('.btn');
            if (nextBtn) {
                nextBtn.classList.add('show-btn');
            }

            stopMic();
        }
    }, {
        probabilityThreshold: 0.77,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.4
    });
}

function stopMic() {
    isPressed = false; // Lock the gate SHUT immediately
    micButton.classList.remove('is-recording');
    if (recognizer) {
        recognizer.stopListening();
        console.log("Stopped listening");
    }
}

// Event Listeners (Keep these as they are, they work great!)
const micButton = document.getElementById("mic");
micButton.addEventListener('contextmenu', (e) => {
    e.preventDefault();
});

// PC Support
micButton.addEventListener("mousedown", startMic);
micButton.addEventListener("mouseup", stopMic);
micButton.addEventListener("mouseleave", stopMic);

// Mobile Support
micButton.addEventListener("touchstart", (e) => {
    // preventDefault stops the browser from firing "mousedown" after touch
    if (e.cancelable) e.preventDefault(); 
    startMic();
}, { passive: false });

micButton.addEventListener("touchend", (e) => {
    if (e.cancelable) e.preventDefault();
    stopMic();
});

micButton.addEventListener("touchcancel", stopMic);
