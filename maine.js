const container = document.getElementById("cardCont");

if (container) {
    let isDragging = false;
    let startX = 0;
    let currentCard = null;

    const cardColors=[
        "#b2df8a",
        "#a6cee1",
        "#1f78b4",
        "#33a02b",
        "#fc9a99",
        "#e21a1c",
        "#fdbe70",
        "#ff7f00",
        "#cab2d6",
        "#6a3d9a",
    ]

    for (let i=10; i>=1; i--) {
        const card = document.createElement("div");
        card.className="card";
        card.style.backgroundColor = cardColors[i-1];
        const cardContent = document.createElement("div");
        cardContent.className="card-content";
        cardContent.textContent = "fuck meee";
        card.appendChild(cardContent);
        container.appendChild(card);
    }

    function getTopCard(){
        return container.querySelector(".card:last-child");
    }

    container.addEventListener("mousedown", (e)=> {
        currentCard = getTopCard();
        if (!currentCard) return;
        isDragging = true;
        startX = e.clientX;
        currentCard.style.transition = "none";

    });
    container.addEventListener("mousemove", (e)=> {
        if(!isDragging || !currentCard)return;
        const deltaX = e.clientX - startX;
        currentCard.style.transform = `translateX(${deltaX}px) rotate(${deltaX/10}deg)`;
    });

    container.addEventListener("mouseup", (e)=>{
        if(!isDragging || !currentCard) return;
        const deltaX = e.clientX - startX;
        handleSwipe(deltaX);
    });

    container.addEventListener("touchstart", (e)=> {
        currentCard = getTopCard();
        if(!currentCard) return;
        isDragging = true;
        startX = e.touches[0].clientX;
        currentCard.style.transition="none";
    });

    container.addEventListener("touchmove", (e)=> {
        if(!isDragging || !currentCard) return;
        const deltaX = e.touches[0].clientX - startX;
        currentCard.style.transform = `translateX(${deltaX}px) rotate(${deltaX/10}deg)`
    });
    container.addEventListener("touchend", (e)=> {
        if(!isDragging || !currentCard) return;
        const deltaX= e.changedTouches[0].clientX - startX;
        handleSwipe(deltaX);
    });

    function handleSwipe(deltaX) {
        const sensitivity = 50;
        if(Math.abs(deltaX)> sensitivity) {
            currentCard.style.transition = "transform 0.4s ease, opacity 0.4s ease";
            currentCard.style.transform = `translateX(${deltaX > 0 ? 1000: -1000}px) rotate(${deltaX>0 ? 45:-45}deg)`;
            currentCard.style.opacity = 0;
            setTimeout(()=>{
                currentCard.remove();
                currentCard=null;
            }, 400);
        } else{
            currentCard.style.transition = "transform 0.3s ease";
            currentCard.style.transform = "translateX(0) rotate(0)";
        }
        isDragging =  false;
    }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('.icons a').forEach(link => {
    const dot = link.querySelector('.iconText');
    if (!dot) return;

    link.addEventListener('click', () => {
      dot.classList.add('visited'); // hide dot temporarily
    });
  });

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
});

//where the mic button starts ver4
const URL = "https://teachablemachine.withgoogle.com/models/mTwRa3OaY/";
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
    isPressed = true; // Lock the gate OPEN
    micButton.classList.add('is-recording');

    await initModel();
    
    // Check if user already let go before model finished loading
    if (!isPressed) return; 

    recognizer.listen(result => {
        // THE CRITICAL CHECK: If button isn't held, do absolutely nothing
        if (!isPressed) return; 

        if (!result || !result.scores) return;
        
        const scores = result.scores;
        const maxScore = Math.max(...scores);
        const index = scores.indexOf(maxScore);
        const detectedLabel = classLabels[index];
        const now = Date.now();
        const cooldown = 500;

        if (maxScore > 0.85 && detectedLabel === "blow" && (now - lastDetectionTime > cooldown)) {
            lastDetectionTime = now;
            console.log("BLOW SOUND DETECTED");
            const flames = document.querySelectorAll('.flame');
            // 2. Add the 'flame-out' class to each one
            flames.forEach(flame => {
                flame.classList.add('flame-out');
            });

            const nextBtn = document.querySelector('.button');
            if (nextBtn) {
                nextBtn.classList.add('show-btn');
            }
            // 3. Optional: Stop the mic automatically once they are blown out
            stopMic();
        }
    }, {
        probabilityThreshold: 0.85,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.4
    });
    console.log("Started listening");
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
