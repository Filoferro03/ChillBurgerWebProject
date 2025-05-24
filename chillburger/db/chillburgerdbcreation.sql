-- Database Section

DROP DATABASE IF EXISTS chillburgerdb;
CREATE DATABASE IF NOT EXISTS chillburgerdb;
USE chillburgerdb;

-- Tables Section

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
     vista TINYINT(1) NOT NULL DEFAULT 0,
     tipo ENUM('ordine', 'prodotto', 'ingrediente') NOT NULL,
     idutente INT NOT NULL,
     idprodotto INT,
     idingrediente INT,
     idordine INT,
     timestamp_notifica TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     PRIMARY KEY (idnotifica)
);

CREATE TABLE fasce_orari (
    orario TIME NOT NULL, -- L'ID è l'orario stesso
    PRIMARY KEY (orario)
);

CREATE TABLE ordini (
     idordine INT AUTO_INCREMENT NOT NULL,
     idutente INT NOT NULL,
     data_ordine DATE NOT NULL DEFAULT (CURRENT_DATE), -- Data dell'ordine
     orario TIME DEFAULT (current_time()), -- Chiave esterna che punta a fasce_orari
     completato TINYINT(1) DEFAULT 0,
     timestamp_ordine TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     prezzo_totale DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
     PRIMARY KEY (idordine),
     UNIQUE KEY unique_data_orario_ordine (data_ordine, orario) -- Vincolo di unicità
);

CREATE TABLE personalizzazioni (
     idpersonalizzazione INT AUTO_INCREMENT NOT NULL,
     prezzo DECIMAL(10, 2) NOT NULL,
     quantita INT NOT NULL,
     idordine INT NOT NULL,
     idprodotto INT NOT NULL,
     PRIMARY KEY (idpersonalizzazione)
);

CREATE TABLE prodotti (
     idprodotto INT AUTO_INCREMENT NOT NULL,
     nome VARCHAR(255) NOT NULL,
     prezzo DECIMAL(10, 2) NOT NULL,
     disponibilita INT NOT NULL DEFAULT 0,
     idcategoria INT NOT NULL,
     image VARCHAR(255),
     PRIMARY KEY (idprodotto)
);

CREATE TABLE carrelli_prodotti (
     idprodotto INT NOT NULL,
     idordine INT NOT NULL,
     quantita INT NOT NULL,
     PRIMARY KEY (idprodotto, idordine)
);

CREATE TABLE composizioni (
     idprodotto INT NOT NULL,
     idingrediente INT NOT NULL,
     quantita INT NOT NULL,
     essenziale TINYINT(1) DEFAULT 0,
     PRIMARY KEY (idprodotto, idingrediente)
);

CREATE TABLE modifiche_stato (
     idordine INT NOT NULL,
     idstato INT NOT NULL,
     timestamp_modifica TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     PRIMARY KEY (idordine, idstato)
);

CREATE TABLE modifiche_ingredienti (
     idpersonalizzazione INT NOT NULL,
     idingrediente INT NOT NULL,
     azione ENUM('rimosso', 'aggiunto') NOT NULL,
     PRIMARY KEY (idpersonalizzazione, idingrediente)
);

CREATE TABLE recensioni (
     idrecensione INT AUTO_INCREMENT NOT NULL,
     idordine INT NOT NULL,
     titolo VARCHAR(255) NOT NULL,
     voto INT NOT NULL,
     commento TEXT,
     timestamp_recensione TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
     PRIMARY KEY (idrecensione),
     UNIQUE KEY unique_idordine (idordine)
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
     password VARCHAR(255) NOT NULL,
     tipo ENUM('cliente', 'venditore') NOT NULL DEFAULT 'cliente',
     PRIMARY KEY (idutente),
     UNIQUE KEY unique_username (username)
);

-- Constraints Section

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

ALTER TABLE ordini
ADD CONSTRAINT fk_fascia_oraria
FOREIGN KEY (orario)
REFERENCES fasce_orari (orario);

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

ALTER TABLE ingredienti
ADD CONSTRAINT chk_giacenza_non_negative CHECK (giacenza >= 0);

ALTER TABLE prodotti
ADD CONSTRAINT chk_disponibilita_non_negative CHECK (disponibilita >= 0);

-- Index Section

CREATE INDEX idx_notifiche_idutente ON notifiche (idutente);
CREATE INDEX idx_notifiche_idprodotto ON notifiche (idprodotto);
CREATE INDEX idx_notifiche_idingrediente ON notifiche (idingrediente);
CREATE INDEX idx_notifiche_idordine ON notifiche (idordine);
CREATE INDEX idx_notifiche_timestamp ON notifiche (timestamp_notifica);

CREATE INDEX idx_ordini_idutente ON ordini (idutente);
CREATE INDEX idx_ordini_timestamp ON ordini (timestamp_ordine);
CREATE INDEX idx_ordini_data_ordine ON ordini (data_ordine);
CREATE INDEX idx_ordini_idfascia_oraria ON ordini (orario);

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

CREATE TRIGGER trg_after_order_update_set_completed_status
AFTER UPDATE ON ordini
FOR EACH ROW
BEGIN
    IF NEW.completato = 1 AND OLD.completato = 0 THEN
        INSERT INTO modifiche_stato (idordine, idstato)
        VALUES (NEW.idordine, 1);
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

DELIMITER //

CREATE TRIGGER trg_process_order_stock_on_preparation_atomic
AFTER INSERT ON modifiche_stato
FOR EACH ROW
BEGIN
    -- Variabili locali per lo scope principale del trigger
    DECLARE v_idordine INT;
    DECLARE v_idprodotto_standard INT;
    DECLARE v_quantita_standard INT;
    DECLARE v_is_composite INT;
    DECLARE v_idpersonalizzazione INT;
    DECLARE v_idprodotto_base_pers INT;
    DECLARE v_quantita_personalizzazione INT;
    DECLARE v_idingrediente_comp_loop INT;
    DECLARE v_quantita_ingrediente_base_loop INT; -- Corretto tipo da DECIMAL a INT
    DECLARE v_is_removed INT;
    DECLARE v_idingrediente_aggiunto_loop INT;
    DECLARE QTA_INGREDIENTE_AGGIUNTO_UNITARIA INT DEFAULT 1;
    DECLARE v_current_giacenza INT; -- Corretto tipo da DECIMAL a INT
    DECLARE v_current_disponibilita INT;
    DECLARE v_decrement_amount INT; -- Corretto tipo da DECIMAL a INT
    DECLARE v_error_message VARCHAR(255);
    -- I flag 'done_...' verranno dichiarati localmente nei blocchi nidificati

    IF NEW.idstato = 2 THEN
        SET v_idordine = NEW.idordine;

        -- Sezione 1: Processa i prodotti standard da carrelli_prodotti
        BEGIN -- Blocco per il cursore dei prodotti standard
            DECLARE done_standard_products INT DEFAULT FALSE;
            DECLARE cur_standard_products CURSOR FOR
                SELECT cp.idprodotto, cp.quantita
                FROM carrelli_prodotti cp
                WHERE cp.idordine = v_idordine;
            DECLARE CONTINUE HANDLER FOR NOT FOUND SET done_standard_products = TRUE;

            OPEN cur_standard_products;
            loop_standard_products: LOOP
                FETCH cur_standard_products INTO v_idprodotto_standard, v_quantita_standard;
                IF done_standard_products THEN
                    LEAVE loop_standard_products;
                END IF;

                SELECT COUNT(*) INTO v_is_composite
                FROM composizioni c
                WHERE c.idprodotto = v_idprodotto_standard;

                IF v_is_composite > 0 THEN
                    -- Prodotto standard composito: decrementa ingredienti
                    BEGIN -- Blocco per il cursore degli ingredienti del prodotto standard composito
                        DECLARE done_std_comp_ing INT DEFAULT FALSE;
                        DECLARE v_id_ing_std_comp INT;
                        DECLARE v_qta_ing_std_comp INT; -- Corretto tipo
                        DECLARE cur_std_comp_ing CURSOR FOR
                            SELECT c.idingrediente, c.quantita
                            FROM composizioni c -- Assicurarsi che l'alias 'c' sia corretto
                            WHERE c.idprodotto = v_idprodotto_standard;
                        DECLARE CONTINUE HANDLER FOR NOT FOUND SET done_std_comp_ing = TRUE;

                        OPEN cur_std_comp_ing;
                        loop_std_comp_ing: LOOP
                            FETCH cur_std_comp_ing INTO v_id_ing_std_comp, v_qta_ing_std_comp;
                            IF done_std_comp_ing THEN
                                LEAVE loop_std_comp_ing;
                            END IF;

                            SET v_decrement_amount = v_qta_ing_std_comp * v_quantita_standard;
                            SELECT giacenza INTO v_current_giacenza FROM ingredienti WHERE idingrediente = v_id_ing_std_comp FOR UPDATE;

                            IF v_current_giacenza < v_decrement_amount THEN
                                SET v_error_message = CONCAT('Giacenza insufficiente per ingrediente ID ', v_id_ing_std_comp, ' (prodotto standard ID ', v_idprodotto_standard, ', ordine ID ', v_idordine, '). Richiesti: ', v_decrement_amount, ', Disponibili: ', v_current_giacenza);
                                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_message;
                            END IF;
                            UPDATE ingredienti SET giacenza = giacenza - v_decrement_amount WHERE idingrediente = v_id_ing_std_comp;
                        END LOOP loop_std_comp_ing;
                        CLOSE cur_std_comp_ing;
                    END; -- Fine blocco cursore ingredienti prodotto standard composito
                ELSE
                    -- Prodotto standard non composito: decrementa disponibilità diretta
                    SET v_decrement_amount = v_quantita_standard;
                    SELECT disponibilita INTO v_current_disponibilita FROM prodotti WHERE idprodotto = v_idprodotto_standard FOR UPDATE;

                    IF v_current_disponibilita < v_decrement_amount THEN
                        SET v_error_message = CONCAT('Disponibilità insufficiente per prodotto ID ', v_idprodotto_standard, ' (ordine ID ', v_idordine, '). Richiesti: ', v_decrement_amount, ', Disponibili: ', v_current_disponibilita);
                        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_message;
                    END IF;
                    UPDATE prodotti SET disponibilita = disponibilita - v_decrement_amount WHERE idprodotto = v_idprodotto_standard;
                END IF;
            END LOOP loop_standard_products;
            CLOSE cur_standard_products;
        END; -- Fine blocco cursore prodotti standard

        -- Sezione 2: Processa i prodotti personalizzati da personalizzazioni
        BEGIN -- Blocco per il cursore delle personalizzazioni
            DECLARE done_personalizzazioni INT DEFAULT FALSE;
            DECLARE cur_personalizzazioni CURSOR FOR
                SELECT p.idpersonalizzazione, p.idprodotto, p.quantita
                FROM personalizzazioni p
                WHERE p.idordine = v_idordine;
            DECLARE CONTINUE HANDLER FOR NOT FOUND SET done_personalizzazioni = TRUE;

            OPEN cur_personalizzazioni;
            loop_personalizzazioni: LOOP
                FETCH cur_personalizzazioni INTO v_idpersonalizzazione, v_idprodotto_base_pers, v_quantita_personalizzazione;
                IF done_personalizzazioni THEN
                    LEAVE loop_personalizzazioni;
                END IF;

                -- 2a. Ingredienti base (considerando rimozioni)
                BEGIN -- Blocco per cursore ingredienti base personalizzazione
                    DECLARE done_base_ing_pers INT DEFAULT FALSE;
                    -- v_idingrediente_comp_loop e v_quantita_ingrediente_base_loop sono già dichiarate nello scope esterno
                    DECLARE cur_base_ing_pers CURSOR FOR
                        SELECT c.idingrediente, c.quantita
                        FROM composizioni c
                        WHERE c.idprodotto = v_idprodotto_base_pers;
                    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done_base_ing_pers = TRUE;

                    OPEN cur_base_ing_pers;
                    loop_base_ing_pers: LOOP
                        FETCH cur_base_ing_pers INTO v_idingrediente_comp_loop, v_quantita_ingrediente_base_loop;
                        IF done_base_ing_pers THEN LEAVE loop_base_ing_pers; END IF;

                        SELECT COUNT(*) INTO v_is_removed
                        FROM modifiche_ingredienti mi
                        WHERE mi.idpersonalizzazione = v_idpersonalizzazione
                          AND mi.idingrediente = v_idingrediente_comp_loop
                          AND mi.azione = 'rimosso';

                        IF v_is_removed = 0 THEN -- Non rimosso
                            SET v_decrement_amount = v_quantita_ingrediente_base_loop * v_quantita_personalizzazione;
                            SELECT giacenza INTO v_current_giacenza FROM ingredienti WHERE idingrediente = v_idingrediente_comp_loop FOR UPDATE;

                            IF v_current_giacenza < v_decrement_amount THEN
                                SET v_error_message = CONCAT('Giacenza insufficiente per ingrediente base ID ', v_idingrediente_comp_loop, ' (personalizzazione ID ', v_idpersonalizzazione, ', ordine ID ', v_idordine, '). Richiesti: ', v_decrement_amount, ', Disponibili: ', v_current_giacenza);
                                SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_message;
                            END IF;
                            UPDATE ingredienti SET giacenza = giacenza - v_decrement_amount WHERE idingrediente = v_idingrediente_comp_loop;
                        END IF;
                    END LOOP loop_base_ing_pers;
                    CLOSE cur_base_ing_pers;
                END; -- Fine blocco cursore ingredienti base personalizzazione

                -- 2b. Ingredienti aggiunti
                BEGIN -- Blocco per cursore ingredienti aggiunti personalizzazione
                    DECLARE done_added_ing_pers INT DEFAULT FALSE;
                    -- v_idingrediente_aggiunto_loop è già dichiarata nello scope esterno
                    DECLARE cur_added_ing_pers CURSOR FOR
                        SELECT mi.idingrediente
                        FROM modifiche_ingredienti mi
                        WHERE mi.idpersonalizzazione = v_idpersonalizzazione AND mi.azione = 'aggiunto';
                    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done_added_ing_pers = TRUE;

                    OPEN cur_added_ing_pers;
                    loop_added_ing_pers: LOOP
                        FETCH cur_added_ing_pers INTO v_idingrediente_aggiunto_loop;
                        IF done_added_ing_pers THEN LEAVE loop_added_ing_pers; END IF;

                        SET v_decrement_amount = QTA_INGREDIENTE_AGGIUNTO_UNITARIA * v_quantita_personalizzazione;
                        SELECT giacenza INTO v_current_giacenza FROM ingredienti WHERE idingrediente = v_idingrediente_aggiunto_loop FOR UPDATE;

                        IF v_current_giacenza < v_decrement_amount THEN
                           SET v_error_message = CONCAT('Giacenza insufficiente per ingrediente aggiunto ID ', v_idingrediente_aggiunto_loop, ' (personalizzazione ID ', v_idpersonalizzazione, ', ordine ID ', v_idordine, '). Richiesti: ', v_decrement_amount, ', Disponibili: ', v_current_giacenza);
                           SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = v_error_message;
                        END IF;
                        UPDATE ingredienti SET giacenza = giacenza - v_decrement_amount WHERE idingrediente = v_idingrediente_aggiunto_loop;
                    END LOOP loop_added_ing_pers;
                    CLOSE cur_added_ing_pers;
                END; -- Fine blocco cursore ingredienti aggiunti personalizzazione

            END LOOP loop_personalizzazioni;
            CLOSE cur_personalizzazioni;
        END; -- Fine blocco cursore personalizzazioni

    END IF; -- Fine IF NEW.idstato = 2
END //

DELIMITER ;

-- Trigger per notifiche automatiche quando giacenza ingredienti <= 3
DELIMITER //

CREATE TRIGGER trg_after_ingredienti_update_low_stock_notification
AFTER UPDATE ON ingredienti
FOR EACH ROW
BEGIN
    -- Controlla se la giacenza è scesa a 3 o meno E non era già <= 3 prima
    -- (per evitare notifiche duplicate)
    IF NEW.giacenza <= 3 AND OLD.giacenza > 3 THEN
        -- Inserisce notifica per tutti gli utenti di tipo 'venditore'
        INSERT INTO notifiche (
            titolo, 
            testo, 
            tipo, 
            idutente, 
            idingrediente,
            vista
        )
        SELECT 
            CONCAT('Scorte Basse: ', NEW.nome),
            CONCAT('L''ingrediente "', NEW.nome, '" ha solo ', NEW.giacenza, ' unità rimaste in giacenza. Considera di rifornire.'),
            'ingrediente',
            u.idutente,
            NEW.idingrediente,
            0
        FROM utenti u 
        WHERE u.tipo = 'venditore';
    END IF;
END //

DELIMITER ;

-- Trigger per notifiche automatiche quando disponibilità prodotti <= 3
DELIMITER //

CREATE TRIGGER trg_after_prodotti_update_low_availability_notification
AFTER UPDATE ON prodotti
FOR EACH ROW
BEGIN
    -- Controlla se la disponibilità è scesa a 3 o meno E non era già <= 3 prima
    -- (per evitare notifiche duplicate)
    IF NEW.disponibilita <= 3 AND OLD.disponibilita > 3 THEN
        -- Inserisce notifica per tutti gli utenti di tipo 'venditore'
        INSERT INTO notifiche (
            titolo, 
            testo, 
            tipo, 
            idutente, 
            idprodotto,
            vista
        )
        SELECT 
            CONCAT('Prodotto in Esaurimento: ', NEW.nome),
            CONCAT('Il prodotto "', NEW.nome, '" ha solo ', NEW.disponibilita, ' unità disponibili. Verifica se è necessario aumentare la produzione.'),
            'prodotto',
            u.idutente,
            NEW.idprodotto,
            0
        FROM utenti u 
        WHERE u.tipo = 'venditore';
    END IF;
END //

DELIMITER ;

DELIMITER //

CREATE TRIGGER trg_after_modifiche_stato_notification
AFTER INSERT ON modifiche_stato
FOR EACH ROW
BEGIN
    DECLARE v_idutente_cliente INT;
    DECLARE v_idutente_venditore INT;
    DECLARE v_titolo VARCHAR(255);
    DECLARE v_testo TEXT;
    DECLARE v_data_ordine DATE;
    DECLARE v_orario_ordine TIME;

    -- Ottieni l'ID dell'utente cliente, la data e l'orario associati all'ordine
    SELECT idutente, data_ordine, orario INTO v_idutente_cliente, v_data_ordine, v_orario_ordine
    FROM ordini
    WHERE idordine = NEW.idordine;

    -- Ottieni l'ID di un utente venditore (assumiamo che ce ne sia almeno uno)
    SELECT idutente INTO v_idutente_venditore
    FROM utenti
    WHERE tipo = 'venditore'
    LIMIT 1;

    -- Notifica al cliente (per stati diversi da 5 - "Confermato")
    IF NEW.idstato <> 5 THEN
        SELECT descrizione INTO v_testo
        FROM stati_ordine
        WHERE idstato = NEW.idstato;

        SET v_titolo = CONCAT('Aggiornamento Ordine #', NEW.idordine);
        SET v_testo = CONCAT('Il tuo ordine del ', DATE_FORMAT(v_data_ordine, '%d/%m/%Y'), ' alle ', v_orario_ordine, ' è ora: ', v_testo, '.');

        INSERT INTO notifiche (titolo, testo, vista, tipo, idutente, idordine)
        VALUES (v_titolo, v_testo, 0, 'ordine', v_idutente_cliente, NEW.idordine);
    END IF;

    -- Notifica al venditore (solo per stato 5 - "Confermato")
    IF NEW.idstato = 5 THEN
        SET v_titolo = CONCAT('Ordine Completato #', NEW.idordine);
        SET v_testo = CONCAT('L''ordine #', NEW.idordine, ' è stato completato e confermato dal cliente.');

        INSERT INTO notifiche (titolo, testo, vista, tipo, idutente, idordine)
        VALUES (v_titolo, v_testo, 0, 'ordine', v_idutente_venditore, NEW.idordine);
    END IF;
END;
//
DELIMITER ;