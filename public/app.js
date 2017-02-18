$('#js-user-form').submit(function(event) {
    event.preventDefault();
    // console.log(event.target.username.value)

    let obj = {
        username: $('#username').val(),
        password: $('#password').val()
    }
    //clear form fields
    $('#username, textarea').val('');
    $('#password, textarea').val('');

    $.ajax({
        type: 'POST',
        data: JSON.stringify(obj),
        url: 'http://localhost:8080/users',
        contentType: "application/json",
        dataType: "json",
        success: function(data) {
            console.log("User added!");

        }
    }).fail(function(err) {
    alert( err.responseJSON.message );
    });
});
