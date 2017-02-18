$('#js-user-form').submit(function(event) {
    event.preventDefault();
    // console.log(event.target.username.value)
    // console.log($('.username').val())

    let obj = {
        username: event.target.username.value,
        password: event.target.password.value
    }
    //clear form fields
    $('input, textarea').val('');
    // $('#password, textarea').val('');

    $.ajax({
        type: 'POST',
        data: JSON.stringify(obj),
        url: 'http://localhost:8080/users',
        contentType: "application/json",
        dataType: "json",
        success: function(data) {
            console.log(data, "User added!");
        }
    }).fail(function(err) {
        console.log(err)
    // alert( err.responseJSON.message );
    });
});
