"use strict";
function sum(...numbers) {
  return numbers.reduce((total, value) => total + value, 0);
}
function createUser({ name, age, email = "не указан" }) {
  return `Пользователь: ${name}, возраст: ${age}, email: ${email}`;
}
function secretMessage(password, message) {
  return (candidate) => (candidate === password ? message : "Доступ запрещен");
}
// Композиция выполняется справа налево, пустая композиция — тождественная функция.
function compose(...functions) {
  return (value) => functions.reduceRight((result, fn) => fn(result), value);
}
function myMap(array, callback) {
  if (typeof callback !== "function")
    throw new TypeError("callback должен быть функцией");
  const length = array.length,
    result = new Array(length);
  for (let i = 0; i < length; i++)
    if (i in array) result[i] = callback(array[i], i, array);
  return result;
}
function myFilter(array, callback) {
  if (typeof callback !== "function")
    throw new TypeError("callback должен быть функцией");
  const length = array.length,
    result = [];
  for (let i = 0; i < length; i++)
    if (i in array && callback(array[i], i, array)) result.push(array[i]);
  return result;
}
function myReduce(array, callback, initialValue) {
  if (typeof callback !== "function")
    throw new TypeError("callback должен быть функцией");
  const length = array.length;
  let i = 0,
    acc = initialValue;
  if (arguments.length < 3) {
    while (i < length && !(i in array)) i++;
    if (i === length)
      throw new TypeError("Пустой массив без начального значения");
    acc = array[i++];
  }
  for (; i < length; i++)
    if (i in array) acc = callback(acc, array[i], i, array);
  return acc;
}
// Рекурсия собирает аргументы до достижения арности исходной функции.
function curry(fn) {
  function collect(args, context) {
    return function (...next) {
      const all = args.concat(next);
      const receiver = context === undefined ? this : context;
      return all.length >= fn.length
        ? fn.apply(receiver, all)
        : collect(all, receiver);
    };
  }
  return collect([], undefined);
}
// Дерево Map сохраняет идентичность объектов, this и различие типов аргументов.
function memoize(fn) {
  const root = new Map();
  const terminal = Symbol("result");
  return function (...args) {
    let node = root;
    for (const key of [this, ...args]) {
      if (!node.has(key)) node.set(key, new Map());
      node = node.get(key);
    }
    if (node.has(terminal)) return node.get(terminal);
    const result = fn.apply(this, args);
    node.set(terminal, result);
    return result;
  };
}
// Debounce trailing: последний вызов после периода тишины.
function debounce(fn, delay) {
  let timer;
  function wrapped(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timer = undefined;
      fn.apply(this, args);
    }, delay);
  }
  wrapped.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
  };
  return wrapped;
}
// Throttle leading + trailing: немедленный вызов и последние аргументы окна.
function throttle(fn, interval) {
  let last = -Infinity,
    timer,
    pending,
    context;
  function wrapped(...args) {
    const now = Date.now(),
      remaining = interval - (now - last);
    context = this;
    pending = args;
    if (remaining <= 0) {
      clearTimeout(timer);
      timer = undefined;
      last = now;
      const current = pending;
      pending = undefined;
      fn.apply(context, current);
    } else if (!timer) {
      timer = setTimeout(() => {
        timer = undefined;
        last = Date.now();
        const current = pending;
        pending = undefined;
        fn.apply(context, current);
      }, remaining);
    }
  }
  wrapped.cancel = () => {
    clearTimeout(timer);
    timer = undefined;
    pending = undefined;
    last = -Infinity;
  };
  return wrapped;
}
function createValidator({
  minLength = 8,
  requireNumbers = true,
  requireUppercase = true,
} = {}) {
  return (value) =>
    typeof value === "string" &&
    value.length >= minLength &&
    (!requireNumbers || /\d/.test(value)) &&
    (!requireUppercase || /[A-ZА-ЯЁ]/u.test(value));
}
// Дополнительные примеры рекурсии и генератора.
function recursiveFactorial(n) {
  if (!Number.isInteger(n) || n < 0 || n > 18) throw new RangeError("n: 0..18");
  return n <= 1 ? 1 : n * recursiveFactorial(n - 1);
}
function* range(start, end) {
  for (let i = start; i < end; i++) yield i;
}
if (typeof module !== "undefined")
  module.exports = {
    sum,
    createUser,
    secretMessage,
    compose,
    myMap,
    myFilter,
    myReduce,
    curry,
    memoize,
    debounce,
    throttle,
    createValidator,
    recursiveFactorial,
    range,
  };
