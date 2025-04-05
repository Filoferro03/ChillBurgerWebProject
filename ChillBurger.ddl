-- *********************************************
-- * SQL MySQL generation                      
-- *--------------------------------------------
-- * DB-MAIN version: 11.0.2              
-- * Generator date: Sep 14 2021              
-- * Generation date: Sat Apr  5 11:34:23 2025 
-- * LUN file: C:\Users\Proprietario\Desktop\ChillBurger.lun 
-- * Schema: ChillBurgerDBLogico/1 
-- ********************************************* 

-- Database Section
-- ________________ 

CREATE DATABASE IF NOT EXISTS ChillBurgerDBLogico;
USE ChillBurgerDBLogico;

-- Tables Section
-- _____________ 

CREATE TABLE CATEGORIA (
     CodiceCategoria CHAR(1) NOT NULL,
     Descrizione VARCHAR(255) NOT NULL,
     CONSTRAINT IDCATEGORIA PRIMARY KEY (CodiceCategoria)
);

CREATE TABLE INGREDIENTE (
     CodiceIngrediente CHAR(1) NOT NULL,
     Nome VARCHAR(255) NOT NULL,
     Sovrapprezzo DECIMAL(10, 2),
     Giacenza INT NOT NULL,
     CONSTRAINT IDINGREDIENTE PRIMARY KEY (CodiceIngrediente)
);

CREATE TABLE NOTIFICA (
     CodiceNotifica CHAR(1) NOT NULL,
     Titolo VARCHAR(255) NOT NULL,
     Testo TEXT NOT NULL,
     Vista BOOLEAN NOT NULL,
     Data DATE NOT NULL,
     Ora TIME NOT NULL,
     Tipo VARCHAR(50) NOT NULL,
     Username VARCHAR(255) NOT NULL,
     CodiceProdotto CHAR(1),
     CodiceIngrediente CHAR(1),
     CodiceOrdine CHAR(1),
     CONSTRAINT IDNOTIFICA PRIMARY KEY (CodiceNotifica)
);

CREATE TABLE ORDINE (
     CodiceOrdine CHAR(1) NOT NULL,
     Data DATE NOT NULL,
     Ora TIME NOT NULL,
     Username VARCHAR(255) NOT NULL,
     CONSTRAINT IDORDINE_ID PRIMARY KEY (CodiceOrdine)
);

CREATE TABLE PERSONALIZZAZIONE (
     CodicePersonalizzazione CHAR(1) NOT NULL,
     Prezzo DECIMAL(10, 2) NOT NULL,
     Quantita INT NOT NULL,
     CodiceOrdine CHAR(1) NOT NULL,
     CodiceProdotto CHAR(1) NOT NULL,
     CONSTRAINT IDPERSONALIZZAZIONE_ID PRIMARY KEY (CodicePersonalizzazione)
);

CREATE TABLE PRODOTTO (
     CodiceProdotto CHAR(1) NOT NULL,
     Nome VARCHAR(255) NOT NULL,
     Prezzo DECIMAL(10, 2) NOT NULL,
     Disponibilita BOOLEAN,
     CodiceCategoria CHAR(1) NOT NULL,
     CONSTRAINT IDPRODOTTO PRIMARY KEY (CodiceProdotto)
);

CREATE TABLE CARRELLO_PRODOTTI (
     CodiceProdotto CHAR(1) NOT NULL,
     CodiceOrdine CHAR(1) NOT NULL,
     Quantita INT NOT NULL,
     CONSTRAINT IDCarrelloProdotti PRIMARY KEY (CodiceOrdine, CodiceProdotto)
);

CREATE TABLE Composizione (
     CodiceProdotto CHAR(1) NOT NULL,
     CodiceIngrediente CHAR(1) NOT NULL,
     Quantita INT NOT NULL,
     CONSTRAINT IDComposizione PRIMARY KEY (CodiceProdotto, CodiceIngrediente)
);

CREATE TABLE MODIFICA_STATO (
     Descrizione VARCHAR(255) NOT NULL,
     CodiceOrdine CHAR(1) NOT NULL,
     Data DATE NOT NULL,
     Orario TIME NOT NULL,
     CONSTRAINT IDMODIFICASTATO PRIMARY KEY (CodiceOrdine, Descrizione)
);

CREATE TABLE MODIFICA_INGREDIENTE (
     CodicePersonalizzazione CHAR(1) NOT NULL,
     CodiceIngrediente CHAR(1) NOT NULL,
     Azione VARCHAR(50) NOT NULL,
     CONSTRAINT IDModifica PRIMARY KEY (CodicePersonalizzazione, CodiceIngrediente)
);

CREATE TABLE RECENSIONE (
     CodiceRecensione CHAR(1) NOT NULL,
     CodiceOrdine CHAR(1) NOT NULL,
     Titolo VARCHAR(255) NOT NULL,
     Voto INT NOT NULL,
     Commento TEXT,
     CONSTRAINT IDRECENSIONE PRIMARY KEY (CodiceRecensione),
     CONSTRAINT FKRiguardo_ID UNIQUE (CodiceOrdine)
);

CREATE TABLE STATO_ORDINE (
     Descrizione VARCHAR(255) NOT NULL,
     CONSTRAINT IDSTATO_ORDINE PRIMARY KEY (Descrizione)
);

CREATE TABLE UTENTE (
     Nome VARCHAR(255) NOT NULL,
     Cognome VARCHAR(255) NOT NULL,
     Username VARCHAR(255) NOT NULL,
     Password VARCHAR(255) NOT NULL,
     Tipo VARCHAR(50) NOT NULL,
     CONSTRAINT IDUTENTE PRIMARY KEY (Username)
);

-- Constraints Section
-- ___________________ 

ALTER TABLE NOTIFICA 
ADD CONSTRAINT FKRelativa 
FOREIGN KEY (Username) 
REFERENCES UTENTE (Username);

ALTER TABLE NOTIFICA 
ADD CONSTRAINT FKNotifica_Prodotto 
FOREIGN KEY (CodiceProdotto) 
REFERENCES PRODOTTO (CodiceProdotto);

ALTER TABLE NOTIFICA 
ADD CONSTRAINT FKNotifica_Ingrediente 
FOREIGN KEY (CodiceIngrediente) 
REFERENCES INGREDIENTE (CodiceIngrediente);

ALTER TABLE NOTIFICA 
ADD CONSTRAINT FKNotifica_Ordine 
FOREIGN KEY (CodiceOrdine) 
REFERENCES ORDINE (CodiceOrdine);

ALTER TABLE ORDINE 
ADD CONSTRAINT FKR 
FOREIGN KEY (Username) 
REFERENCES UTENTE (Username);

ALTER TABLE PERSONALIZZAZIONE 
ADD CONSTRAINT FKCarrello_Personalizzazione 
FOREIGN KEY (CodiceOrdine) 
REFERENCES ORDINE (CodiceOrdine);

ALTER TABLE PERSONALIZZAZIONE 
ADD CONSTRAINT FKSu 
FOREIGN KEY (CodiceProdotto) 
REFERENCES PRODOTTO (CodiceProdotto);

ALTER TABLE PRODOTTO 
ADD CONSTRAINT FKAppartenenza 
FOREIGN KEY (CodiceCategoria) 
REFERENCES CATEGORIA (CodiceCategoria);

ALTER TABLE CARRELLO_PRODOTTI 
ADD CONSTRAINT FKCar_ORD 
FOREIGN KEY (CodiceOrdine) 
REFERENCES ORDINE (CodiceOrdine);

ALTER TABLE CARRELLO_PRODOTTI 
ADD CONSTRAINT FKCar_PRO 
FOREIGN KEY (CodiceProdotto) 
REFERENCES PRODOTTO (CodiceProdotto);

ALTER TABLE Composizione 
ADD CONSTRAINT FKCom_ING 
FOREIGN KEY (CodiceIngrediente) 
REFERENCES INGREDIENTE (CodiceIngrediente);

ALTER TABLE Composizione 
ADD CONSTRAINT FKCom_PRO 
FOREIGN KEY (CodiceProdotto) 
REFERENCES PRODOTTO (CodiceProdotto);

ALTER TABLE MODIFICA_STATO 
ADD CONSTRAINT FKDi_ORD 
FOREIGN KEY (CodiceOrdine) 
REFERENCES ORDINE (CodiceOrdine);

ALTER TABLE MODIFICA_STATO 
ADD CONSTRAINT FKDi_STA 
FOREIGN KEY (Descrizione) 
REFERENCES STATO_ORDINE (Descrizione);

ALTER TABLE MODIFICA_INGREDIENTE 
ADD CONSTRAINT FKMod_ING 
FOREIGN KEY (CodiceIngrediente) 
REFERENCES INGREDIENTE (CodiceIngrediente);

ALTER TABLE MODIFICA_INGREDIENTE 
ADD CONSTRAINT FKMod_PER 
FOREIGN KEY (CodicePersonalizzazione) 
REFERENCES PERSONALIZZAZIONE (CodicePersonalizzazione);

ALTER TABLE RECENSIONE 
ADD CONSTRAINT FKRiguardo_FK 
FOREIGN KEY (CodiceOrdine) 
REFERENCES ORDINE (CodiceOrdine);

-- Index Section
-- _____________ 

CREATE INDEX IDX_Notifica_Username ON NOTIFICA (Username);
CREATE INDEX IDX_Notifica_CodiceProdotto ON NOTIFICA (CodiceProdotto);
CREATE INDEX IDX_Notifica_CodiceIngrediente ON NOTIFICA (CodiceIngrediente);
CREATE INDEX IDX_Notifica_CodiceOrdine ON NOTIFICA (CodiceOrdine);
CREATE INDEX IDX_Ordine_Username ON ORDINE (Username);
CREATE INDEX IDX_Personalizzazione_CodiceOrdine ON PERSONALIZZAZIONE (CodiceOrdine);
CREATE INDEX IDX_Personalizzazione_CodiceProdotto ON PERSONALIZZAZIONE (CodiceProdotto);
CREATE INDEX IDX_Prodotto_CodiceCategoria ON PRODOTTO (CodiceCategoria);
CREATE INDEX IDX_CarroProdotto_CodiceOrdine ON CARRELLO_PRODOTTI (CodiceOrdine);
CREATE INDEX IDX_CarroProdotto_CodiceProdotto ON CARRELLO_PRODOTTI (CodiceProdotto);
CREATE INDEX IDX_Composizione_CodiceProdotto ON Composizione (CodiceProdotto);
CREATE INDEX IDX_Composizione_CodiceIngrediente ON Composizione (CodiceIngrediente);
CREATE INDEX IDX_ModificaStato_CodiceOrdine ON MODIFICA_STATO (CodiceOrdine);
CREATE INDEX IDX_ModificaStato_Descrizione ON MODIFICA_STATO (Descrizione);
CREATE INDEX IDX_ModificaIngrediente_CodicePersonalizzazione ON MODIFICA_INGREDIENTE (CodicePersonalizzazione);
CREATE INDEX IDX_ModificaIngrediente_CodiceIngrediente ON MODIFICA_INGREDIENTE (CodiceIngrediente);
CREATE INDEX IDX_Recensione_CodiceOrdine ON RECENSIONE (CodiceOrdine);