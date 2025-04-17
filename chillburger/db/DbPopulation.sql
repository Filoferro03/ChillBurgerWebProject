-- *********************************************
-- * SQL MySQL population                      
-- *--------------------------------------------
-- * DB-MAIN version: 11.0.2              
-- * Generator date: Sep 14 2021              
-- * Generation date: Sat Apr  5 11:34:23 2025 
-- ********************************************* 

USE chillburgerdb;

-- Insert Ingredienti
INSERT INTO chillburgerdb.ingredienti (nome, sovrapprezzo, giacenza, image) VALUES
('pane', 0.30, 10, 'pane.png'),
('hamburger di manzo', 1.20, 10, 'hamburger-di-manzo.png'),
('insalata', 0.50, 10, 'insalata.png'),
('ketchup', 0.40, 10, 'ketchup.png'),
('maionese', 0.50, 10, 'maionese.png'),
('pomodori', 0.60, 10, 'pomodori.png'),
('funghi', 0.80, 10, 'funghi.png'),
('bacon', 1.20, 10, 'bacon.png'),
('cipolla', 0.40, 10, 'cipolla.png'),
('squaquerone', 0.90, 10, 'squaquerone.png'),
('cotoletta', 1.10, 10, 'cotoletta.png'),
('cheddar', 0.80, 10, 'cheddar.png'),
('fontina', 0.90, 10, 'fontina.png'),
('pancetta', 1.00, 10, 'pancetta.png'),
('salsa barbecue', 0.70, 10, 'salsa-barbecue.png'),
('peperoni', 0.70, 10, 'peperoni.png'),
('zucchine', 0.60, 10, 'zucchine.png'),
('melanzane', 0.60, 10, 'melanzane.png'),
('petto di pollo', 1.00, 10, 'petto-di-pollo.png');

-- Insert Categorie
INSERT INTO chillburgerdb.categorie (descrizione) VALUES
('panini'),
('fritti'),
('antipasti'),
('bevande'),
('dolci');

-- Insert Prodotti
INSERT INTO chillburgerdb.prodotti (nome, prezzo, disponibilita, idcategoria, image) VALUES
-- Categoria: panini (idcategoria = 1)
('Bacon Cheeseburger', 14.50, 10, 1, 'bacon-cheeseburger.png'),
('Chicken Deluxe', 13.00, 10, 1, 'chicken-deluxe.png'),

-- Categoria: fritti (idcategoria = 2)
('Onion Rings', 4.50, 15, 2, 'onion-rings.png'),
('Patatine Fritte', 3.50, 20, 2, 'patatine-fritte.png'),

-- Categoria: antipasti (idcategoria = 3)
('Bruschette Miste', 5.00, 10, 3, 'bruschette-miste.png'),
('Mozzarelline Fritte', 5.50, 10, 3, 'mozzarelline-fritte.png'),

-- Categoria: bevande (idcategoria = 4)
('Coca Cola', 3.00, 30, 4, 'coca-cola.png'),
('Fanta', 3.00, 30, 4, 'fanta.png'),

-- Categoria: dolci (idcategoria = 5)
('Tiramisù', 5.00, 8, 5, 'tiramisu.png'),
('Cheesecake ai Frutti di Bosco', 5.50, 8, 5, 'cheesecake-frutti-di-bosco.png');

-- Insert Composizioni
-- Composizione del Bacon Cheeseburger (id = 1)
INSERT INTO chillburgerdb.composizioni (idprodotto, idingrediente, quantita) VALUES
(1, 1, 1), -- Pane
(1, 2, 1), -- Hamburger di manzo
(1, 8, 2), -- Bacon (2 fette)
(1, 12, 1), -- Cheddar (1 fetta)
(1, 4, 1), -- Ketchup (1 cucchiaio)
(1, 5, 1); -- Maionese (1 cucchiaio)

-- Composizione del Chicken Deluxe (id = 2)
INSERT INTO chillburgerdb.composizioni (idprodotto, idingrediente, quantita) VALUES
(2, 1, 1), -- Pane
(2, 19, 1), -- Petto di pollo
(2, 12, 1), -- Cheddar (1 fetta)
(2, 3, 1), -- Insalata (1 porzione)
(2, 5, 1); -- Maionese (1 cucchiaio)

-- Insert Stati Ordine
INSERT INTO chillburgerdb.stati_ordine (descrizione) VALUES
('in attesa'),
('in preparazione'),
('in consegna'),
('consegnato'),
('confermato'),
('annullato');

-- Insert Utenti
INSERT INTO chillburgerdb.utenti (nome, cognome, username, password, tipo) VALUES
('Mario', 'Rossi', 'mario.rossi', 'password123', 'cliente'),
('Luigi', 'Bianchi', 'luigi.bianchi', 'password123', 'venditore');