function traceStats(pseudo) {
    resetStats();
    infoJoueur(pseudo);
    statsMise(pseudo);
    new Morris.Line({
        element: 'statsPartie',
        data: [
            { year: '2008', value: 20 },
            { year: '2009', value: 30 },
            { year: '2010', value: 60 },
            { year: '2011', value: 40 },
            { year: '2012', value: 100 }
        ],
        xkey: 'year',
        ykeys: ['value'],
        labels: ['Value']
    });

    Morris.Donut({
        element: 'statsVictoire',
        data: [
            {label: "Victoire", value: 12},
            {label: "Défaite", value: 30},
        ]
    });

    Morris.Donut({
        element: 'statsAction',
        data: [
            {label: "All-in", value: 12},
            {label: "Check", value: 30},
            {label: "Fold", value: 15},
            {label: "Raise", value: 8},
        ]
    });
}

function infoJoueur(pseudo) {
    var msg = "<table border='2'><tr><td>";
    msg += "Pseudo : "+pseudo+"<br>";
    msg += "Prenom : "+"<br>";
    msg += "Nom : "+"<br>";
    msg += "Date d'inscription : "+"<br>";
    msg += "Nombre de jetons : "+"<br>";
    msg += "</table></td></tr>";
    document.getElementById("infoJoueur").innerHTML = msg;
}

function statsMise(pseudo) {
    var miseMax = 0;
    var miseMoyenne = 0;
    var table = "<table border='2'><thead><tr><td>Mise moyenne</td><td>Mise max</td></tr></thead>";
    table += "<tbody><tr><td>"+miseMoyenne+"</td><td>"+miseMax+"</td></tr></tbody>";
    table += "</table>";
    document.getElementById("statsMise").innerHTML = table;
}

function resetStats() {
    document.getElementById("infoJoueur").innerHTML = "";
    document.getElementById("statsVictoire").innerHTML = "";
    document.getElementById("statsMise").innerHTML = "";
    document.getElementById("statsAction").innerHTML = "";
    document.getElementById("statsPartie").innerHTML = "";
}
