
function initialisation(){
    document.getElementsByClassName("login")[0].style.display = "none";
    document.getElementsByClassName("register")[0].style.display = "none";
    document.getElementsByClassName("home")[0].style.display = "block";
}


function begin(){
    document.getElementsByClassName("BeforeGame")[0].style.display = "none";
    document.getElementsByClassName("Game")[0].style.display = "none";
}

function showLogin(){
    clear();
    document.getElementsByClassName("login")[0].style.display = "block";
}

function showRegister(){
    clear();
    document.getElementsByClassName("register")[0].style.display = "block";
}

function clear(){
    document.getElementsByClassName("login")[0].style.display = "none";
    document.getElementsByClassName("register")[0].style.display = "none";
    document.getElementsByClassName("home")[0].style.display = "none";
}


$(document).ready(function () {
    $(document).ready(function () {
        $('#loginFormulaire').submit(function (e) {
            e.preventDefault();

            var nom = $("#name").val();
            var pass = $("#password").val();

            if (nom != "" && pass != "") {

                $.ajax({
                    type: "POST",
                    url: '/login.php',
                    data: {
                        name: nom,
                        password: pass
                    },
                    success: function (response) {
                        var reponse = $.trim(response)
                        console.log(response);
                        if (reponse === "success") {
                        }
                        else {
                            alert("Wrong Details");
                        }
                    }
                });
            }
            else {
                alert("Please Fill All The Details");
            }
            return false;
        });
    });
});

/*
$(document).ready(function() {
    $("#add_row").on("click", function() {
        // Dynamic Rows Code

        // Get max row id and set new id
        var newid = 0;
        $.each($("#tab_logic tr"), function() {
            if (parseInt($(this).data("id")) > newid) {
                newid = parseInt($(this).data("id"));
            }
        });
        newid++;

        var tr = $("<tr></tr>", {
            id: "addr"+newid,
            "data-id": newid
        });

        // loop through each td and create new elements with name of newid
        $.each($("#tab_logic tbody tr:nth(0) td"), function() {
            var cur_td = $(this);

            var children = cur_td.children();

            // add new td and element if it has a nane
            if ($(this).data("name") != undefined) {
                var td = $("<td></td>", {
                    "data-name": $(cur_td).data("name")
                });

                var c = $(cur_td).find($(children[0]).prop('tagName')).clone().val("");
                c.attr("name", $(cur_td).data("name") + newid);
                c.appendTo($(td));
                td.appendTo($(tr));
            } else {
                var td = $("<td></td>", {
                    'text': $('#tab_logic tr').length
                }).appendTo($(tr));
            }
        });

        // add delete button and td
        *//*
        $("<td></td>").append(
            $("<button class='btn btn-danger glyphicon glyphicon-remove row-remove'></button>")
                .click(function() {
                    $(this).closest("tr").remove();
                })
        ).appendTo($(tr));
        *//*

        // add the new row
        $(tr).appendTo($('#tab_logic'));

        $(tr).find("td button.row-remove").on("click", function() {
             $(this).closest("tr").remove();
        });
});




    // Sortable Code
    var fixHelperModified = function(e, tr) {
        var $originals = tr.children();
        var $helper = tr.clone();

        $helper.children().each(function(index) {
            $(this).width($originals.eq(index).width())
        });

        return $helper;
    };

    $(".table-sortable tbody").sortable({
        helper: fixHelperModified
    }).disableSelection();

    $(".table-sortable thead").disableSelection();



    $("#add_row").trigger("click");
});



$(document).ready(function(){


    $("#submit").click(function{


        $.post(

            'connexion.php', // Un script PHP que l'on va créer juste après

            {

                username : $("#username").val(),  // Nous récupérons la valeur de nos inputs que l'on fait passer à connexion.php

                password : $("#password").val()

            },


            function(data){ // Cette fonction ne fait rien encore, nous la mettrons à jour plus tard

            },


            'text' // Nous souhaitons recevoir "Success" ou "Failed", donc on indique text !

         );


    });


});*/

