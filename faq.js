$(document).ready(function () {
     $("input#sentence").keypress(function(event) {
        if (event.which == 13) {
            event.preventDefault();
            $("form#chat").submit();
        }
    });
    
    $("form#chat").submit(function () {
        return handleChat($("input#sentence").val());
    });
});
