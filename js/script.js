// ---------- Utility ----------
const defaultValues = {
  baseHeightFt: 4,
  baseHeightIn: 8,
  heightMethod: "manual",
  heightManualInput: 10,
  heightDiceCount: 2,
  heightDiceType: 10,
  baseWeight: 110,
  weightMethod: "manual",
  weightManualInput: 3,
  weightDiceCount: 2,
  weightDiceType: 4
};

// ---------- Calculation Expressions ----------
let heightRollExpression = "";
let weightRollExpression = "";

function rollDice(count, type) {
  let rolls = [];
  let total = 0;

  for (let i = 0; i < count; i++) {
    let roll = Math.floor(Math.random() * type) + 1;
    rolls.push(roll);
    total += roll;
  }

  return {
    total: total,
    rolls: rolls
  };
}

function inchesToFeetInches(inches) {
  let ft = Math.floor(inches / 12);
  let inch = inches % 12;
  return `${ft} ft ${inch} in`;
}

function inchesToCm(inches) {
  return (inches * 2.54).toFixed(1);
}

function lbsToKg(lbs) {
  return (lbs * 0.453592).toFixed(1);
}

function calculateBMI(weightLbs, heightInches) {
  let kg = weightLbs * 0.453592;
  let m = heightInches * 0.0254;
  return (kg / (m * m)).toFixed(1);
}

function getBuildCategoryFromBMI(bmi) {
  bmi = parseFloat(bmi);

  if (bmi < 18) return "Slender";
  if (bmi < 25) return "Average";
  if (bmi < 30) return "Broad";
  return "Massive";
}

function getBuildColor(category) {
  switch (category) {
    case "Slender":
      return "#4da6ff";
    case "Average":
      return "#4caf50";
    case "Broad":
      return "#ff9800";
    case "Massive":
      return "#f44336";
    default:
      return "#000000";
  }
}

function getBMICategory(bmi) {
  bmi = parseFloat(bmi);

  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Healthy";
  if (bmi < 30) return "Overweight";
  if (bmi < 35) return "Obesity (Class I)";
  if (bmi < 40) return "Obesity (Class II - Severe)";
  return "Obesity (Class III - Morbid)";
}

function getBMIColor(category) {
  switch (category) {
    case "Underweight":
      return "#4da6ff";
    case "Healthy":
      return "#4caf50";
    case "Overweight":
      return "#ff9800";
    case "Obesity (Class I)":
      return "#f44336";
    case "Obesity (Class II - Severe)":
      return "#c62828";
    case "Obesity (Class III - Morbid)":
      return "#8e0000";
    default:
      return "#000000";
  }
}

// ---------- LocalStorage ----------
function saveToLocalStorage() {
  const inputs = document.querySelectorAll("input, select");
  const data = {};

  inputs.forEach(input => {
    data[input.id] = input.value;
  });

  localStorage.setItem("dndCharacterCalc", JSON.stringify(data));
}

function loadFromLocalStorage() {
  const saved = localStorage.getItem("dndCharacterCalc");
  if (!saved) return;

  const data = JSON.parse(saved);

  Object.keys(data).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.value = data[id];
    }
  });

  syncHeightUI();
  syncWeightUI();
}

// ---------- Toggle Visibility ----------
document.getElementById("heightMethod").addEventListener("change", function() {
  document.getElementById("heightManual").style.display =
    this.value === "manual" ? "contents" : "none";
  document.getElementById("heightDigital").style.display =
    this.value === "digital" ? "contents" : "none";
});

document.getElementById("weightMethod").addEventListener("change", function() {
  document.getElementById("weightManual").style.display =
    this.value === "manual" ? "block" : "none";
  document.getElementById("weightDigital").style.display =
    this.value === "digital" ? "block" : "none";
});

// ---------- Roll Buttons ----------
document.getElementById("rollHeight").addEventListener("click", function() {
  let count = parseInt(document.getElementById("heightDiceCount").value);
  let type = parseInt(document.getElementById("heightDiceType").value);

  let rollData = rollDice(count, type);
  let result = rollData.total;
  let rolls = rollData.rolls;

  document.getElementById("heightRollResult").value = result;

  heightRollExpression = `${count}d${type} [${rolls.join(" + ")} = ${result}]`;
});

document.getElementById("rollWeight").addEventListener("click", function() {
  let count = parseInt(document.getElementById("weightDiceCount").value);
  let type = parseInt(document.getElementById("weightDiceType").value);

  let rollData = rollDice(count, type);
  let result = rollData.total;
  let rolls = rollData.rolls;

  document.getElementById("weightRollResult").value = result;

  weightRollExpression = `${count}d${type} [${rolls.join(" + ")} = ${result}]`;
});

// ---------- Calculation ----------
document.getElementById("calculate").addEventListener("click", function() {

  let baseFt = parseInt(document.getElementById("baseHeightFt").value);
  let baseIn = parseInt(document.getElementById("baseHeightIn").value);
  let baseHeight = baseFt * 12 + baseIn;

  let baseWeight = parseFloat(document.getElementById("baseWeight").value);

  let heightModifier =
    document.getElementById("heightMethod").value === "manual" ?
    parseInt(document.getElementById("heightManualInput").value) :
    parseInt(document.getElementById("heightRollResult").value);
  if (document.getElementById("heightMethod").value === "manual") {
    heightRollExpression = `[${heightModifier}]`;
  }

  let weightModifier =
    document.getElementById("weightMethod").value === "manual" ?
    parseInt(document.getElementById("weightManualInput").value) :
    parseInt(document.getElementById("weightRollResult").value);
  if (document.getElementById("weightMethod").value === "manual") {
    weightRollExpression = `[${weightModifier}]`;
  }

  let finalHeight = baseHeight + heightModifier;
  // let finalWeight = baseWeight + weightModifier;
  let finalWeight = baseWeight + (heightModifier * weightModifier);

  let bmi = calculateBMI(finalWeight, finalHeight);
  let build = getBuildCategoryFromBMI(bmi);
  let color = getBuildColor(build);
  let bmiCategory = getBMICategory(bmi);
  let bmiColor = getBMIColor(bmiCategory);

  document.getElementById("result").innerHTML = `
  <div class="resultCard">
    <h2>Result</h2>
    <div class="resultRow">
      <div class="resultLabel">Height</div>
      <div class="resultValue"> ${inchesToFeetInches(finalHeight)} <br>
        <span class="resultSub">${inchesToCm(finalHeight)} cm</span>
      </div>
    </div>
    <div class="resultRow">
      <div class="resultLabel">Weight</div>
      <div class="resultValue"> ${finalWeight} lbs <br>
        <span class="resultSub">${lbsToKg(finalWeight)} kg</span>
      </div>
    </div>
    <div class="resultRow">
      <div class="resultLabel">Build</div>
      <div class="resultValue" style="color:${color}; font-weight:bold;"> ${build} </div>
    </div>
    <div class="resultRow">
      <div class="resultLabel">BMI <br>
        <span class="resultLabelSub">Human-equivalent</span>
      </div>
      <div class="resultValue">
        <span style="color:${bmiColor}; font-weight:bold;"> ${bmi}</span>
        <br>
        <span style="color:${bmiColor};"> ${bmiCategory} </span>
      </div>
    </div>
    <details style="margin-top:20px;">
      <summary style="cursor:pointer;">Show Calculation Details</summary>
      <div style="margin-top:10px; font-family:monospace; line-height: 1.5em;">
        <div style="margin-bottom:10px;">
          <strong>Height:</strong>
          <br> ${baseFt} ft ${baseIn} in + ${heightRollExpression} in <br> = ${inchesToFeetInches(finalHeight)}
        </div>
        <div>
          <strong>Weight:</strong>
          <br> ${baseWeight} lbs + (${heightRollExpression} × ${weightRollExpression}) lbs <br> = ${finalWeight} lbs
        </div>
      </div>
    </details>
  </div>
`;
});

document.getElementById("reset").addEventListener("click", function() {

  Object.keys(defaultValues).forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.value = defaultValues[id];
    }
  });

  localStorage.removeItem("dndCharacterCalc");

  syncHeightUI();
  syncWeightUI();

  document.getElementById("heightRollResult").value = defaultValues.heightManualInput;
  document.getElementById("weightRollResult").value = defaultValues.weightManualInput;

  heightRollExpression = `[${defaultValues.heightManualInput}]`;
  weightRollExpression = `[${defaultValues.weightManualInput}]`;
  document.getElementById("result").innerHTML = "";
});
// ---------- Credits toggle ----------
document.querySelector("footer a").addEventListener("click", function(event) {
  // event.preventDefault();

  document.querySelector(".calculator").style.display = "none";
  document.querySelector(".credits").style.display = "block";
});

document.getElementById("backToCalculator").addEventListener("click", function() {
  document.querySelector(".calculator").style.display = "flex";
  document.querySelector(".credits").style.display = "none";
});
// ---------- Auto Save ----------
document.querySelectorAll("input, select").forEach(element => {
  element.addEventListener("change", saveToLocalStorage);
});
// ---------- Initial UI Sync ----------
function syncHeightUI() {
  const method = document.getElementById("heightMethod").value;
  document.getElementById("heightManual").style.display =
    method === "manual" ? "contents" : "none";
  document.getElementById("heightDigital").style.display =
    method === "digital" ? "contents" : "none";
}

function syncWeightUI() {
  const method = document.getElementById("weightMethod").value;
  document.getElementById("weightManual").style.display =
    method === "manual" ? "block" : "none";
  document.getElementById("weightDigital").style.display =
    method === "digital" ? "block" : "none";
}

syncHeightUI();
syncWeightUI();
loadFromLocalStorage();
if (!localStorage.getItem("dndCharacterCalc")) {
  document.getElementById("heightRollResult").value = defaultValues.heightManualInput;
  document.getElementById("weightRollResult").value = defaultValues.weightManualInput;

  heightRollExpression = `[${defaultValues.heightManualInput}]`;
  weightRollExpression = `[${defaultValues.weightManualInput}]`;
}
