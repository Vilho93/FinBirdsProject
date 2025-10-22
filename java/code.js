// Konfiguraatio 
const BIRDS = [
  { name: "valkoposkihanhi", img: "../kuvat/barnacle-goose.jpg" },
  { name: "maakotka",        img: "../kuvat/eagle.jpg" },
  { name: "metso",           img: "../kuvat/gallo.jpg" },
  { name: "varpunen",        img: "../kuvat/home-sparrow.jpg" },
  { name: "naakka",          img: "../kuvat/jackdaw.jpg" },
  { name: "närhi",           img: "../kuvat/jay.jpg" },
  { name: "sinisorsa",       img: "../kuvat/mallard.jpg" },
  { name: "huuhkaja",        img: "../kuvat/owl.jpg" },
  { name: "tunturipöllö",    img: "../kuvat/snowy-owl-.jpg" }, 
  { name: "kottarainen",     img: "../kuvat/starling-in-a-tree.jpg" },
  { name: "isokuovi",        img: "../kuvat/whimbrel.jpg" },
  { name: "västäräkki",      img: "../kuvat/white-wagtail.jpg" },
];

const TOTAL_QUESTIONS = Math.min(10, BIRDS.length); // Max 10 kysymystä
const CHOICES_COUNT   = 4; // 4 vastausvaihtoehtoa


const $ = (sel) => document.querySelector(sel); // Pikakutsu elementin hakuun

// Fisher-Yates sekoitusalgoritmi arpoo vaihtoehdot ja kysymykset
function shuffle(arr) { 
  const a = arr.slice();                             // Kopioi alkuperäisen taulukon, jotta sitä ei muuteta
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));  // satunnainen indeksi 0..i
    [a[i], a[j]] = [a[j], a[i]];                    // vaihdetaan paikkoja
  }
  return a;                                             // Palauttaa uuden satunnaisen taulukon
}

// Poimii n satunnaisia alkioita taulukosta, mutta jättää oikean vastauksen
function sample(arr, n, excludeIndex = -1) {                                    // Luo uuden taulukon, jossa jokainen alkio on objekti
  const pool = arr.map((v, i) => ({ v, i })).filter(o => o.i !== excludeIndex); // Poistaa halutun indeksin
  const mixed = shuffle(pool);                                                  // Sekoittaa jäljelle jääneet alkiot 
  return mixed.slice(0, n).map(o => o.v);                                       // Ottaa n ensimmäistä ja palauttaa vain niiden arvot
}

// Lataa kuvat selaimen välimuistiin jo etukäteen
function preloadImages(items) { 
  items.forEach(item => {
    const im = new Image();                                   // Luo uuden kuva olion muistissa (ei lisätä DOM:iin)
    im.src = item.img;                                        // käynnistää kuvan latauksen
  });
}

// Pelin tilamuuttujat 
let questions = [];         // kysymyslista
let current   = 0;          // monesko kysymys
let score     = 0;          // pisteet
let locked    = false;      // estää käyttäjää klikkaamasta monesti


//  DOM-elementit 
let startBtn, restartBtn, game, imgEl, choicesEl, feedbackEl, scoreEl;

document.addEventListener("DOMContentLoaded", () => {
  startBtn    = $("#startBtn");
  restartBtn  = $("#restartBtn");
  game        = $("#game");
  imgEl       = $("#bird-img");
  choicesEl   = $("#choices");
  feedbackEl  = $("#feedback");
  scoreEl     = $("#score");

  startBtn?.addEventListener("click", startGame);
  restartBtn?.addEventListener("click", startGame);

  preloadImages(BIRDS);
});

//  Pelin käynnistys
function startGame(){
  score = 0;
  current = 0;
  locked = false;

  feedbackEl.textContent = "";          // Poistaa aiemmat palautteet
  scoreEl.textContent = "Pisteet: 0";   // Päivittää pistelaskurin
  restartBtn?.classList.add("hidden");  // piilottaa pelaa uudelleen- napin

  const shuffled = shuffle(BIRDS);                // sekoittaa lintu datan
  questions = shuffled.slice(0, TOTAL_QUESTIONS); // Ottaa vain sen 10 kysymystä peliin

  game.classList.remove("hidden");          // peli tulee näkyviin
  $("#startBtn")?.classList.add("hidden");  // piilottaa aloita peli- napin

  renderQuestion();  // Käynnistää ekan kysymyksen
}


// Kysymyksen luonti 
function renderQuestion() {
  locked = false;               // Vapauttaa valinnan vastaukseen
  feedbackEl.textContent = "";  // Tyhjentää edellisen palautteen

  const q = questions[current];                                               // Hakee nykyisen kysymyksen olion listasta.
  imgEl.src = q.img;                                                          // Näyttää kysymys kuvan.

  const distractors = sample(BIRDS, CHOICES_COUNT - 1, BIRDS.indexOf(q));     // Poimii satunnaiset väärät vastaukset.
  const options = shuffle([q, ...distractors]).map(o => o.name);              // Luo taulukon oikeasta ja vääristä vastauksista satunnaiseen järjestykseen 
                                                                              // ja muuntaa olion name kentäksi.
 
  choicesEl.innerHTML = "";                       // tyhjentää vastausvaihtoehdon                                       
  options.forEach((name, idx) => {                  // Käy läpi kaikki vastausvaihtoehdot
    const btn = document.createElement("button");   // tekee napin
    btn.className = "choice";                       // Antaa CSS-luokan
    btn.type = "button";                            
    btn.textContent = name;
    btn.setAttribute("data-correct", String(name === q.name));  // Tallentaa onko vaihtoehto true / false
    btn.addEventListener("click", onChoice);    // Nappia klikatessa, OnChoice- käsittelijä hoitaa vastauksen käsittelyn ja seuraava napin aktivoinnin
    choicesEl.appendChild(btn);
  });
}

// Vastauksen käsittely + automaattinen siirtyminen 
  
// Estää tuplaklikkauksen
function onChoice(e) {       
  if (locked) return;
  locked = true;

  const btn = e.currentTarget;
  const correct = btn.getAttribute("data-correct") === "true";  //Tarkistaa oliko painettu vaihtoehto oikea

  
  
  [...choicesEl.children].forEach(el => {
    const isCorrect = el.getAttribute("data-correct") === "true";
    el.classList.add(isCorrect ? "correct" : "disabled");
    el.disabled = true;
  });

  // Lisää CSS-luokan sen mukaan, vastaako oikein vai väärin
  if (correct) {
    btn.classList.add("picked");                  // lisää napille luokan "picked", jolla voi korostaa oikeaa valintaa.
    score++;                                      // kasvattaa pistemäärää yhdellä.
    scoreEl.textContent = `Pisteet: ${score}`;    // päivittää käyttöliittymässä näkyvän pistelaskurin uuteen arvoon.
    feedbackEl.textContent = "Oikein!";           // näyttää palautteen käyttäjälle.
  } else {                         // jos vastaus väärin
    btn.classList.add("wrong");               
    const correctBtn = [...choicesEl.children].find(el => el.getAttribute("data-correct") === "true"); // etsii listasta sen napin joka olisi ollut oikein.
    correctBtn?.classList.add("highlight");               // lisää napille oikean luokan, jotta käyttäjä näkee, mikä olisi ollut oikein.
    feedbackEl.textContent = "Nyt meni väärin!";
  }

  // Automaattinen siirtyminen 1,5 sekunnin päästä
  setTimeout(() => {
    current++;
    if (current >= TOTAL_QUESTIONS) {
      endGame();
    } else {
      renderQuestion();
    }
  }, 1500);
}

//  Paras tulos (localStorage) 
// Lataa aiemmin tallennetun parhaan tuloksen.
function getBestScore() {
  const stored = localStorage.getItem("bestScore");
  return stored ? parseInt(stored, 10) : 0;
}

// Tallentaa uuden parhaan tuloksen, jos se on parempi kuin aiempi.
function saveBestScore(score) {
  const best = getBestScore();
  if (score > best) {
    localStorage.setItem("bestScore", score);
    return true; // kertoo että uusi ennätys tehtiin
  }
  return false;
}


// Pelin lopetus
function endGame() {
  const percent = (score / TOTAL_QUESTIONS) *100;
  let message = "";

  if (percent === 100) {
    message = "Mahtavaa! Taidat olla ornitologi!";
  } else if (percent >= 80) {
    message = "Hyvä! Tunnistat hienosti eri lajit.";
  } else if (percent >= 50) {
    message = "Ihan OK. Kertaa vielä lajit ja kokeile uudelleen."; 
  } else if (percent < 50) {
    message = "Ei mennyt kovin vahvasti. Kokeilehhan uudelleen";
  }
  
  // Tallennetaan paras tulos ja tarkistetaan, syntyikö ennätys
  const isNewBest = saveBestScore(score);
  const best = getBestScore();  
  scoreEl.textContent = `Pisteet: 0  |  Paras: ${best}`;

  feedbackEl.textContent = `${message} (Sait ${score}/${TOTAL_QUESTIONS} oikein.)`;
  if (isNewBest) {
    feedbackEl.textContent += "Uusi ennätys!";
  } else {
    feedbackEl.textContent += ` Paras tuloksesi on ${best}/${TOTAL_QUESTIONS}.`;
  }
  
  choicesEl.innerHTML = "";
  imgEl.alt = "Peli päättyi";

  restartBtn?.classList.remove("hidden");
}
