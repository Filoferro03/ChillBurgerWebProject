-- *********************************************
-- * SQL MySQL generation                      
-- *--------------------------------------------
-- * DB-MAIN version: 11.0.2              
-- * Generator date: Sep 14 2021              
-- * Generation date: Sat Apr  5 11:34:23 2025 
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
     sovrapprezzo DECIMAL(10, 2),
     giacenza INT NOT NULL,
     image VARCHAR(255),
     PRIMARY KEY (idingrediente)
);

CREATE TABLE notifiche (
     idnotifica INT AUTO_INCREMENT NOT NULL,
     titolo VARCHAR(255) NOT NULL,
     testo TEXT NOT NULL,
     vista BOOLEAN NOT NULL DEFAULT FALSE,
     data DATE NOT NULL,
     ora TIME NOT NULL,
     tipo ENUM('ordine', 'prodotto', 'ingrediente') NOT NULL,     
     idutente INT NOT NULL,
     idprodotto INT,
     idingrediente INT,
     idordine INT,
     PRIMARY KEY (idnotifica)
);

CREATE TABLE ordini (
     idordine INT AUTO_INCREMENT NOT NULL,
     data DATE NOT NULL,
     ora TIME NOT NULL,
     idutente INT NOT NULL,
     PRIMARY KEY (idordine)
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
     descrizione VARCHAR(255) NOT NULL,
     idordine INT NOT NULL,
     data DATE NOT NULL,
     orario TIME NOT NULL,
     PRIMARY KEY (idordine, descrizione)
);

CREATE TABLE modifiche_ingredienti (
     idpersonalizzazione INT NOT NULL,
     idingrediente INT NOT NULL,
     azione ENUM('aggiunto', 'rimosso') NOT NULL,
     PRIMARY KEY (idpersonalizzazione, idingrediente)
);

CREATE TABLE recensioni (
     idrecensione INT AUTO_INCREMENT NOT NULL,
     idordine INT NOT NULL,
     titolo VARCHAR(255) NOT NULL,
     voto INT NOT NULL CHECK (voto BETWEEN 1 AND 5),
     commento TEXT,
     PRIMARY KEY (idrecensione),
     UNIQUE (idordine)
);

CREATE TABLE stati_ordine (
     descrizione VARCHAR(255) NOT NULL,
     PRIMARY KEY (descrizione)
);

CREATE TABLE utenti (
     idutente INT AUTO_INCREMENT NOT NULL,
     nome VARCHAR(255) NOT NULL,
     cognome VARCHAR(255) NOT NULL,
     username VARCHAR(255) NOT NULL,
     password VARCHAR(255) NOT NULL,
     tipo ENUM('cliente', 'venditore') NOT NULL,
     PRIMARY KEY (idutente)
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
FOREIGN KEY (descrizione) 
REFERENCES stati_ordine (descrizione);

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

CREATE INDEX idx_notifiche_username ON notifiche (idutente);
CREATE INDEX idx_notifiche_idprodotto ON notifiche (idprodotto);
CREATE INDEX idx_notifiche_idingrediente ON notifiche (idingrediente);
CREATE INDEX idx_notifiche_idordine ON notifiche (idordine);
CREATE INDEX idx_ordini_username ON ordini (idutente);
CREATE INDEX idx_personalizzazioni_idordine ON personalizzazioni (idordine);
CREATE INDEX idx_personalizzazioni_idprodotto ON personalizzazioni (idprodotto);
CREATE INDEX idx_prodotti_idcategoria ON prodotti (idcategoria);
CREATE INDEX idx_carrelliprodotti_idordine ON carrelli_prodotti (idordine);
CREATE INDEX idx_carrelliprodotti_idprodotto ON carrelli_prodotti (idprodotto);
CREATE INDEX idx_composizioni_idprodotto ON composizioni (idprodotto);
CREATE INDEX idx_composizioni_idingrediente ON composizioni (idingrediente);
CREATE INDEX idx_modifichestato_idordine ON modifiche_stato (idordine);
CREATE INDEX idx_modifichestato_descrizione ON modifiche_stato (descrizione);
CREATE INDEX idx_modificheingredienti_idpersonalizzazione ON modifiche_ingredienti (idpersonalizzazione);
CREATE INDEX idx_modificheingredienti_idingrediente ON modifiche_ingredienti (idingrediente);
CREATE INDEX idx_recensioni_idordine ON recensioni (idordine);