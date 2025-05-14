-- *********************************************
-- * SQL MySQL generation
-- *--------------------------------------------
-- * DB-MAIN version: 11.0.2
-- * Generator date: Sep 14 2021
-- * Generation date: Tue May 13 2025
-- *********************************************

-- Database Section
-- ________________

DROP DATABASE IF EXISTS chillburgerdb;
CREATE DATABASE IF NOT EXISTS chillburgerdb;
USE chillburgerdb;

-- Tables Section
-- _____________

CREATE TABLE categorie (
     idcategoria INT AUTO_INCREMENT NOT NULL,
     descrizione VARCHAR(255) NOT NULL,
     PRIMARY KEY (idcategoria)
);

CREATE TABLE ingredienti (
     idingrediente INT AUTO_INCREMENT NOT NULL,
     nome VARCHAR(255) NOT NULL,
     sovrapprezzo DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
     giacenza INT NOT NULL,
     image VARCHAR(255),
     PRIMARY KEY (idingrediente)
);

CREATE TABLE notifiche (
     idnotifica INT AUTO_INCREMENT NOT NULL,
     titolo VARCHAR(255) NOT NULL,
     testo TEXT NOT NULL,
     vista BOOLEAN NOT NULL DEFAULT FALSE,
     tipo ENUM('ordine', 'prodotto', 'ingrediente') NOT NULL,
     idutente INT NOT NULL,
     idprodotto INT,
     idingrediente INT,
     idordine INT,
     timestamp_notifica TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     PRIMARY KEY (idnotifica)
);

CREATE TABLE ordini (
     idordine INT AUTO_INCREMENT NOT NULL,
     idutente INT NOT NULL,
     timestamp_ordine TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     PRIMARY KEY (idordine)
);

CREATE TABLE personalizzazioni (
     idpersonalizzazione INT AUTO_INCREMENT NOT NULL,
     prezzo DECIMAL(10, 2) NOT NULL, -- Gestito dai trigger
     quantita INT NOT NULL,
     idordine INT NOT NULL,
     idprodotto INT NOT NULL,
     PRIMARY KEY (idpersonalizzazione)
);

CREATE TABLE prodotti (
     idprodotto INT AUTO_INCREMENT NOT NULL,
     nome VARCHAR(255) NOT NULL,
     prezzo DECIMAL(10, 2) NOT NULL,
     disponibilita INT NOT NULL,
     idcategoria INT NOT NULL,
     image VARCHAR(255),
     PRIMARY KEY (idprodotto)
);

CREATE TABLE carrelli_prodotti (
     idprodotto INT NOT NULL,
     idordine INT NOT NULL,
     quantita INT NOT NULL,
     PRIMARY KEY (idordine, idprodotto)
);

CREATE TABLE composizioni (
     idprodotto INT NOT NULL,
     idingrediente INT NOT NULL,
     quantita INT NOT NULL,
     PRIMARY KEY (idprodotto, idingrediente)
);

CREATE TABLE modifiche_stato (
     idordine INT NOT NULL,
     idstato INT NOT NULL,
     timestamp_modifica TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     PRIMARY KEY (idordine, idstato)
     -- Le FK e gli indici per idordine e idstato verranno definiti più avanti
);

CREATE TABLE modifiche_ingredienti (
     idpersonalizzazione INT NOT NULL,
     idingrediente INT NOT NULL,
     quantita INT NOT NULL,
     PRIMARY KEY (idpersonalizzazione, idingrediente, quantita)
);

CREATE TABLE recensioni (
     idrecensione INT AUTO_INCREMENT NOT NULL,
     idordine INT NOT NULL,
     titolo VARCHAR(255) NOT NULL,
     voto INT NOT NULL CHECK (voto BETWEEN 1 AND 5),
     commento TEXT,
     timestamp_recensione TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     PRIMARY KEY (idrecensione),
     UNIQUE (idordine)
);

CREATE TABLE stati_ordine (
     idstato INT AUTO_INCREMENT NOT NULL,
     descrizione VARCHAR(255) NOT NULL,
     PRIMARY KEY (idstato)
);

CREATE TABLE utenti (
     idutente INT AUTO_INCREMENT NOT NULL,
     nome VARCHAR(255) NOT NULL,
     cognome VARCHAR(255) NOT NULL,
     username VARCHAR(255) NOT NULL,
     password VARCHAR(255) NOT NULL, -- Considerare hashing sicuro per le password
     tipo ENUM('cliente', 'venditore') NOT NULL,
     PRIMARY KEY (idutente),
     UNIQUE (username)
);

-- Constraints Section
-- ___________________

ALTER TABLE notifiche
ADD CONSTRAINT fkrelativa
FOREIGN KEY (idutente)
REFERENCES utenti (idutente);

ALTER TABLE notifiche
ADD CONSTRAINT fknotifica_prodotto
FOREIGN KEY (idprodotto)
REFERENCES prodotti (idprodotto);

ALTER TABLE notifiche
ADD CONSTRAINT fknotifica_ingrediente
FOREIGN KEY (idingrediente)
REFERENCES ingredienti (idingrediente);

ALTER TABLE notifiche
ADD CONSTRAINT fknotifica_ordine
FOREIGN KEY (idordine)
REFERENCES ordini (idordine);

ALTER TABLE ordini
ADD CONSTRAINT fkr
FOREIGN KEY (idutente)
REFERENCES utenti (idutente);

ALTER TABLE personalizzazioni
ADD CONSTRAINT fkcarrelli_personalizzazione
FOREIGN KEY (idordine)
REFERENCES ordini (idordine);

ALTER TABLE personalizzazioni
ADD CONSTRAINT fksu
FOREIGN KEY (idprodotto)
REFERENCES prodotti (idprodotto);

ALTER TABLE prodotti
ADD CONSTRAINT fkappartenenza
FOREIGN KEY (idcategoria)
REFERENCES categorie (idcategoria);

ALTER TABLE carrelli_prodotti
ADD CONSTRAINT fkcar_ord
FOREIGN KEY (idordine)
REFERENCES ordini (idordine);

ALTER TABLE carrelli_prodotti
ADD CONSTRAINT fkcar_pro
FOREIGN KEY (idprodotto)
REFERENCES prodotti (idprodotto);

ALTER TABLE composizioni
ADD CONSTRAINT fkcom_ing
FOREIGN KEY (idingrediente)
REFERENCES ingredienti (idingrediente);

ALTER TABLE composizioni
ADD CONSTRAINT fkcom_pro
FOREIGN KEY (idprodotto)
REFERENCES prodotti (idprodotto);

ALTER TABLE modifiche_stato
ADD CONSTRAINT fkdi_ord
FOREIGN KEY (idordine)
REFERENCES ordini (idordine);

ALTER TABLE modifiche_stato
ADD CONSTRAINT fkdi_sta
FOREIGN KEY (idstato)
REFERENCES stati_ordine (idstato);

ALTER TABLE modifiche_ingredienti
ADD CONSTRAINT fkmod_ing
FOREIGN KEY (idingrediente)
REFERENCES ingredienti (idingrediente);

ALTER TABLE modifiche_ingredienti
ADD CONSTRAINT fkmod_per
FOREIGN KEY (idpersonalizzazione)
REFERENCES personalizzazioni (idpersonalizzazione);

ALTER TABLE recensioni
ADD CONSTRAINT fkriguardo_fk
FOREIGN KEY (idordine)
REFERENCES ordini (idordine);

-- Index Section
-- _____________

CREATE INDEX idx_notifiche_idutente ON notifiche (idutente);
CREATE INDEX idx_notifiche_idprodotto ON notifiche (idprodotto);
CREATE INDEX idx_notifiche_idingrediente ON notifiche (idingrediente);
CREATE INDEX idx_notifiche_idordine ON notifiche (idordine);
CREATE INDEX idx_notifiche_timestamp ON notifiche (timestamp_notifica);

CREATE INDEX idx_ordini_idutente ON ordini (idutente);
CREATE INDEX idx_ordini_timestamp ON ordini (timestamp_ordine);

CREATE INDEX idx_personalizzazioni_idordine ON personalizzazioni (idordine);
CREATE INDEX idx_personalizzazioni_idprodotto ON personalizzazioni (idprodotto);

CREATE INDEX idx_prodotti_idcategoria ON prodotti (idcategoria);

CREATE INDEX idx_carrelliprodotti_idordine ON carrelli_prodotti (idordine);
CREATE INDEX idx_carrelliprodotti_idprodotto ON carrelli_prodotti (idprodotto);

CREATE INDEX idx_composizioni_idprodotto ON composizioni (idprodotto);
CREATE INDEX idx_composizioni_idingrediente ON composizioni (idingrediente);

CREATE INDEX idx_modifichestato_idordine ON modifiche_stato (idordine);
CREATE INDEX idx_modifichestato_idstato ON modifiche_stato (idstato);
CREATE INDEX idx_modifichestato_timestamp ON modifiche_stato (timestamp_modifica);

CREATE INDEX idx_modificheingredienti_idpersonalizzazione ON modifiche_ingredienti (idpersonalizzazione);
CREATE INDEX idx_modificheingredienti_idingrediente ON modifiche_ingredienti (idingrediente);

CREATE INDEX idx_recensioni_idordine ON recensioni (idordine);
CREATE INDEX idx_recensioni_timestamp ON recensioni (timestamp_recensione);

-- Triggers Section
-- ________________

DELIMITER //

CREATE TRIGGER trg_after_order_insert_ts
AFTER INSERT ON ordini
FOR EACH ROW
BEGIN
    INSERT INTO modifiche_stato (idordine, idstato) -- timestamp_modifica userà DEFAULT CURRENT_TIMESTAMP
    VALUES (NEW.idordine, 1); -- Assumendo idstato = 1 sia 'in attesa'
END; //

CREATE TRIGGER trg_before_personalizzazione_insert_set_base_price
BEFORE INSERT ON personalizzazioni
FOR EACH ROW
BEGIN
    DECLARE base_price DECIMAL(10, 2);

    SELECT prezzo INTO base_price
    FROM prodotti
    WHERE idprodotto = NEW.idprodotto;

    SET NEW.prezzo = base_price;
END; //

CREATE TRIGGER trg_after_modifiche_ingredienti_insert_update_price
AFTER INSERT ON modifiche_ingredienti
FOR EACH ROW
BEGIN
    DECLARE product_base_price DECIMAL(10, 2);
    DECLARE ingredients_surcharge_sum DECIMAL(10, 2);
    DECLARE current_personalizzazione_id INT;

    SET current_personalizzazione_id = NEW.idpersonalizzazione;

    SELECT p.prezzo INTO product_base_price
    FROM prodotti p
    JOIN personalizzazioni ps ON p.idprodotto = ps.idprodotto
    WHERE ps.idpersonalizzazione = current_personalizzazione_id;

    SELECT COALESCE(SUM(i.sovrapprezzo), 0) INTO ingredients_surcharge_sum
    FROM ingredienti i
    JOIN modifiche_ingredienti mi ON i.idingrediente = mi.idingrediente
    WHERE mi.idpersonalizzazione = current_personalizzazione_id AND mi.azione = 'aggiunto';

    UPDATE personalizzazioni
    SET prezzo = product_base_price + ingredients_surcharge_sum
    WHERE idpersonalizzazione = current_personalizzazione_id;
END; //

CREATE TRIGGER trg_after_modifiche_ingredienti_delete_update_price
AFTER DELETE ON modifiche_ingredienti
FOR EACH ROW
BEGIN
    DECLARE product_base_price DECIMAL(10, 2);
    DECLARE ingredients_surcharge_sum DECIMAL(10, 2);
    DECLARE current_personalizzazione_id INT;

    SET current_personalizzazione_id = OLD.idpersonalizzazione;

    SELECT p.prezzo INTO product_base_price
    FROM prodotti p
    JOIN personalizzazioni ps ON p.idprodotto = ps.idprodotto
    WHERE ps.idpersonalizzazione = current_personalizzazione_id;

    SELECT COALESCE(SUM(i.sovrapprezzo), 0) INTO ingredients_surcharge_sum
    FROM ingredienti i
    JOIN modifiche_ingredienti mi ON i.idingrediente = mi.idingrediente
    WHERE mi.idpersonalizzazione = current_personalizzazione_id AND mi.azione = 'aggiunto';

    UPDATE personalizzazioni
    SET prezzo = product_base_price + ingredients_surcharge_sum
    WHERE idpersonalizzazione = current_personalizzazione_id;
END; //

DELIMITER ;