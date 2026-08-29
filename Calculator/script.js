(function () {
  'use strict';

  const expressionDisplay = document.getElementById('expression-display');
  const resultDisplay = document.getElementById('result-display');
  const display = document.querySelector('.display');
  const keypad = document.querySelector('.keypad');

  let expression = '';
  let result = '0';
  let justEvaluated = false;
  let hasError = false;

  const operators = new Set(['+', '−', '×', '÷']);

  function isOperator(value) {
    return operators.has(value);
  }

  function formatExpression(value) {
    if (!value) return '0';

    return value
      .replace(/([+−×÷])/g, ' $1 ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function formatNumber(value) {
    if (!Number.isFinite(value)) {
      throw new Error('Math error');
    }

    const rounded = Number(value.toPrecision(12));
    return String(rounded);
  }

  function render() {
    expressionDisplay.textContent = formatExpression(expression);
    resultDisplay.textContent = result;
    display.classList.toggle('error', hasError);
  }

  function resetState() {
    expression = '';
    result = '0';
    justEvaluated = false;
    hasError = false;
    render();
  }

  function recoverFromError() {
    if (hasError) {
      resetState();
    }
  }

  function appendDigit(digit) {
    recoverFromError();

    if (justEvaluated) {
      expression = '';
      result = '0';
      justEvaluated = false;
    }

    expression += digit;

    // Result stays 0 while typing
    result = '0';
    render();
  }

  function appendDecimal() {
    recoverFromError();

    if (justEvaluated) {
      expression = '';
      result = '0';
      justEvaluated = false;
    }

    const parts = expression.split(/[+−×÷]/);
    const currentNumber = parts[parts.length - 1];

    if (currentNumber.includes('.')) {
      return;
    }

    if (!expression || isOperator(expression.slice(-1))) {
      expression += '0.';
    } else {
      expression += '.';
    }

    // Result stays 0 while typing
    result = '0';
    render();
  }

  function appendOperator(operator) {
    recoverFromError();

    if (justEvaluated) {
      expression = result;
      justEvaluated = false;
    }

    if (!expression) {
      if (operator === '−') {
        expression = operator;
        render();
      }
      return;
    }

    if (expression === '−' && operator !== '−') {
      return;
    }

    if (expression.endsWith('.')) {
      expression = expression.slice(0, -1);
    }

    if (isOperator(expression.slice(-1))) {
      expression = expression.slice(0, -1) + operator;
    } else {
      expression += operator;
    }

    // Result stays 0 while typing
    result = '0';
    render();
  }

  function applyOperation(left, operator, right) {
    if (operator === '+') return left + right;
    if (operator === '−') return left - right;
    if (operator === '×') return left * right;

    if (operator === '÷') {
      if (right === 0) {
        throw new Error('Cannot divide by zero');
      }
      return left / right;
    }

    throw new Error('Unknown operator');
  }

  function evaluate(value) {
    const numbers = [];
    const pendingOperators = [];
    let current = '';

    function commitNumber() {
      if (!current || current === '−' || current === '-') {
        throw new Error('Incomplete expression');
      }

      const parsed = Number(current);

      if (!Number.isFinite(parsed)) {
        throw new Error('Invalid number');
      }

      numbers.push(parsed);
      current = '';
    }

    function precedence(operator) {
      return operator === '+' || operator === '−' ? 1 : 2;
    }

    function reduceTop() {
      const operator = pendingOperators.pop();
      const right = numbers.pop();
      const left = numbers.pop();

      if (left === undefined || right === undefined) {
        throw new Error('Incomplete expression');
      }

      numbers.push(applyOperation(left, operator, right));
    }

    for (let index = 0; index < value.length; index += 1) {
      const character = value[index];

      if (/\d|\./.test(character)) {
        current += character;
        continue;
      }

      if (!isOperator(character)) {
        throw new Error('Invalid expression');
      }

      const isUnaryMinus =
        character === '−' &&
        (index === 0 || isOperator(value[index - 1]));

      if (isUnaryMinus && current === '') {
        current = '-';
        continue;
      }

      commitNumber();

      while (
        pendingOperators.length &&
        precedence(pendingOperators[pendingOperators.length - 1]) >=
          precedence(character)
      ) {
        reduceTop();
      }

      pendingOperators.push(character);
    }

    commitNumber();

    while (pendingOperators.length) {
      reduceTop();
    }

    if (numbers.length !== 1) {
      throw new Error('Incomplete expression');
    }

    return numbers[0];
  }

  function calculate() {
    if (
      !expression ||
      expression === '−' ||
      isOperator(expression.slice(-1))
    ) {
      return;
    }

    try {
      result = formatNumber(evaluate(expression));
      justEvaluated = true;
      hasError = false;
    } catch (error) {
      result =
        error.message === 'Cannot divide by zero'
          ? 'Cannot divide by zero'
          : 'Error';

      hasError = true;
      justEvaluated = false;
    }

    render();
  }

  function deleteLast() {
    if (hasError) {
      resetState();
      return;
    }

    if (justEvaluated) {
      expression = '';
      result = '0';
      justEvaluated = false;
      render();
      return;
    }

    expression = expression.slice(0, -1);

    // Result returns/stays 0 while editing
    result = '0';
    render();
  }

  function handleInput(value) {
    if (/^\d$/.test(value)) {
      appendDigit(value);
    } else if (value === '.') {
      appendDecimal();
    } else if (isOperator(value)) {
      appendOperator(value);
    }
  }

  function pulseButton(button) {
    if (!button) return;

    button.classList.add('is-key-pressed');

    window.setTimeout(function () {
      button.classList.remove('is-key-pressed');
    }, 110);
  }

  keypad.addEventListener('click', function (event) {
    const button = event.target.closest('button');

    if (!button) return;

    pulseButton(button);

    if (button.dataset.action === 'clear') {
      resetState();
    } else if (button.dataset.action === 'delete') {
      deleteLast();
    } else if (button.dataset.action === 'equals') {
      calculate();
    } else {
      handleInput(button.dataset.value);
    }
  });

  document.addEventListener('keydown', function (event) {
    const key = event.key;
    let button;

    if (/^\d$/.test(key)) {
      handleInput(key);
      button = document.querySelector('[data-value="' + key + '"]');
    } else if (key === '.') {
      handleInput('.');
      button = document.querySelector('[data-value="."]');
    } else if (key === '+' || key === '-') {
      const operator = key === '-' ? '−' : key;
      handleInput(operator);
      button = document.querySelector('[data-value="' + operator + '"]');
    } else if (key === '*' || key.toLowerCase() === 'x') {
      handleInput('×');
      button = document.querySelector('[data-value="×"]');
    } else if (key === '/') {
      handleInput('÷');
      button = document.querySelector('[data-value="÷"]');
    } else if (key === 'Enter' || key === '=') {
      calculate();
      button = document.querySelector('[data-action="equals"]');
    } else if (key === 'Backspace' || key === 'Delete') {
      deleteLast();
      button = document.querySelector('[data-action="delete"]');
    } else if (key === 'Escape') {
      resetState();
      button = document.querySelector('[data-action="clear"]');
    } else {
      return;
    }

    event.preventDefault();
    pulseButton(button);
  });

  render();
})();