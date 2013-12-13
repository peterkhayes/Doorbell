$(document).ready(function(){
  //form shouldn't have autosubmit
  $('form').on('submit', function(e){
    e.preventDefault();
    $('.notrung').click();
  });

  var doorbell = {};
  doorbell.data = {};
  doorbell.$message= $('#message');

  //     Registering click events      //
  $('.notrung').on('click', function(){
    if (!doorbell.rung){
      doorbell.rung = true;
      var $form = $('form');
      var email = $form.find('.email').text();
      var name  = $form.find('.name').text();

      doorbell.data = JSON.stringify({email: email, name: name});

      //email must satisfy basic regex, and name must be 2 letters or longer
      if (doorbell.checkEmail(email) && name.length - 1){
        doorbell.ring(email, name);
      }
      else {
        doorbell.$message.text('Knock knock, who\'s there?');
      }
    } else {
      doorbell.$message.text('Hold your horses, one click is good');
    }
  });

  $('.whosthere').on('click', function(){
    doorbell.$message.text('');
    doorbell.whosthere();
  });

  $('.rung').on('click', function(){
    doorbell.cancel();
  });

  $('.leave').on('click', function(){
    doorbell.leave();
  });

  doorbell.default = function(){
   $('.unrung').removeClass('hide');
   $('.rung').addClass('hide');
   $('.whosthere').removeClass('hide');
   $('.leave').addClass('hide');
  };


  doorbell.checkEmail = function(email){
    if ( email.match(/.+\@.+\..+/) ){
      return true;
    } else {
      return false;
    }
  };

  doorbell.leave = function(){
    $.ajax({
      method: "POST",
      url: '/leave',
      data: doorbell.data,
      success: function(){
        doorbell.default();
      },
      error: function(){
        doorbell.failure();
      },
    })
  }

  doorbell.ring = function(email, name){
    var data = {email: email, name: name};
    data = JSON.stringify(data);
    $.ajax({
      method: "POST", 
      url: '/ring',
      data: data,
      success: function(){ doorbell.success(); },
      error: function(){ doorbell.failure(); }
    })
  };

  doorbell.success = function(){
    var $images = $('.images');
    $images.find('.icon').toggleClass('hide');

    //Keep this option available so that they can hassle people 
    //who haven't come to the door
    $images.find('.whosthere').removeClass('hide');

    //Hide the form
    $('form').addClass('hide');
    doorbell.$message.text('Email sent, cancel doorbell if you get in');
  };

  doorbell.failure = function(){
    doorbell.$message.text('Shoot, something went wrong. Try again in a sec');
    doorbell.rung = false;
  };

  doorbell.cancel = function(){
    $.ajax({
      method: "POST",
      url: '/unring',
      data: doorbell.data,
      success: function(){
        doorbell.$message.text('You successfully canceled your ring');
        doorbell.success();
      },
      error: function(){
        doorbell.failure();
      }
    })
  }

  doorbell.whosthere = function(){
    $.ajax({
      method: 'GET', 
      url:    '/whosthere',
      contentType: 'application/JSON',
      success: function(data){
        if (!data.length){
          doorbell.$message.text('Nobody is signed in');
        } else {
          var message = '<ul>'
          data.forEach(function(name){
            message+= '<li>' + name + '</li>';
          });
        }
      },
      error: function(){ doorbell.failure() }
    });
  }
});

// / - website
// /ring - post
// /unring - post
// /leave - post
// /whosthere - get