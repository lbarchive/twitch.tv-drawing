function message(text) {
  $('#message').text(text).show();
}

function draw() {
  var channel = $('#channel').val();
  var API = 'https://tmi.twitch.tv/group/user/' + channel + '/chatters?callback=?';

  if (!channel) {
    return;
  }

  var max_winners = parseInt($('#max-winners').val(), 10);
  if (isNaN(max_winners)) {
    message('Incorrect number of winners!');
    return
  }

  // The API call takes some time, if something happens, well, refresh the
  // page, don't want to add a timer.
  $('#btn-draw')[0].disabled = true;

  $.getJSON(API, function (data) {
    $('#btn-draw')[0].disabled = false;
    $('#message').text('').hide();

    if (data.status != 200) {
      message('Error ' + data.status);
      return;
    }
  
    data = data.data;
    var $results = $('#results').empty();

    $.each(data.chatters, function (id, role) {
      $('#label-role-' + id).text(role.length + ' ' + id);
    });

    var pool = [];
    $.each(data.chatters, function (id, role) {
      if (role.length > 0 && $('#role-' + id + ':checked').length == 1) {
        $.merge(pool, role);
      }
    });
    var total = pool.length;

    if (total == 0) {
      message('0 people!');
      return;
    }

    if (total < max_winners) {
      message("Don't have enough viewers, set number down to " + total);
      max_winners = total;
    }

    while (max_winners--) {
      var idx = Math.floor(Math.random() * pool.length);
      var winner = pool[idx];
      pool.splice(idx, 1);
      var $msg = $('<a/>').text('message').attr('href', 'http://www.twitch.tv/message/compose?to=' + winner);
      $('<div/>')
        .append($msg)
        .append(' ')
        .append($('<span/>').text(winner))
        .appendTo($results);
      }
  });
}

function init() {
  var $roles = $('#roles');
  $.each(['admins', 'moderators', 'staff', 'viewers'], function (idx, role) {
    var $input = $('<input/>')
      .attr('id', 'role-' + role)
      .attr('type', 'checkbox')
      .attr('checked', 'checked');
    var $label = $('<span/>')
      .attr('id', 'label-role-' + role)
      .text(' ' + role)
    $('<label/>')
      .attr('id', 'role-' + role)
      .append($input)
      .append($label)
      .appendTo($roles);
    $roles.append(' ');
  });
}

$(init);
