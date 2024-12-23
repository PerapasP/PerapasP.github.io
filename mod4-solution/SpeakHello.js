(function(window) {
  // Create the helloSpeaker object
  var helloSpeaker = {};

  // DO NOT attach the speakWord variable to the 'helloSpeaker' object.
  var speakWord = "Hello";

  // Attach the 'speak' method to the helloSpeaker object
  helloSpeaker.speak = function(name) {
    console.log(speakWord + " " + name);
  };

  // Expose the 'helloSpeaker' object to the global scope
  window.helloSpeaker = helloSpeaker;
})(window);