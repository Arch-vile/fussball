function changeSpinner(index) {
  var spinnerLoop = ["|", "/", "-", "\\"];
  var spinners = $(".textSpinner");
  if (spinners.length != 0) {
    spinners.html(spinnerLoop[index % 4]);
    console.log("spinner");
    setTimeout(function() {
      changeSpinner(index + (1 % 4));
    }, 100);
  }
}
