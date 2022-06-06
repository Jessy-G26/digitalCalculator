//Assign values
let input = document.getElementById("input");
let history = document.getElementById("history");
let clear = document.getElementById("C");
let clearE = document.getElementById("CE");
let digits = document.getElementsByClassName("digit");
let operators = document.getElementsByClassName("operator");
let plusmn = document.getElementById("plusmn");
let equals = document.getElementById("equals");
let decimal = document.getElementById("decimal");

//to execute function when click
for (let d of digits) {
  d.addEventListener("click", pressDigit);
}

for (let o of operators) {
  o.addEventListener("click", pressOperator);
}

clear.addEventListener("click", pressClear);
clearE.addEventListener("click", pressBackspace);
plusmn.addEventListener("click", pressPlusmn);
equals.addEventListener("click", pressEquals);
decimal.addEventListener("click", pressDecimal);

//Keyboard function
document.addEventListener("keydown", keydown);


function keydown(e) {
  if (!isNaN(e.key)) {
    pressDigit(e.key.toString());
    return;
  }
  switch (e.key) {
    case "c":
      pressClear();
      break;
    case "Backspace":
      pressBackspace();
      break;
    case ".":
      pressDecimal();
      break;
    case "Enter":
    case "=":
      pressEquals();
      break;
    case "+":
      pressOperator("+");
      break;
    case "-":
      pressOperator("-");
      break;
    case "*":
      pressOperator("\xD7");
      break;
    case "/":
      pressOperator("\xF7");
      break;
    case "%":
      pressOperator("%");
      break;
  }
}

function pressDigit(e) {
  let digit;
  if (typeof e === "string") {
    digit = e;
  } else {
    digit = e.target.innerText;
  }

  //if operator was pressed last, reset input
  if (isHistoryOperator(history.innerText.length - 1) && input.innerText !== "-") {
    input.innerText = "";
  }

  if (equalsPressed()) {
    history.innerText = digit;
    input.innerText = digit;
  } else if (isHistoryTooLong() || isInputTooLong()) {
    return;
  } else if (input.innerText === "0" || input.innerText === "-0") {
    history.innerText = history.innerText.slice(0, history.innerText.length - 1) + digit;
    if (input.innerText === "0") {
      input.innerText = digit;
    } else {
      input.innerText = "-" + digit;
    }
  } else {
    history.innerText += digit;
    input.innerText += digit;
  }
}

function pressDecimal() {
  if (equalsPressed() || input.innerText === "") {
    history.innerText = "0.";
    input.innerText = "0.";
    return;
  }
  //if operator was pressed last, reset input
  if (isHistoryOperator(history.innerText.length - 1) && input.innerText !== "-") {
    input.innerText = "";
  }

  if (isHistoryTooLong() || isInputTooLong() || input.innerText.includes(".")) {
    return;
  } else if (isHistoryOperator(history.innerText.length - 1)) {
    history.innerText += "0.";
    input.innerText += "0.";
  } else if (history.innerText[history.innerText.length - 1] !== ".") {
    history.innerText += ".";
    input.innerText += ".";
  }
}

function pressOperator(e) {
  //if history is empty, or two operators have been hit, return
  let operator = e;
  if (e === "-" && (isHistoryOperator(history.innerText.length - 1) || history.innerText === "")) {
    pressPlusmn();
    return;
  }
  if (
    history.innerText === "" ||
    input.innerText.search(/[a-z><]/gi) !== -1 ||
    (isHistoryOperator(history.innerText.length - 1) && isHistoryOperator(history.innerText.length - 2))
  ) {
    return;
  }
  if (typeof e === "string") {
    operator = e;
  } else {
    operator = e.target.innerText;
  }

  if (equalsPressed()) {
    history.innerText = input.innerText + operator;
  } else if (isHistoryTooLong()) {
    return;
  } else if (isHistoryOperator(history.innerText.length - 1)) {
    history.innerText = history.innerText.slice(0, history.innerText.length - 1) + operator;
  } else {
    history.innerText += operator;
  }
}

// to void
function pressClear() {
  input.innerText = "";
  history.innerText = "";
}
//delete one number/character
function pressBackspace() {
  if (history.innerText.search(/[a-z><]/gi) !== -1) {
    input.innerText = "";
    history.innerText = "";
    return;
  }
  if (history.innerText === "") {
    return;
  }
  //if operator was not pressed, delete last number from input
  if ((!isHistoryOperator(history.innerText.length - 1) || input.innerText === "-") && !equalsPressed()) {
    input.innerText = input.innerText.slice(0, input.innerText.length - 1);
  } else {
    input.innerText = lastNoInHistory();
  }

  history.innerText = history.innerText.slice(0, history.innerText.length - 1);
}

//positive or negative
function pressPlusmn() {
  if (equalsPressed()) {
    input.innerText = "-";
    history.innerText = "-";
  } else if (isHistoryTooLong() || isInputTooLong()) {
    return;
  } else if (history.innerText === "-") {
    input.innerText = "";
    history.innerText = "";
  } else if (isHistoryOperator(history.innerText.length - 1) && !isHistoryOperator(history.innerText.length - 2)) {
    input.innerText = "-";
    history.innerText += "-";
  } else if (!input.innerText.includes("-")) {
    let hindex = history.innerText.lastIndexOf(input.innerText);
    input.innerText = "-" + input.innerText;
    history.innerText = history.innerText.slice(0, hindex) + input.innerText;
  } else {
    let hindex = history.innerText.lastIndexOf(input.innerText);
    input.innerText = input.innerText.slice(1);
    history.innerText = history.innerText.slice(0, hindex) + input.innerText;
  }
}

function pressEquals() {
  //if equals or an operator was pressed last, or history is empty
  if (
    isHistoryOperator(history.innerText.length - 1) ||
    history.innerText[history.innerText.length - 1] === "=" ||
    history.innerText === ""
  ) {
    return;
  }

  let numbersArray = history.innerText.split(/[^0-9.]+/g).filter(i => i !== "");
  numbersArray = numbersArray.map(i => Number(i));
  let operatorsArray = history.innerText.split(/[0-9.]+/g).filter(op => op !== "");

  if (history.innerText[0] === "-") {
    //fix arrays if first number is negative
    numbersArray[0] = -numbersArray[0];
    operatorsArray.shift();
  }

  history.innerText += "=";
  input.innerText = evaluate(numbersArray, operatorsArray).toString();
}

function evaluate(numbersArray, operatorsArray) {
  for (let i = 0; i < operatorsArray.length; i++) {
    if (operatorsArray[i][0] === "\xF7" || operatorsArray[i][0] === "\xD7" || operatorsArray[i][0] === "%") {
      let evaluation = simpleEval(numbersArray[i], numbersArray[i + 1], operatorsArray[i]);
      numbersArray.splice(i, 2, evaluation);
      operatorsArray.splice(i, 1);
      i--;
    }
  }

  for (let i = 0; i < operatorsArray.length; i++) {
    let evaluation = simpleEval(numbersArray[i], numbersArray[i + 1], operatorsArray[i]);
    numbersArray.splice(i, 2, evaluation);
    operatorsArray.splice(i, 1);
    i--;
  }

  return output(numbersArray[0]);

  function simpleEval(a, b, operation) {
    switch (operation) {
      case "+":
        return a + b;
      case "-":
        return a - b;
      case "\xF7":
        return a / b;
      case "\xD7":
        return a * b;
      case "%":
        return a % b;
      case "+-":
        return a - b;
      case "--":
        return a + b;
      case "\xF7-":
        return a / -b;
      case "\xD7-":
        return a * -b;
      case "%-":
        return a % -b;
      default:
        console.error("Evaluation cannot be completed");
        return;
    }
  }

  //display of input and output of calculator
  function output(n) {
    if (Math.abs(n) < 1) {
      return Number(n.toPrecision(8)).toString();
    } else if (n > 9999999999 && Math.abs(n) !== Infinity) {
      return ">9999999999";
    } else if (n < -999999999 && Math.abs(n) !== Infinity) {
      return "<-999999999";
    } else if (
      !Number(n.toPrecision(9))
        .toString()
        .includes(".")
    ) {
      return Number(n.toPrecision(10)).toString();
    }
    return Number(n.toPrecision(9)).toString();
  }
}
function isHistoryOperator(i) {
  return (
    history.innerText[i] === "%" ||
    history.innerText[i] === "+" ||
    history.innerText[i] === "\xF7" ||
    history.innerText[i] === "\xD7" ||
    history.innerText[i] === "-"
  );
}

function equalsPressed() {
  return history.innerText[history.innerText.length - 1] === "=" || history.innerText === "";
}

function isHistoryTooLong() {
  return history.innerText.length > 20;
}

function isInputTooLong() {
  return input.innerText.length >= 10;
}

function lastNoInHistory() {
  let number = history.innerText
    .split(/[^0-9.]+/g)
    .filter(i => i !== "")
    .pop();

  if (history.innerText.endsWith("-" + number, history.innerText.length - 1)) {
    number = "-" + number;
  }

  return number;
}