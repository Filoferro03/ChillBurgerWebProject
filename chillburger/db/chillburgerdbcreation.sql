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
     completato BOOLEAN DEFAULT FALSE,
     prezzo_totale DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
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
     PRIMARY KEY (idprodotto,idordine)
);

CREATE TABLE composizioni (
     idprodotto INT NOT NULL,
     idingrediente INT NOT NULL,
     quantita INT NOT NULL,
     essenziale BOOLEAN DEFAULT FALSE,
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
     azione ENUM('rimosso','aggiunto') NOT NULL,
     PRIMARY KEY (idpersonalizzazione, idingrediente)
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
ADD CONSTRAINT fkcarrelli_personalizzazione2
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

DELIMITER //

CREATE TRIGGER trg_after_order_update_set_completed_status
AFTER UPDATE ON ordini
FOR EACH ROW
BEGIN
    IF NEW.completato = TRUE AND OLD.completato = FALSE THEN
        INSERT INTO modifiche_stato (idordine, idstato) -- timestamp_modifica userà DEFAULT CURRENT_TIMESTAMP
        VALUES (NEW.idordine, 1); -- Cambia '3' se l'ID per 'Completato' è diverso
    END IF;
END //

DELIMITER ;

-- Stored Procedure per aggiornare la disponibilità di un prodotto
DELIMITER //

CREATE PROCEDURE SP_UpdateProductAvailability(IN p_idprodotto INT)
BEGIN
    DECLARE calculated_availability INT;
    DECLARE is_composite BOOLEAN DEFAULT FALSE;

    -- Verifica se il prodotto è effettivamente composto da ingredienti
    SELECT COUNT(*) > 0 INTO is_composite
    FROM composizioni
    WHERE idprodotto = p_idprodotto;

    IF is_composite THEN
        -- Calcola la disponibilità basata sul minimo producibile con gli ingredienti attuali.
        -- Se un ingrediente ha una quantità richiesta (c.quantita) pari a 0, viene ignorato
        -- per prevenire divisioni per zero. Se tutti gli ingredienti hanno c.quantita = 0
        -- o se non ci sono ingredienti validi, calculated_availability sarà NULL.
        SELECT MIN(FLOOR(i.giacenza / c.quantita))
        INTO calculated_availability
        FROM composizioni c
        JOIN ingredienti i ON c.idingrediente = i.idingrediente
        WHERE c.idprodotto = p_idprodotto AND c.quantita > 0;

        -- Aggiorna la disponibilità del prodotto.
        -- Se calculated_availability è NULL (es. nessun ingrediente valido per il calcolo),
        -- la disponibilità viene impostata a 0.
        UPDATE prodotti
        SET disponibilita = COALESCE(calculated_availability, 0)
        WHERE idprodotto = p_idprodotto;
    -- ELSE
        -- Se il prodotto non è (o non è più) definito in 'composizioni',
        -- la sua disponibilità non viene gestita da questa logica.
        -- Si potrebbe voler impostare la disponibilità a 0 o un valore di default
        -- per i prodotti che erano compositi ma ora non lo sono più.
        -- Ad esempio:
        -- UPDATE prodotti SET disponibilita = 0 WHERE idprodotto = p_idprodotto;
        -- Per ora, se il prodotto non è composito, la sua disponibilità non viene alterata da questa procedura.
    END IF;
END //

DELIMITER ;

-- Trigger sulla tabella `ingredienti` per aggiornare la disponibilità dei prodotti
DELIMITER //

CREATE TRIGGER trg_after_ingredient_update_manage_availability
AFTER UPDATE ON ingredienti
FOR EACH ROW
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE current_idprodotto INT;
    -- Cursore per selezionare tutti i prodotti che contengono l'ingrediente la cui giacenza è stata modificata
    DECLARE cur_affected_products CURSOR FOR
        SELECT DISTINCT c.idprodotto
        FROM composizioni c
        WHERE c.idingrediente = NEW.idingrediente;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    -- Se la giacenza dell'ingrediente è effettivamente cambiata
    IF OLD.giacenza <> NEW.giacenza THEN
        OPEN cur_affected_products;
        product_loop: LOOP
            FETCH cur_affected_products INTO current_idprodotto;
            IF done THEN
                LEAVE product_loop;
            END IF;
            -- Chiama la stored procedure per aggiornare la disponibilità del prodotto specifico
            CALL SP_UpdateProductAvailability(current_idprodotto);
        END LOOP product_loop;
        CLOSE cur_affected_products;
    END IF;
END //

DELIMITER ;

-- Trigger sulla tabella `composizioni` dopo l'inserimento di una nuova composizione
DELIMITER //

CREATE TRIGGER trg_after_composition_insert_manage_availability
AFTER INSERT ON composizioni
FOR EACH ROW
BEGIN
    CALL SP_UpdateProductAvailability(NEW.idprodotto);
END //

DELIMITER ;

-- Trigger sulla tabella `composizioni` dopo l'aggiornamento di una composizione
DELIMITER //

CREATE TRIGGER trg_after_composition_update_manage_availability
AFTER UPDATE ON composizioni
FOR EACH ROW
BEGIN
    -- Se l'idprodotto della composizione è cambiato (scenario meno comune dato che è parte della PK)
    -- Questo gestisce il caso in cui la chiave primaria stessa venga aggiornata, il che di solito
    -- è un DELETE seguito da un INSERT, ma per completezza lo includiamo.
    IF OLD.idprodotto <> NEW.idprodotto THEN
        CALL SP_UpdateProductAvailability(OLD.idprodotto);
    END IF;
    -- Aggiorna sempre la disponibilità per il prodotto coinvolto nella riga aggiornata
    -- (NEW.idprodotto), che sia per cambio di quantità o di ingrediente.
    CALL SP_UpdateProductAvailability(NEW.idprodotto);
END //

DELIMITER ;

-- Trigger sulla tabella `composizioni` dopo la cancellazione di una composizione
DELIMITER //

CREATE TRIGGER trg_after_composition_delete_manage_availability
AFTER DELETE ON composizioni
FOR EACH ROW
BEGIN
    CALL SP_UpdateProductAvailability(OLD.idprodotto);
END //

DELIMITER ;

-- Stored Procedure per aggiornare il prezzo totale di un ordine
DELIMITER //

CREATE PROCEDURE SP_UpdateOrderTotalPrice(IN p_idordine INT)
BEGIN
    DECLARE total_from_personalizzazioni DECIMAL(10, 2);
    DECLARE total_from_carrelli_prodotti DECIMAL(10, 2);

    -- Calcola il totale dalla tabella personalizzazioni (prezzo unitario * quantità)
    SELECT COALESCE(SUM(prezzo * quantita), 0)
    INTO total_from_personalizzazioni
    FROM personalizzazioni
    WHERE idordine = p_idordine;

    -- Calcola il totale dalla tabella carrelli_prodotti (prezzo prodotto * quantità)
    SELECT COALESCE(SUM(p.prezzo * cp.quantita), 0)
    INTO total_from_carrelli_prodotti
    FROM carrelli_prodotti cp
    JOIN prodotti p ON cp.idprodotto = p.idprodotto
    WHERE cp.idordine = p_idordine;

    -- Aggiorna il prezzo_totale nella tabella ordini
    UPDATE ordini
    SET prezzo_totale = total_from_personalizzazioni + total_from_carrelli_prodotti + 2.50
    WHERE idordine = p_idordine;
END //

DELIMITER ;

-- Triggers per la tabella 'personalizzazioni'
DELIMITER //

CREATE TRIGGER trg_after_personalizzazioni_insert_update_order_total
AFTER INSERT ON personalizzazioni
FOR EACH ROW
BEGIN
    CALL SP_UpdateOrderTotalPrice(NEW.idordine);
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_after_personalizzazioni_update_update_order_total
AFTER UPDATE ON personalizzazioni
FOR EACH ROW
BEGIN
    -- Ricalcola se il prezzo o la quantità della personalizzazione sono cambiati.
    -- NEW.idordine dovrebbe essere uguale a OLD.idordine in un update standard.
    IF OLD.prezzo <> NEW.prezzo OR OLD.quantita <> NEW.quantita THEN
        CALL SP_UpdateOrderTotalPrice(NEW.idordine);
    END IF;
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_after_personalizzazioni_delete_update_order_total
AFTER DELETE ON personalizzazioni
FOR EACH ROW
BEGIN
    CALL SP_UpdateOrderTotalPrice(OLD.idordine);
END //

DELIMITER ;

-- Triggers per la tabella 'carrelli_prodotti'
DELIMITER //

CREATE TRIGGER trg_after_carrelli_prodotti_insert_update_order_total
AFTER INSERT ON carrelli_prodotti
FOR EACH ROW
BEGIN
    CALL SP_UpdateOrderTotalPrice(NEW.idordine);
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_after_carrelli_prodotti_update_update_order_total
AFTER UPDATE ON carrelli_prodotti
FOR EACH ROW
BEGIN
    IF OLD.quantita <> NEW.quantita THEN
        CALL SP_UpdateOrderTotalPrice(NEW.idordine); -- NEW.idordine sarà uguale a OLD.idordine
    END IF;
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_after_carrelli_prodotti_delete_update_order_total
AFTER DELETE ON carrelli_prodotti
FOR EACH ROW
BEGIN
    CALL SP_UpdateOrderTotalPrice(OLD.idordine);
END //

DELIMITER ;