var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
function get(url, fnsucc, fnfail) {
    var ajax = new XMLHttpRequest();
    ajax.open("GET", url, true);
    ajax.send();

    ajax.onreadystatechange = function () {
        if(ajax.readyState === 4) {
            if(ajax.readyState === 200) {
                fnsucc(ajax.responseText);
            }else {
                if(fnfail) {
                    fnfail();
                }
            }
        }    
    }
}

module.exports = get;

