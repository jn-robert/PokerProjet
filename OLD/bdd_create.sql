

DROP TABLE IF EXISTS Score;
DROP TABLE IF EXISTS Tour;
DROP TABLE IF EXISTS Partie;
DROP TABLE IF EXISTS Bourse;
DROP TABLE IF EXISTS Joueur;



CREATE TABLE Joueur (
	idJoueur INT AUTO_INCREMENT,
	Nom varchar(25),
	Prenom varchar(25),
	Pseudo varchar(25),
	primary key(idJoueur)
);

CREATE TABLE Bourse (
	idBourse int AUTO_INCREMENT,
	qte_Jeton int,
	primary key(idBourse),
	foreign key (idSalle) REFERENCES SALLE(idSalle)

);

CREATE TABLE Partie (
	idPartie int AUTO_INCREMENT,
	TypePartie varchar(25),
	primary key(idPartie)
);

CREATE TABLE Tour (
	idTour int AUTO_INCREMENT,
	nb_Joueur int,
	mise_pariee int,
	primary key(idTour)
	);

CREATE TABLE Score (
	idScore int AUTO_INCREMENT,
	score int,
	primary key(idScore)
);


select * from Joueur;
select * from Bourse;
select * from Partie;
select * from Tour;
select * from Score;
