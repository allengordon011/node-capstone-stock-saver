//stock API
const fetchAPI_URL = 'http://finance.google.com/finance/info?client=ig&q='

//event listeners
$('#js-signup-form').submit(function(event) {
    event.preventDefault();

    let obj = {
        username: event.target.username.value,
        password: event.target.password.value
    }

    //clear form fields
    $('input, textarea').val('');

    $.ajax({
        type: 'POST',
        data: JSON.stringify(obj),
        url: 'http://localhost:8080/signup',
        contentType: "application/json",
        dataType: "json"})
        .then(function(res) {
            console.log('RES: ', res)
            window.location='/stocksaver.html';
        })
        .fail(function(err) {
            console.log('AJAX FAIL')
            $('.alert.alert-warning').toggle(500).append('ERROR')
            window.location='/signup.html';
            console.log(err)
        })
});

$('#js-login-form').on('submit', function(event) {
    event.preventDefault();

    let obj = {
        username: event.target.username.value,
        password: event.target.password.value
    }

    //clear form fields
    $('.form-group').val('');

    $.ajax({
        type: 'POST',
        data: JSON.stringify(obj),
        url: 'http://localhost:8080/login',
        contentType: "application/json",
        dataType: "json"})
        .then(function(res) {
            console.log('RES: ', res)
            window.location='/stocksaver.html';
        })
        .fail(function(err) {
            console.log('AJAX FAIL')
            $('.alert.alert-warning').toggle(500).append('ERROR')
            window.location='/login.html';
            console.log(err);
        })
});

$('#js-logout').click(function(event) {
    event.preventDefault();
    $.ajax({
        type: 'GET',
        url: 'http://localhost:8080/logout'
    })
    .then(function(res) {
        console.log('User Logged Out')
        console.log('RES: ', res)
        window.location='/index.html';
    })
    .fail(function(err) {
        console.log('AJAX FAIL')
        $('.alert.alert-warning').toggle(500).append('ERROR')
        // window.location='/login.html';
        console.log(err);
    })
})

$('#search').submit(function(event) {
    event.preventDefault();
    let stock = event.target.stock.value;

    $.ajax({
        type: 'GET',
        url: fetchAPI_URL+stock
    })
    .then(function(res) {
        console.log('Stock price found')
        console.log('RES: ', res)
        // window.location='/index.html';
    })
    .fail(function(err) {
        console.log('AJAX FAIL')
        $('.alert.alert-warning').toggle(500).append('ERROR')
        // window.location='/login.html';
        console.log(err);
    });
})

$('.alert.alert-warning').toggle();
