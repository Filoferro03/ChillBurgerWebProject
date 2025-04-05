-- *********************************************
-- * SQL MySQL generation                      
-- *--------------------------------------------
-- * DB-MAIN version: 11.0.2              
-- * Generator date: Sep 14 2021              
-- * Generation date: Sat Apr  5 11:34:23 2025 
-- ********************************************* 

-- Database Section
-- ________________ 

DROP DATABASE chillburgerdb;
CREATE DATABASE IF NOT EXISTS chillburgerdb;
USE chillburgerdb;

-- Tables Section
-- _____________ 

CREATE TABLE categoria (
     codicecategoria CHAR(5) NOT NULL,
     descrizione VARCHAR(255) NOT NULL,
     CONSTRAINT idcategoria PRIMARY KEY (codicecategoria)
);

CREATE TABLE ingrediente (
     codiceingrediente CHAR(5) NOT NULL,
     nome VARCHAR(255) NOT NULL,
     sovrapprezzo DECIMAL(10, 2),
     giacenza INT NOT NULL,
     CONSTRAINT idingrediente PRIMARY KEY (codiceingrediente)
);

CREATE TABLE notifica (
     codicenotifica CHAR(5) NOT NULL,
     titolo VARCHAR(255) NOT NULL,
     testo TEXT NOT NULL,
     vista BOOLEAN NOT NULL,
     data DATE NOT NULL,
     ora TIME NOT NULL,
	 tipo ENUM('ordine', 'prodotto', 'ingrediente') NOT NULL,     
     username VARCHAR(255) NOT NULL,
     codiceprodotto CHAR(5),
     codiceingrediente CHAR(5),
     codiceordine CHAR(5),
     CONSTRAINT idnotifica PRIMARY KEY (codicenotifica)
);

CREATE TABLE ordine (
     codiceordine CHAR(5) NOT NULL,
     data DATE NOT NULL,
     ora TIME NOT NULL,
     username VARCHAR(255) NOT NULL,
     CONSTRAINT idordine_id PRIMARY KEY (codiceordine)
);

CREATE TABLE personalizzazione (
     codicepersonalizzazione CHAR(5) NOT NULL,
     prezzo DECIMAL(10, 2) NOT NULL,
     quantita INT NOT NULL,
     codiceordine CHAR(5) NOT NULL,
     codiceprodotto CHAR(5) NOT NULL,
     CONSTRAINT idpersonalizzazione_id PRIMARY KEY (codicepersonalizzazione)
);

CREATE TABLE prodotto (
     codiceprodotto CHAR(5) NOT NULL,
     nome VARCHAR(255) NOT NULL,
     prezzo DECIMAL(10, 2) NOT NULL,
     disponibilita INT NOT NULL,
     codicecategoria CHAR(5) NOT NULL,
     CONSTRAINT idprodotto PRIMARY KEY (codiceprodotto)
);

CREATE TABLE carrello_prodotti (
     codiceprodotto CHAR(5) NOT NULL,
     codiceordine CHAR(5) NOT NULL,
     quantita INT NOT NULL,
     CONSTRAINT idcarrelloprodotti PRIMARY KEY (codiceordine, codiceprodotto)
);

CREATE TABLE composizione (
     codiceprodotto CHAR(5) NOT NULL,
     codiceingrediente CHAR(5) NOT NULL,
     quantita INT NOT NULL,
     CONSTRAINT idcomposizione PRIMARY KEY (codiceprodotto, codiceingrediente)
);

CREATE TABLE modifica_stato (
     descrizione VARCHAR(255) NOT NULL,
     codiceordine CHAR(5) NOT NULL,
     data DATE NOT NULL,
     orario TIME NOT NULL,
     CONSTRAINT idmodificastato PRIMARY KEY (codiceordine, descrizione)
);

CREATE TABLE modifica_ingrediente (
     codicepersonalizzazione CHAR(5) NOT NULL,
     codiceingrediente CHAR(5) NOT NULL,
     azione ENUM('aggiunto', 'rimosso') NOT NULL,
     CONSTRAINT idmodifica PRIMARY KEY (codicepersonalizzazione, codiceingrediente)
);

CREATE TABLE recensione (
     codicerecensione CHAR(5) NOT NULL,
     codiceordine CHAR(5) NOT NULL,
     titolo VARCHAR(255) NOT NULL,
	 voto INT NOT NULL CHECK (voto BETWEEN 1 AND 5),
     commento TEXT,
     CONSTRAINT idrecensione PRIMARY KEY (codicerecensione),
     CONSTRAINT fkriguardo_id UNIQUE (codiceordine)
);

CREATE TABLE stato_ordine (
     descrizione VARCHAR(255) NOT NULL,
     CONSTRAINT idstato_ordine PRIMARY KEY (descrizione)
);

CREATE TABLE utente (
     nome VARCHAR(255) NOT NULL,
     cognome VARCHAR(255) NOT NULL,
     username VARCHAR(255) NOT NULL,
     password VARCHAR(255) NOT NULL,
     tipo ENUM('cliente', 'venditore') NOT NULL,
     CONSTRAINT idutente PRIMARY KEY (username)
);

-- Constraints Section
-- ___________________ 

ALTER TABLE notifica 
ADD CONSTRAINT fkrelativa 
FOREIGN KEY (username) 
REFERENCES utente (username);

ALTER TABLE notifica 
ADD CONSTRAINT fknotifica_prodotto 
FOREIGN KEY (codiceprodotto) 
REFERENCES prodotto (codiceprodotto);

ALTER TABLE notifica 
ADD CONSTRAINT fknotifica_ingrediente 
FOREIGN KEY (codiceingrediente) 
REFERENCES ingrediente (codiceingrediente);

ALTER TABLE notifica 
ADD CONSTRAINT fknotifica_ordine 
FOREIGN KEY (codiceordine) 
REFERENCES ordine (codiceordine);

ALTER TABLE ordine 
ADD CONSTRAINT fkr 
FOREIGN KEY (username) 
REFERENCES utente (username);

ALTER TABLE personalizzazione 
ADD CONSTRAINT fkcarrello_personalizzazione 
FOREIGN KEY (codiceordine) 
REFERENCES ordine (codiceordine);

ALTER TABLE personalizzazione 
ADD CONSTRAINT fksu 
FOREIGN KEY (codiceprodotto) 
REFERENCES prodotto (codiceprodotto);

ALTER TABLE prodotto 
ADD CONSTRAINT fkappartenenza 
FOREIGN KEY (codicecategoria) 
REFERENCES categoria (codicecategoria);

ALTER TABLE carrello_prodotti 
ADD CONSTRAINT fkcar_ord 
FOREIGN KEY (codiceordine) 
REFERENCES ordine (codiceordine);

ALTER TABLE carrello_prodotti 
ADD CONSTRAINT fkcar_pro 
FOREIGN KEY (codiceprodotto) 
REFERENCES prodotto (codiceprodotto);

ALTER TABLE composizione 
ADD CONSTRAINT fkcom_ing 
FOREIGN KEY (codiceingrediente) 
REFERENCES ingrediente (codiceingrediente);

ALTER TABLE composizione 
ADD CONSTRAINT fkcom_pro 
FOREIGN KEY (codiceprodotto) 
REFERENCES prodotto (codiceprodotto);

ALTER TABLE modifica_stato 
ADD CONSTRAINT fkdi_ord 
FOREIGN KEY (codiceordine) 
REFERENCES ordine (codiceordine);

ALTER TABLE modifica_stato 
ADD CONSTRAINT fkdi_sta 
FOREIGN KEY (descrizione) 
REFERENCES stato_ordine (descrizione);

ALTER TABLE modifica_ingrediente 
ADD CONSTRAINT fkmod_ing 
FOREIGN KEY (codiceingrediente) 
REFERENCES ingrediente (codiceingrediente);

ALTER TABLE modifica_ingrediente 
ADD CONSTRAINT fkmod_per 
FOREIGN KEY (codicepersonalizzazione) 
REFERENCES personalizzazione (codicepersonalizzazione);

ALTER TABLE recensione 
ADD CONSTRAINT fkriguardo_fk 
FOREIGN KEY (codiceordine) 
REFERENCES ordine (codiceordine);

-- Index Section
-- _____________ 

CREATE INDEX idx_notifica_username ON notifica (username);
CREATE INDEX idx_notifica_codiceprodotto ON notifica (codiceprodotto);
CREATE INDEX idx_notifica_codiceingrediente ON notifica (codiceingrediente);
CREATE INDEX idx_notifica_codiceordine ON notifica (codiceordine);
CREATE INDEX idx_ordine_username ON ordine (username);
CREATE INDEX idx_personalizzazione_codiceordine ON personalizzazione (codiceordine);
CREATE INDEX idx_personalizzazione_codiceprodotto ON personalizzazione (codiceprodotto);
CREATE INDEX idx_prodotto_codicecategoria ON prodotto (codicecategoria);
CREATE INDEX idx_carrelloprodotti_codiceordine ON carrello_prodotti (codiceordine);
CREATE INDEX idx_carrelloprodotti_codiceprodotto ON carrello_prodotti (codiceprodotto);
CREATE INDEX idx_composizione_codiceprodotto ON composizione (codiceprodotto);
CREATE INDEX idx_composizione_codiceingrediente ON composizione (codiceingrediente);
CREATE INDEX idx_modificastato_codiceordine ON modifica_stato (codiceordine);
CREATE INDEX idx_modificastato_descrizione ON modifica_stato (descrizione);
CREATE INDEX idx_modificaingrediente_codicepersonalizzazione ON modifica_ingrediente (codicepersonalizzazione);
CREATE INDEX idx_modificaingrediente_codiceingrediente ON modifica_ingrediente (codiceingrediente);
CREATE INDEX idx_recensione_codiceordine ON recensione (codiceordine);