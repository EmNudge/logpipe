// import { highlightText } from "./worker/highlight.js";
import { startEmitter } from "./emitter.js";
import { $, loadHtmlComponent } from "./lib.js";
import { addLogs } from "./log-adder.js";

loadHtmlComponent("command-palette");
loadHtmlComponent("context-menu");

const logContainer = $(".container");

// scroll to bottom of container
const downButton = $(".down-button");
downButton.addEventListener("click", () => {
  logContainer.children[logContainer.children.length - 1].scrollIntoView();
});
let showButton = downButton.classList.contains("show");
const GOAL_DIST = 150;
logContainer.addEventListener("scroll", (e) => {
  const dist = Math.abs(
    logContainer.scrollHeight -
      logContainer.scrollTop -
      logContainer.clientHeight
  );

  if (dist > GOAL_DIST && !showButton) {
    downButton.classList.add("show");
    showButton = true;
  } else if (dist < GOAL_DIST && showButton) {
    downButton.classList.remove("show");
    showButton = false;
  }
});

startEmitter(addLogs)