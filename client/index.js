$(document).ready(function(){
  //form shouldn't have autosubmit
  $('form').on('submit', function(e){
    e.preventDefault();
    $('.notrung').click();
  });

  //doorbell object for namespacing
  //doorbell.data takes care of contact info
  var doorbell = {};
  doorbell.data = {};

  //used to update status messages
  doorbell.$message= $('#message');

  //     Registering click events      //
  $('.notrung').find('img').on('click', function(){
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


  $('.rung').find('img').on('click', function(){
    doorbell.cancel();
  });

  $('.leave').find('img').on('click', function(){
    doorbell.leave();
  });

  //To reset back to base 
  doorbell.default = function(){
   $('.notrung').removeClass('hide');
   $('.rung').addClass('hide');
   $('.whosthere').removeClass('hide');
   $('.leave').addClass('hide');
   $('form').removeClass('hide');
   doorbell.rung = false;
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
    $images.find('.notrung').addClass('hide');
    $images.find('.rung').removeClass('hide');
    $images.find('.leave').removeClass('hide');
    $('form').addClass('hide');

    doorbell.$message.text('Contact info sent, cancel doorbell if you get in');
  };

  doorbell.failure = function(){
    doorbell.$message.text('Shoot, something went wrong. Try again in a sec');
    doorbell.rung = false;
    doorbell.default();
  };

  doorbell.cancelled = function(){
    var $imgs = $('div.images')
    $imgs.find('.rung').addClass('hide');
  }

  doorbell.cancel = function(){
    $.ajax({
      method: "POST",
      url: '/unring',
      data: doorbell.data,
      success: function(){
        doorbell.$message.text('You successfully cancelled your ring');
        doorbell.cancelled();
      },
      error: function(){
        doorbell.failure();
      }
    });
    doorbell.default();
  }

  doorbell.whosthere = function(){
    $.ajax({
      method: 'GET', 
      url:    '/whosthere',
      contentType: 'application/JSON',
      success: function(data){
        data = JSON.parse(data);
        if (!data.length){
          $('#people').html("<h3>People Here</h3>NOBODY");
        } else {
          var message = '<h3>People Here</h3><ul>'
          for (var i = 0; i < data.length; i++){
            message+='<li>' + data[i] + '</li>';
          }
          message+='<ul>';
          $('#people').html(message);
          //checks again a minute in the future
          setTimeout(doorbell.whosthere, 60000);
        }
      },
      error: function(){ 
        setTimeout(function(){
          doorbell.whosthere();
      }, 5000)}
    });
  }

  //Populates list of peeps
  doorbell.whosthere();
});

// / - website
// /ring - post
// /unring - post
// /leave - post
// /whosthere - get