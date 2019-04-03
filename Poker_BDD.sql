DROP TABLE IF EXISTS classement;
DROP TABLE IF EXISTS action;
DROP TABLE IF EXISTS player;
DROP TABLE IF EXISTS partie;

CREATE TABLE player (
	idPlayer INT AUTO_INCREMENT,
	nom VARCHAR(20),
	prenom VARCHAR(20),
	pseudo VARCHAR(15),
	password VARCHAR(20),
	dateInscription DATE,
	jetons INT,
	PRIMARY KEY(idPlayer)
);

CREATE TABLE partie (
	idPartie INT AUTO_INCREMENT,
	typePartie VARCHAR(20),
	nbTour INT,
	nbJoueur INT,
	PRIMARY KEY(idPartie)
);

CREATE TABLE action (
	idPlayer INT,
	nbAllIn INT,
	nbCheck INT,
	nbFold INT,
	nbRaise INT,
	nbSuivre INT,
	PRIMARY KEY(idPlayer),
	CONSTRAINT fkActionPlayer FOREIGN KEY (idPlayer) REFERENCES player(idPlayer)
);

INSERT INTO `player` (`idPlayer`, `nom`, `prenom`, `pseudo`, `password`, `dateInscription`, `jetons`) VALUES (NULL, 'j1Name', 'j1', 'Joueur1', '0000', '2019-03-01', '100'), (NULL, 'j2Name', 'j2', 'Joueur2', '0000', '2019-03-01', '5000');
INSERT INTO `partie` (`idPartie`, `typePartie`, `nbTour`, `nbJoueur`) VALUES (NULL, 'normal', '0', '1');
INSERT INTO `action` (`idPlayer`, `nbAllIn`, `nbCheck`, `nbFold`, `nbRaise`, `nbSuivre`) VALUES ('1', '12', '16', '117', '14', '14'), ('2', '3', '3', '3', '3', '14');


