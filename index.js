$(document).ready(function(){
  $('form').on('submit', function(e){
    e.preventDefault();
  });

  var doorbell = {};

  $('.doorbell ring').one('click', function(){
    if (!doorbell.rung){
      doorbell.rung = true;
      var $form = $('form');
      var email = $form.find('.email').text();
      var name  = $form.find('.name').text();

      //email must satisfy basic regex, and name must be 2 letters or longer
      if (doorbell.checkEmail(email) && name.length - 1){
        doorbell.ring(email, name);
      }
      else {
        $('#message').text('Knock knock, who\'s there?');
      }
    } else {
      $('#message').text('Hold your horses, one click is good');
    }
  });

  doorbell.checkEmail = function(email){
    if ( email.match(/.+\@.+\..+/) ){
      return true;
    } else {
      return false;
    }
  };

  doorbell.ring = function(email, name){
    var data = {email: email, name: name};
    data = JSON.stringify(data);
    $.ajax({
      method: "POST", 
      url: '/ring',
      data: data,
      success: doorbell.success,
      error: doorbell.failure
    })
  };

  doorbell.success = function(){
    var $images = $('.images');
    $images.find('.icon').toggleClass('hide');

    //Keep this option available so that they can hassle people 
    //who haven't come to the door
    $images.find('.whosthere').removeClass('hide');
    $('form').addClass('hide');
    $('#message').text('Email sent, cancel doorbell if you get in');
  }

  doorbell.failure = function(){
    $('#message').text('Shoot, something went wrong. Try again in a sec');
    doorbell.rung = false;
  }
});

// / - website
// /ring - post
// /unring - post
// /leave - post
// /whosthere - get