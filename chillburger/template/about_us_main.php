<!-- template/about_us_main.php -->

<section class="container py-5">

    <!-- Titolo principale  -->
    <h2 class="display-4 custom-title text-center mb-3">
        <span class="txt">Chi siamo</span>
        <span class="emoji">🍔</span>
    </h2>

    <!-- Sottotitolo -->
    <p class="lead text-center mb-5">
        Dal <strong>2024</strong> trasformiamo ingredienti locali di primissima qualità in burger dal gusto
        indimenticabile. Siamo <em>Chill Burger</em>: passione per la cucina, attenzione all’ambiente
        e un sorriso per ogni cliente. 😊
    </p>

    <!-- Mission & Vision -->
    <div class="row mb-5">
        <div class="col-md-6">
            <div class="p-4 rounded-3 h-100 bg-dark">
                <h3 class="h5 light-brown-text animate-underline light-brown fw-semibold mb-3">La nostra missione 🚀</h3>
                <p class="mb-0">
                    Creare esperienze culinarie memorabili, servendo burger artigianali preparati al momento,
                    in un ambiente accogliente dove ogni cliente si senta a casa.
                </p>
            </div>
        </div>
        <div class="col-md-6">
            <div class="p-4 rounded-3 h-100 bg-dark">
                <h3 class="h5 light-brown-text animate-underline light-brown fw-semibold mb-3 ">La nostra visione 🌟</h3>
                <p class="mb-0">
                    Diffondere la cultura del “good fast‑food”: rapidità di servizio,
                    qualità da ristorante e sostenibilità in ogni fase del processo produttivo.
                </p>
            </div>
        </div>
    </div>

    <!-- Valori aziendali -->
    <h3 class="h4 dark-brown-text animate-underline fw-bold text-center mb-4">I nostri valori fondamentali 🤝</h3>
    <div class="row text-center gy-4 mb-5">
        <div class="col-6 col-md-3">
            <span class="display-5">🌱</span>
            <p class="fw-semibold mb-1">Sostenibilità</p>
            <p class="small text-muted mb-0">
                Packaging compostabile e fornitori a km 0.
            </p>
        </div>
        <div class="col-6 col-md-3">
            <span class="display-5">🧑‍🍳</span>
            <p class="fw-semibold mb-1">Artigianalità</p>
            <p class="small text-muted mb-0">
                Burger preparati al momento, pane sfornato ogni giorno.
            </p>
        </div>
        <div class="col-6 col-md-3">
            <span class="display-5">🔍</span>
            <p class="fw-semibold mb-1">Trasparenza</p>
            <p class="small text-muted mb-0">
                Ingredienti selezionati e filiera tracciabile.
            </p>
        </div>
        <div class="col-6 col-md-3">
            <span class="display-5">🎉</span>
            <p class="fw-semibold mb-1">Esperienza</p>
            <p class="small text-muted mb-0">
                Atmosfera rilassata, personale sorridente, musica selezionata.
            </p>
        </div>
    </div>

    <!-- Carosello immagini -->
    <div id="aboutCarousel" class="carousel slide mb-5" data-bs-ride="carousel">

        <!-- indicatori -->
        <div class="carousel-indicators">
            <button type="button" data-bs-target="#aboutCarousel" data-bs-slide-to="0"
                    class="active" aria-current="true" aria-label="Slide 1"></button>
            <button type="button" data-bs-target="#aboutCarousel" data-bs-slide-to="1"
                    aria-label="Slide 2"></button>
            <button type="button" data-bs-target="#aboutCarousel" data-bs-slide-to="2"
                    aria-label="Slide 3"></button>
            <button type="button" data-bs-target="#aboutCarousel" data-bs-slide-to="3"
                    aria-label="Slide 4"></button>
            <button type="button" data-bs-target="#aboutCarousel" data-bs-slide-to="4"
                    aria-label="Slide 5"></button>
        </div>

        <!-- slide -->
        <div class="carousel-inner rounded-4 shadow">
            <div class="carousel-item active">
                <img src="./resources/carousel/rest_2.jpg" class="d-block w-100"
                    alt="La nostra gioia">
            </div>

            <div class="carousel-item">
                <img src="./resources/carousel/smash_1.jpg" class="d-block w-100"
                    alt="La griglia in azione">
            </div>

            <div class="carousel-item">
                <img src="./resources/carousel/ham_1.jpg" class="d-block w-100"
                    alt="Il nostro prodotto">
            </div>

            <div class="carousel-item">
                <img src="./resources/carousel/fries_1.jpg" class="d-block w-100"
                    alt="Le nostre fries">
            </div>

            <div class="carousel-item">
                <img src="./resources/carousel/rest_1.jpg" class="d-block w-100"
                    alt="Il nostro ristorante">
            </div>
        </div>

        <!-- frecce -->
        <button class="carousel-control-prev" type="button"
                data-bs-target="#aboutCarousel" data-bs-slide="prev">
            <span class="carousel-control-prev-icon"></span>
            <span class="visually-hidden">Precedente</span>
        </button>
        <button class="carousel-control-next" type="button"
                data-bs-target="#aboutCarousel" data-bs-slide="next">
            <span class="carousel-control-next-icon"></span>
            <span class="visually-hidden">Successiva</span>
        </button>
    </div>


    <!-- Timeline aziendale -->
    <h3 class="h4 animate-underline dark-brown-text fw-bold text-center mb-4">Il nostro percorso 🗺️</h3>
    <ul class="timeline list-unstyled px-md-5">
        <li class="mb-4">
            <h4 class="h6 fw-semibold mb-1">2023 — L’inizio</h4>
            <p class="text-muted small mb-0">
                Apertura del primo punto vendita a Cesena: un piccolo locale con grande entusiasmo.
            </p>
        </li>
        <li class="mb-4">
            <h4 class="h6 fw-semibold mb-1">2024 — Crescita</h4>
            <p class="text-muted small mb-0">
                Lancio del servizio di consegna eco‑friendly con e‑bike e veicoli elettrici.
            </p>
        </li>
        <li>
            <h4 class="h6 fw-semibold mb-1">2025 — Oggi</h4>
            <p class="text-muted small mb-0">
                Community fidelizzata, menù stagionali e costante ricerca di partner sostenibili.
            </p>
        </li>
    </ul>

    <!-- Call to Action -->
    <div class="text-center mt-5">
        <a href="menu.php" class="h6 a-underline">
            Scopri il nostro menù 📝
        </a>
    </div>
</section>
