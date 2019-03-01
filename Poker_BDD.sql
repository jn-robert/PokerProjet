DROP TABLE IF EXISTS Player;
DROP TABLE IF EXISTS Partie;
DROP TABLE IF EXISTS Classement;
DROP TABLE IF EXISTS Mise;
DROP TABLE IF EXISTS Gain;
DROP TABLE IF EXISTS Action;

CREATE TABLE Player (
	idPlayer INT AUTO_INCREMENT,
	nom VARCHAR(20),
	prenom VARCHAR(20),
	pseudo VARCHAR(15),
	password VARCHAR(20),
	dateInscription DATE,
	jetons INT,
	PRIMARY KEY(idPlayer)
);

CREATE TABLE Partie (
	idPartie INT AUTO_INCREMENT,
	typePartie VARCHAR(20),
	nbTour INT,
	nbJoueur INT,
	PRIMARY KEY(idPartie)
);

CREATE TABLE Classement (
	idPartie INT,
	idPlayer INT,
	class INT,
	PRIMARY KEY(idPartie, idPlayer),
	CONSTRAINT fkClassPartie FOREIGN KEY (idPartie) REFERENCES Partie(idPartie),
	CONSTRAINT fkClassPlayer FOREIGN KEY (idPlayer) REFERENCES Player(idPlayer)
);

CREATE TABLE Mise (
	idPlayer INT,
	idPartie INT,
	mise INT,
	PRIMARY KEY(idPlayer, idPartie),
	CONSTRAINT fkMisePlayer FOREIGN KEY (idPlayer) REFERENCES Player(idPlayer),
	CONSTRAINT fkMisePartie FOREIGN KEY (idPartie) REFERENCES Partie(idPartie)
);

CREATE TABLE Gain (
	idPartie INT,
	idPlayer INT,
	gain INT,
	PRIMARY KEY(idPlayer, idPartie),
	CONSTRAINT fkMisePlayer FOREIGN KEY (idPlayer) REFERENCES Player(idPlayer),
	CONSTRAINT fkMisePartie FOREIGN KEY (idPartie) REFERENCES Partie(idPartie)
);

CREATE TABLE Action (
	idPartie INT,
	idPlayer INT,
	nbAllIn INT,
	nbCheck INT,
	nbFold INT,
	nbRaise INT,
	PRIMARY KEY(idPlayer, idPartie),
	CONSTRAINT fkMisePlayer FOREIGN KEY (idPlayer) REFERENCES Player(idPlayer),
	CONSTRAINT fkMisePartie FOREIGN KEY (idPartie) REFERENCES Partie(idPartie)
);