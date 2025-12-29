// import { highlightText } from "./worker/highlight.js";
import { startEmitter } from "./emitter.js";
import { $, loadHtmlComponent } from "./utils/lib.js";
import { addLogs, scroller } from "./log-adder.js";
import { scrollToBottom } from "./utils/virtual-scroller.js";

loadHtmlComponent("command-palette");
loadHtmlComponent("context-menu");

const logContainer = $(".container");

// scroll to bottom of container
const downButton = $(".down-button");
downButton.addEventListener("click", async () => {
  await scrollToBottom(scroller);
});
let showButton = downButton.classList.contains("show");
const GOAL_DIST = 150;
logContainer.addEventListener("scroll", () => {
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