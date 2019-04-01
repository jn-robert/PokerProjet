function initialisation() {
    if(getCookie("userCookie") == null){
        begin();
    }
    else{
        document.getElementsByClassName("BeforeGame")[0].style.display = "block";
        document.getElementsByClassName("Game")[0].style.display = "block";
        document.getElementById("tablejoinpart").style.display = "block";
        document.getElementsByClassName("needLoged")[0].style.display = "none";
        init();
    }
}

function logout(){
    deleteCookie("userCookie");
    window.location.href = "home.html";
}

function nav(){
    console.log(getCookie("userCookie"));
    if(getCookie("userCookie") == null){
        document.getElementsByClassName("navConnected")[0].style.display = "none";
        document.getElementsByClassName("navNoConnected")[0].style.display = "block";
    }
    else{
        document.getElementsByClassName("navNoConnected")[0].style.display = "none";
        document.getElementsByClassName("navConnected")[0].style.display = "block";
        document.getElementById("navMessage").innerText = "User : "  + getCookie("userCookie")+" ";
        document.getElementById("navMessage").style.color = "white";



    }
}


function begin() {
    document.getElementsByClassName("BeforeGame")[0].style.display = "none";
    document.getElementsByClassName("Game")[0].style.display = "none";
    document.getElementById("tablejoinpart").style.display = "none";
    document.getElementsByClassName("needLoged")[0].style.display = "block";
}


function clear() {
    document.getElementsByClassName("navConnected")[0].style.display = "none";
    document.getElementsByClassName("navNoConnected")[0].style.display = "none";
    document.getElementsByClassName("home")[0].style.display = "none";
}


