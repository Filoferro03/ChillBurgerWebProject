USE chillburgerdb;

INSERT INTO chillburgerdb.ingredienti (nome, sovrapprezzo, giacenza, image) VALUES
('pane', 0.30, 100, 'pane.webp'),
('hamburger di manzo', 1.20, 50, 'hamburger-di-manzo.webp'),
('insalata', 0.50, 80, 'insalata.webp'),
('ketchup', 0.40, 100, 'ketchup.webp'),
('maionese', 0.50, 100, 'maionese.webp'),
('pomodori', 0.60, 60, 'pomodori.webp'),
('funghi', 0.80, 40, 'funghi.webp'),
('bacon', 1.20, 50, 'bacon.webp'),
('cipolla', 0.40, 70, 'cipolla.webp'),
('squaquerone', 0.90, 30, 'squaquerone.webp'),
('cotoletta', 1.10, 40, 'cotoletta.webp'),
('cheddar', 0.80, 60, 'cheddar.webp'),
('fontina', 0.90, 30, 'fontina.webp'),
('pancetta', 1.00, 40, 'pancetta.webp'),
('salsa barbecue', 0.70, 80, 'salsa-barbecue.webp'),
('peperoni', 0.70, 50, 'peperoni.webp'),
('zucchine', 0.60, 50, 'zucchine.webp'),
('melanzane', 0.60, 50, 'melanzane.webp'),
('petto di pollo', 1.00, 50, 'petto-di-pollo.webp'),
('salsa rosa', 0.60, 50, 'salsa-rosa.webp'),
('cipolla caramellata', 0.90, 30, 'cipolla-caramellata.webp'),
('guanciale croccante', 1.50, 25, 'guanciale.webp'),
('scamorza affumicata', 1.10, 35, 'scamorza.webp'),
('hamburger vegano', 1.40, 40, 'hamburger-vegano.webp');

INSERT INTO chillburgerdb.categorie (descrizione) VALUES
('Panini'),
('Fritti'),
('Bevande'),
('Dolci');

INSERT INTO chillburgerdb.prodotti (nome, prezzo, idcategoria, image) VALUES
('Bacon Cheeseburger', 14.50, 1, 'bacon-cheeseburger.webp'),
('Chicken Deluxe', 13.00, 1, 'chicken-deluxe.webp'),
('Smoky Burger', 15.50, 1, 'smoky-burger.webp'),
('Veggie Burger', 12.00, 1, 'veggie-burger.webp'),
('Double Beef BBQ', 16.00, 1, 'double-beef-bbq.webp'),
('Zucchini Delight', 13.00, 1, 'zucchini-delight.webp'),
('Crispy Cotoletta', 14.00, 1, 'crispy-cotoletta.webp'),
('Hot Pepper Burger', 13.50, 1, 'hot-pepper-burger.webp'),
('Melanzana Veggie', 12.50, 1, 'melanzana-veggie.webp'),
('Truffle Deluxe', 15.00, 1, 'truffle-deluxe.webp'),
('Green Garden', 12.50, 1, 'green-garden.webp'),
('Crispy BBQ Chicken', 13.50, 1, 'crispy-bbq-chicken.webp');

INSERT INTO chillburgerdb.prodotti (nome, prezzo, disponibilita, idcategoria, image) VALUES
('Onion Rings', 4.50, 30, 2, 'onion-rings.webp'),
('Patatine Fritte', 3.50, 50, 2, 'patatine-fritte.webp'),
('Alette di Pollo BBQ', 6.00, 25, 2, 'alette-pollo-bbq.webp'),
('Mozzarella Sticks', 5.00, 20, 2, 'mozzarella-sticks.webp'),
('Crocchette di Patate', 4.00, 40, 2, 'crocchette-patate.webp'),
('Nuggets di Pollo', 5.50, 35, 2, 'nuggets-pollo.webp'),
('Jalapeño Popper', 5.00, 15, 2, 'jalapeno-popper.webp');

INSERT INTO chillburgerdb.prodotti (nome, prezzo, disponibilita, idcategoria, image) VALUES
('Coca Cola', 3.00, 100, 3, 'coca-cola.webp'),
('Fanta', 3.00, 100, 3, 'fanta.webp'),
('Acqua Naturale', 1.50, 150, 3, 'acqua-naturale.webp'),
('Acqua Frizzante', 1.50, 150, 3, 'acqua-frizzante.webp'),
('Birra Artigianale Bionda', 5.00, 50, 3, 'birra-bionda.webp'),
('Tè al Limone', 2.50, 80, 3, 'te-limone.webp'),
('Sprite', 3.00, 90, 3, 'sprite.webp');

INSERT INTO chillburgerdb.prodotti (nome, prezzo, disponibilita, idcategoria, image) VALUES
('Tiramisù', 5.00, 2, 4, 'tiramisu.webp'),
('Cheesecake ai Frutti di Bosco', 5.50, 30, 4, 'cheesecake-frutti-di-bosco.webp'),
('Brownie al Cioccolato', 4.50, 15, 4, 'brownie-cioccolato.webp'),
('Panna Cotta al Caramello', 4.00, 25, 4, 'panna-cotta-caramello.webp'),
('Mousse al Cioccolato', 5.00, 35, 4, 'mousse-cioccolato.webp'),
('Torta della Nonna', 5.50, 45, 4, 'torta-della-nonna.webp'),
('Dolci Misti', 6.00, 30, 4, 'dolci-misti.webp');


INSERT INTO chillburgerdb.composizioni (idprodotto, idingrediente, quantita, essenziale) VALUES
(1, (SELECT idingrediente FROM ingredienti WHERE nome = 'pane'), 1, TRUE),
(1, (SELECT idingrediente FROM ingredienti WHERE nome = 'hamburger di manzo'), 1, TRUE),
(1, (SELECT idingrediente FROM ingredienti WHERE nome = 'bacon'), 2, TRUE),
(1, (SELECT idingrediente FROM ingredienti WHERE nome = 'cheddar'), 1, default),
(1, (SELECT idingrediente FROM ingredienti WHERE nome = 'ketchup'), 1, default),
(1, (SELECT idingrediente FROM ingredienti WHERE nome = 'maionese'), 1, default);

INSERT INTO chillburgerdb.composizioni (idprodotto, idingrediente, quantita, essenziale) VALUES
(2, (SELECT idingrediente FROM ingredienti WHERE nome = 'pane'), 1, TRUE),
(2, (SELECT idingrediente FROM ingredienti WHERE nome = 'petto di pollo'), 1, TRUE),
(2, (SELECT idingrediente FROM ingredienti WHERE nome = 'cheddar'), 1, default),
(2, (SELECT idingrediente FROM ingredienti WHERE nome = 'insalata'), 1, default),
(2, (SELECT idingrediente FROM ingredienti WHERE nome = 'maionese'), 1, default);

INSERT INTO chillburgerdb.composizioni (idprodotto, idingrediente, quantita, essenziale) VALUES
(3, (SELECT idingrediente FROM ingredienti WHERE nome = 'pane'), 1, TRUE),
(3, (SELECT idingrediente FROM ingredienti WHERE nome = 'hamburger di manzo'), 1, TRUE),
(3, (SELECT idingrediente FROM ingredienti WHERE nome = 'salsa barbecue'), 1, default),
(3, (SELECT idingrediente FROM ingredienti WHERE nome = 'cipolla caramellata'), 1, default),
(3, (SELECT idingrediente FROM ingredienti WHERE nome = 'scamorza affumicata'), 1, TRUE),
(3, (SELECT idingrediente FROM ingredienti WHERE nome = 'bacon'), 1, default);

INSERT INTO chillburgerdb.composizioni (idprodotto, idingrediente, quantita, essenziale) VALUES
(4, (SELECT idingrediente FROM ingredienti WHERE nome = 'pane'), 1, TRUE),
(4, (SELECT idingrediente FROM ingredienti WHERE nome = 'hamburger vegano'), 1, TRUE),
(4, (SELECT idingrediente FROM ingredienti WHERE nome = 'funghi'), 1, default),
(4, (SELECT idingrediente FROM ingredienti WHERE nome = 'insalata'), 1, default),
(4, (SELECT idingrediente FROM ingredienti WHERE nome = 'pomodori'), 1, default),
(4, (SELECT idingrediente FROM ingredienti WHERE nome = 'maionese'), 1, default);

INSERT INTO chillburgerdb.composizioni (idprodotto, idingrediente, quantita, essenziale) VALUES
(5, (SELECT idingrediente FROM ingredienti WHERE nome = 'pane'), 1, TRUE),
(5, (SELECT idingrediente FROM ingredienti WHERE nome = 'hamburger di manzo'), 2, TRUE),
(5, (SELECT idingrediente FROM ingredienti WHERE nome = 'salsa barbecue'), 1, TRUE),
(5, (SELECT idingrediente FROM ingredienti WHERE nome = 'cheddar'), 1, default),
(5, (SELECT idingrediente FROM ingredienti WHERE nome = 'cipolla'), 1, default);

INSERT INTO chillburgerdb.composizioni (idprodotto, idingrediente, quantita, essenziale) VALUES
(6, (SELECT idingrediente FROM ingredienti WHERE nome = 'pane'), 1, TRUE),
(6, (SELECT idingrediente FROM ingredienti WHERE nome = 'hamburger vegano'), 1, TRUE),
(6, (SELECT idingrediente FROM ingredienti WHERE nome = 'zucchine'), 2, TRUE),
(6, (SELECT idingrediente FROM ingredienti WHERE nome = 'insalata'), 1, default),
(6, (SELECT idingrediente FROM ingredienti WHERE nome = 'salsa rosa'), 1, default);

INSERT INTO chillburgerdb.composizioni (idprodotto, idingrediente, quantita, essenziale) VALUES
(7, (SELECT idingrediente FROM ingredienti WHERE nome = 'pane'), 1, TRUE),
(7, (SELECT idingrediente FROM ingredienti WHERE nome = 'cotoletta'), 1, TRUE),
(7, (SELECT idingrediente FROM ingredienti WHERE nome = 'pomodori'), 1, TRUE),
(7, (SELECT idingrediente FROM ingredienti WHERE nome = 'maionese'), 1, default),
(7, (SELECT idingrediente FROM ingredienti WHERE nome = 'insalata'), 1, default);

INSERT INTO chillburgerdb.composizioni (idprodotto, idingrediente, quantita, essenziale) VALUES
(8, (SELECT idingrediente FROM ingredienti WHERE nome = 'pane'), 1, TRUE),
(8, (SELECT idingrediente FROM ingredienti WHERE nome = 'hamburger di manzo'), 1, TRUE),
(8, (SELECT idingrediente FROM ingredienti WHERE nome = 'peperoni'), 2, TRUE),
(8, (SELECT idingrediente FROM ingredienti WHERE nome = 'cheddar'), 1, default),
(8, (SELECT idingrediente FROM ingredienti WHERE nome = 'ketchup'), 1, default);

INSERT INTO chillburgerdb.composizioni (idprodotto, idingrediente, quantita, essenziale) VALUES
(9, (SELECT idingrediente FROM ingredienti WHERE nome = 'pane'), 1, TRUE),
(9, (SELECT idingrediente FROM ingredienti WHERE nome = 'hamburger vegano'), 1, TRUE),
(9, (SELECT idingrediente FROM ingredienti WHERE nome = 'melanzane'), 1, TRUE),
(9, (SELECT idingrediente FROM ingredienti WHERE nome = 'fontina'), 1, default),
(9, (SELECT idingrediente FROM ingredienti WHERE nome = 'maionese'), 1, default);

INSERT INTO chillburgerdb.composizioni (idprodotto, idingrediente, quantita, essenziale) VALUES
(10, (SELECT idingrediente FROM ingredienti WHERE nome = 'pane'), 1, TRUE),
(10, (SELECT idingrediente FROM ingredienti WHERE nome = 'hamburger di manzo'), 1, TRUE),
(10, (SELECT idingrediente FROM ingredienti WHERE nome = 'scamorza affumicata'), 1, TRUE),
(10, (SELECT idingrediente FROM ingredienti WHERE nome = 'funghi'), 1, default),
(10, (SELECT idingrediente FROM ingredienti WHERE nome = 'maionese'), 1, default);

INSERT INTO chillburgerdb.composizioni (idprodotto, idingrediente, quantita, essenziale) VALUES
(11, (SELECT idingrediente FROM ingredienti WHERE nome = 'pane'), 1, TRUE),
(11, (SELECT idingrediente FROM ingredienti WHERE nome = 'hamburger vegano'), 1, TRUE),
(11, (SELECT idingrediente FROM ingredienti WHERE nome = 'zucchine'), 1, TRUE),
(11, (SELECT idingrediente FROM ingredienti WHERE nome = 'pomodori'), 1, default),
(11, (SELECT idingrediente FROM ingredienti WHERE nome = 'insalata'), 1, default);

INSERT INTO chillburgerdb.composizioni (idprodotto, idingrediente, quantita, essenziale) VALUES
(12, (SELECT idingrediente FROM ingredienti WHERE nome = 'pane'), 1, TRUE),
(12, (SELECT idingrediente FROM ingredienti WHERE nome = 'cotoletta'), 1, TRUE),
(12, (SELECT idingrediente FROM ingredienti WHERE nome = 'salsa barbecue'), 1, TRUE),
(12, (SELECT idingrediente FROM ingredienti WHERE nome = 'cheddar'), 1, default),
(12, (SELECT idingrediente FROM ingredienti WHERE nome = 'insalata'), 1, default);

INSERT INTO chillburgerdb.stati_ordine (descrizione) VALUES
('In attesa'),
('In preparazione'),
('In consegna'),
('Consegnato'),
('Confermato'), 
('Annullato');

INSERT INTO chillburgerdb.utenti (nome, cognome, username, password, tipo) VALUES
('Mario', 'Rossi', 'mario.rossi', 'hashed_password1', 'cliente'),
('Luigi', 'Bianchi', 'admin', 'password123', 'venditore'),
('Anna', 'Verdi', 'anna.verdi', 'hashed_password3', 'cliente'),
('Giuseppe', 'Gialli', 'giuseppe.gialli', 'hashed_password4', 'cliente'),
('Francesca', 'Neri', 'francesca.neri', 'hashed_password5', 'cliente'),
('Laura', 'Bruni', 'laura.bruni', 'hashed_password6', 'cliente'),
('Marco', 'Gallo', 'marco.gallo', 'hashed_password7', 'cliente');

INSERT INTO chillburgerdb.fasce_orari (orario) VALUES
('11:30:00'),('11:45:00'),
('12:00:00'),('12:15:00'),('12:30:00'), ('12:45:00'),
('13:00:00'), ('13:15:00'), ('13:30:00'), ('13:45:00'),
('14:00:00'), ('14:15:00'), ('14:30:00'),
('18:30:00'),('18:45:00'),
('19:00:00'),('19:15:00'),('19:30:00'), ('19:45:00'), 
('20:00:00'),('20:15:00'),('20:30:00'), ('20:45:00'), 
('21:00:00'),('21:15:00'),('21:30:00'), ('21:45:00'),
('22:00:00'),('22:15:00'),('22:30:00'); 
 

INSERT INTO chillburgerdb.ordini (idutente, completato, data_ordine, orario) VALUES
((SELECT idutente FROM utenti WHERE username = 'mario.rossi'), 1, '2024-05-10', '12:30:00'),
((SELECT idutente FROM utenti WHERE username = 'anna.verdi'), 1, '2024-05-10', '19:00:00'),
((SELECT idutente FROM utenti WHERE username = 'giuseppe.gialli'), 1, '2024-05-11', '13:15:00'),
((SELECT idutente FROM utenti WHERE username = 'laura.bruni'), 1, '2024-05-11', '20:00:00'),
((SELECT idutente FROM utenti WHERE username = 'giuseppe.gialli'), 1, '2024-05-12', '19:15:00'),
((SELECT idutente FROM utenti WHERE username = 'laura.bruni'), 1, '2025-05-12', '21:15:00'),
((SELECT idutente FROM utenti WHERE username = 'giuseppe.gialli'), 1, '2025-05-15', '19:15:00'),
((SELECT idutente FROM utenti WHERE username = 'mario.rossi'), 1, '2025-05-20', '12:00:00');

INSERT INTO chillburgerdb.modifiche_stato (idordine, idstato, timestamp_modifica) VALUES (1, 5, '2024-05-10 13:35:00');
INSERT INTO chillburgerdb.modifiche_stato (idordine, idstato, timestamp_modifica) VALUES (2, 5, '2024-05-10 20:55:00');
INSERT INTO chillburgerdb.modifiche_stato (idordine, idstato, timestamp_modifica) VALUES (3, 5, '2024-05-11 13:45:00');
INSERT INTO chillburgerdb.modifiche_stato (idordine, idstato, timestamp_modifica) VALUES (4, 5, '2024-05-11 21:05:00');
INSERT INTO chillburgerdb.modifiche_stato (idordine, idstato, timestamp_modifica) VALUES (5, 5, '2024-05-12 19:50:00');
INSERT INTO chillburgerdb.modifiche_stato (idordine, idstato, timestamp_modifica) VALUES (6, 5, '2025-05-12 22:15:00');
INSERT INTO chillburgerdb.modifiche_stato (idordine, idstato, timestamp_modifica) VALUES (7, 5, '2025-05-15 19:55:00');
INSERT INTO chillburgerdb.modifiche_stato (idordine, idstato, timestamp_modifica) VALUES (8, 5, '2024-05-12 13:10:00');

INSERT INTO chillburgerdb.carrelli_prodotti (idordine, idprodotto, quantita) VALUES
(1, (SELECT idprodotto FROM prodotti WHERE nome = 'Patatine Fritte'), 1),
(1, (SELECT idprodotto FROM prodotti WHERE nome = 'Coca Cola'), 2);
insert into chillburgerdb.personalizzazioni(idordine, idprodotto, quantita)
values (1, (select idprodotto from prodotti where nome = 'Bacon Cheeseburger'), 1);
SET @id_personalizzazione_ordine_1 = LAST_INSERT_ID();
insert into chillburgerdb.modifiche_ingredienti (idpersonalizzazione, idingrediente, azione)
values (@id_personalizzazione_ordine_1, (select idingrediente from ingredienti where nome = 'bacon'), 'Aggiunto'),
(@id_personalizzazione_ordine_1, (select idingrediente from ingredienti where nome = 'maionese'), 'Rimosso');

INSERT INTO chillburgerdb.carrelli_prodotti (idordine, idprodotto, quantita) VALUES
(2, (SELECT idprodotto FROM prodotti WHERE nome = 'Patatine Fritte'), 2),
(2, (SELECT idprodotto FROM prodotti WHERE nome = 'Acqua Naturale'), 2);

INSERT INTO chillburgerdb.carrelli_prodotti (idordine, idprodotto, quantita) VALUES
(3, (SELECT idprodotto FROM prodotti WHERE nome = 'Onion Rings'), 1),
(3, (SELECT idprodotto FROM prodotti WHERE nome = 'Birra Artigianale Bionda'), 2);

INSERT INTO chillburgerdb.personalizzazioni (idordine, idprodotto, quantita) VALUES
(4, (SELECT idprodotto FROM prodotti WHERE nome = 'Chicken Deluxe'), 1);


INSERT INTO chillburgerdb.personalizzazioni (idordine, idprodotto, quantita) VALUES
(5, (SELECT idprodotto FROM prodotti WHERE nome = 'Bacon Cheeseburger'), 1);
SET @id_personalizzazione_ordine_5 = LAST_INSERT_ID();
insert into chillburgerdb.modifiche_ingredienti (idpersonalizzazione, idingrediente, azione)
values (@id_personalizzazione_ordine_5,(select idingrediente from ingredienti where nome = 'cheddar'), 'Aggiunto');


INSERT INTO chillburgerdb.carrelli_prodotti (idordine, idprodotto, quantita) VALUES
(6, (SELECT idprodotto FROM prodotti WHERE nome = 'Acqua Naturale'), 1),
(6, (SELECT idprodotto FROM prodotti WHERE nome = 'Tiramisù'), 2),
(6, (SELECT idprodotto FROM prodotti WHERE nome = 'Acqua Frizzante'), 1);
insert into chillburgerdb.personalizzazioni(idordine, idprodotto, quantita)
values (6, (select idprodotto from prodotti where nome = 'Chicken Deluxe'), 2);
SET @id_personalizzazione_ordine_6 = LAST_INSERT_ID();
insert into chillburgerdb.modifiche_ingredienti (idpersonalizzazione, idingrediente, azione)
values (@id_personalizzazione_ordine_6,(select idingrediente from ingredienti where nome = 'cheddar'), 'Aggiunto'),
(@id_personalizzazione_ordine_6, (select idingrediente from ingredienti where nome = 'petto di pollo'), 'Aggiunto'),
(@id_personalizzazione_ordine_6, (select idingrediente from ingredienti where nome = 'insalata'), 'Rimosso');

INSERT INTO chillburgerdb.carrelli_prodotti (idordine, idprodotto, quantita) VALUES
(7, (SELECT idprodotto FROM prodotti WHERE nome = 'Alette di Pollo BBQ'), 1),
(7, (SELECT idprodotto FROM prodotti WHERE nome = 'Fanta'), 2),
(7, (SELECT idprodotto FROM prodotti WHERE nome = 'Onion Rings'), 1);
insert into chillburgerdb.personalizzazioni(idordine, idprodotto, quantita)
values (7, (select idprodotto from prodotti where nome = 'Smoky Burger'), 2);
SET @id_personalizzazione_ordine_7 = LAST_INSERT_ID();
insert into chillburgerdb.modifiche_ingredienti (idpersonalizzazione, idingrediente, azione)
values (@id_personalizzazione_ordine_7, (select idingrediente from ingredienti where nome = 'scamorza affumicata'), 'Aggiunto'),
(@id_personalizzazione_ordine_7, (select idingrediente from ingredienti where nome = 'bacon'), 'Aggiunto'),
(@id_personalizzazione_ordine_7, (select idingrediente from ingredienti where nome = 'pomodori'), 'Rimosso');


INSERT INTO chillburgerdb.carrelli_prodotti (idordine, idprodotto, quantita) VALUES
(8, (SELECT idprodotto FROM prodotti WHERE nome = 'Patatine Fritte'), 1),
(8, (SELECT idprodotto FROM prodotti WHERE nome = 'Cheesecake ai Frutti di Bosco'), 1);

INSERT INTO chillburgerdb.personalizzazioni (idordine, idprodotto, quantita) VALUES
(1, (SELECT idprodotto FROM prodotti WHERE nome = 'Bacon Cheeseburger'), 1),
(2, (SELECT idprodotto FROM prodotti WHERE nome = 'Veggie Burger'), 2),
(3, (SELECT idprodotto FROM prodotti WHERE nome = 'Smoky Burger'), 2),
(5, (SELECT idprodotto FROM prodotti WHERE nome = 'Veggie Burger'), 1),
(8, (SELECT idprodotto FROM prodotti WHERE nome = 'Veggie Burger'), 1);



INSERT INTO chillburgerdb.recensioni (idordine, titolo, voto, commento, timestamp_recensione) VALUES
(1, 'Delizioso e Veloce!', 5, 'Il Bacon Cheeseburger era fantastico come sempre e la consegna è stata super rapida!', '2025-05-10 13:30:00'),
(2, 'Buono ma migliorabile', 3, 'Il Chicken Deluxe era buono, gli ingredienti sembravano freschi, ma il pollo era un po asciutto.', '2025-05-10 20:15:00'),
(3, 'Ottimo burger!', 5, 'Senza dubbio il miglior burger che abbia mai mangiato in città! Carne succosa e pane artigianale top.', '2025-05-11 18:30:00'),
(4, 'Servizio da rivedere', 3, 'Il burger (Smoky) era buono, ma abbiamo aspettato un po troppo e le patatine erano tiepide.', '2025-05-11 19:45:00'),
(5, 'Veggie Burger Sorprendente!', 5, 'Non mangio carne e trovare un Veggie Burger così saporito è una gioia. Consigliatissimo!', '2025-05-12 14:00:00'),
(6, 'Perfetto per una serata chill!', 4, 'Tutto ottimo, dall''antipasto al dolce. La Piadina era farcita abbondantemente. Atmosfera rilassante.', '2025-05-12 20:45:00');