<section class="container py-5">

    <h2 class="display-4 custom-title text-center mb-3">
        <span class="txt">Ordina Ora</span>
        <span class="emoji">🤩</span>
    </h2>

    <div class="d-flex flex-wrap justify-content-center gap-2 mb-4">
        <button class="btn btn-filter active" data-category="all">Tutto</button>
        <button class="btn btn-filter" data-category="burger">Burger</button>
        <button class="btn btn-filter" data-category="fries">Patatine</button>
        <button class="btn btn-filter" data-category="drink">Bevande</button>
    </div>

    <div class="row g-4" id="menuGrid">
        <!-- Qui il JS inserirà le card dei prodotti -->
    </div>
</section>

<script src="js/order_now.js"></script>
