var CONFIG = (function() {
  var is_started;
  var starting_time;
  var interval_id;
  var original_countdown;
  var countdown_to_minutes = {
    "Work": 25,
    "Small Break": 5,
    "Big Break": 30,
  }

  return {
    setCountdown: function(key, value) {
      countdown_to_minutes[key] = value;
    },
    getCountdown: function(key) {
      return countdown_to_minutes[key];
    },
    setIntervalID: function(id) {
      interval_id = id;
    },
    getIntervalID: function() {
      return interval_id;
    },
    start: function() {
      is_started = true;
    },
    end: function() {
      is_started = false;
    },
    getIsStarted: function() {
      return is_started;
    },
    setStartingTime: function(time) {
      starting_time = time;
    },
    getStartingTime: function() {
      return starting_time;
    },
    setOriginalCountdown: function(countdown) {
      original_countdown = countdown;
    },
    getOriginalCountdown: function() {
      return original_countdown;
    },
  };
})();

function indentTime(i) {
  if (i < 10) {
    i = "0" + i
  }; // add zero in front of numbers < 10
  return i;
}

function toSeconds(time_in_ms) {
  return time_in_ms / 1000;
}

function toMinutes(time_in_ms) {
  return toSeconds(time_in_ms) / 60;
}

function timerTick() {
  // We're not supposed to run
  document.getElementById('txt').innerHTML = "started timerTick";
  if (!CONFIG.getIsStarted()) {
    document.getElementById('txt').innerHTML = "not supposed to run";
    return;
  }

  var diff_ms = Date.now() - CONFIG.getStartingTime();

  document.getElementById('dbg').innerHTML = Date.now();
  // If we're out of time
  var remaining_ms = CONFIG.getOriginalCountdown() * 1000 * 60 - diff_ms;
  if (remaining_ms < 0) {
    document.getElementById('txt').innerHTML = "stopping timer";
    stopTimer();
    return;
  }

  var remaining_whole_minutes = Math.floor(remaining_ms / (1000 * 60));
  var remaining_seconds = Math.floor((remaining_ms / 1000) - remaining_whole_minutes * 60);

  document.getElementById('clock').innerHTML = indentTime(remaining_whole_minutes) + ":" + indentTime(remaining_seconds);
  document.getElementById('txt').innerHTML = "Ended tick";
}

function setupClock(minutes) {
  document.getElementById('txt').innerHTML = "Starter setupClock";
  document.getElementById('clock').innerHTML = indentTime(minutes) + ":00";
  CONFIG.setOriginalCountdown(minutes);
  CONFIG.setStartingTime(Date.now());
  CONFIG.start();
  CONFIG.setIntervalID(setInterval(timerTick, 50));
  document.getElementById('txt').innerHTML = "Ended setupClock";
}

document.addEventListener("click", (e) => {
  //window.alert("sometext");
  document.getElementById('txt').innerHTML = "hhhhhhhhhhh";
  if (e.target.classList.contains("countdown")) {
    var chosen_countdown = e.target.textContent;
    setupClock(CONFIG.getCountdown(chosen_countdown));
  } else if (e.target.classList.contains("clear")) {
    if (!CONFIG.getIsStarted()) {
      return;
    }

    //TODO: Remove
    document.getElementById('txt').innerHTML = "Removing and stopping";
    clearInterval(CONFIG.getIntervalID);
    CONFIG.end();
    stopTimer();
  }
});

