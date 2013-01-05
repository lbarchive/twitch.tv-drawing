/* use colors found at http://community.justin.tv/mediawiki/index.php/Chat_Guide
 * not sure if TMI has Pro and Broadcaster roles, so far, I only see the
 * following four and they are always returned even with no users belong to a
 * role.
 */
var ROLES = {
  admins: {
    color: '#c00'
  },
  moderators: {
    color: '#0c0'
  },
  staff: {
    color: '#00c'
  },
  viewers: {
    color: '#000'
  }
}

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
      var $msg = $('<a/>')
        .attr('title', 'send Twitch.tv message to ' + winner)
        .text('✉')
        .attr('href', 'http://www.twitch.tv/message/compose?to=' + winner);
      $('<li/>')
        .append($msg)
        .append(' ')
        .append($('<span/>').text(winner))
        .appendTo($results);
      }
  });
}

function init() {
  var $roles = $('#roles');
  $.each(ROLES, function (id, role) {
    var $input = $('<input/>')
      .attr('id', 'role-' + id)
      .attr('type', 'checkbox')
      .attr('checked', 'checked')
      .change(function () {
        var $cb = $(this);
        $cb.parent().css('opacity', $cb[0].checked ? 1.0 : 0.25);
      });
    var $label = $('<span/>')
      .attr('id', 'label-role-' + id)
      .css('color', role.color)
      .text(' ' + id)
    $('<label/>')
      .append($input)
      .append($label)
      .appendTo($roles);
    $roles.append(' ');
  });
}

$(init);
