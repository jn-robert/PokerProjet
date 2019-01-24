function traceStats() {
    new Morris.Line({
        // ID of the element in which to draw the chart.
        element: 'statsPartie',
        // Chart data records -- each entry in this array corresponds to a point on
        // the chart.
        data: [
            { year: '2008', value: 20 },
            { year: '2009', value: 30 },
            { year: '2010', value: 60 },
            { year: '2011', value: 40 },
            { year: '2012', value: 100 }
        ],
        // The name of the data record attribute that contains x-values.
        xkey: 'year',
        // A list of names of data record attributes that contain y-values.
        ykeys: ['value'],
        // Labels for the ykeys -- will be displayed when you hover over the
        // chart.
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
