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
      var $form = $('form');

      //escaping is happening on the server. Come at me bro --Peter Hayes
      var contact = $form.find('.contact').val();
      var name  = $form.find('.name').val();


      //contact must satisfy basic regex, and name must be 2 letters or longer
      var contact = doorbell.checkContactInfo(contact);
      if (contact && name.length - 1){
        doorbell.data = {contact: contact, name: name};
        doorbell.rung = true;
        doorbell.ring(contact, name);
      } else {
        console.log('name and contact not ok...')
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


  doorbell.checkContactInfo = function(contact){
    if ( contact && contact.match(/.+\@.+\..+/) ){
      return contact;
    } else {
      contact = contact.replace(/[^\d]*/g, '', 'g');
      if (contact.length > 9){
         return contact;
      }
    }
    return false;
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

  doorbell.ring = function(contact, name){
    var data = {contact: contact, name: name};
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
    doorbell.$message.text('contact sent, cancel doorbell if you get in');
  };

  doorbell.failure = function(){
    doorbell.$message.text('Shoot, something went wrong. Try again in a sec');
    doorbell.rung = false;
    doorbell.default();
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
        data = JSON.parse(data);
        if (!data.length){
          doorbell.$message.text('Nobody is signed in');
        } else {
          var message = '<ul>'
          for (var i = 0; i < data.length; i++){
            message+='<li>' + data[i] + '</li>';
          }
          message+='<ul>';
          doorbell.$message.html(message);
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