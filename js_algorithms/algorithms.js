"use strict";
function integer(n) {
  if (!Number.isSafeInteger(n))
    throw new TypeError("Ожидается безопасное целое число");
}
// O(sqrt(n)): достаточно проверять делители до квадратного корня.
function isPrime(number) {
  if (!Number.isSafeInteger(number) || number < 2) return false;
  if (number % 2 === 0) return number === 2;
  for (let d = 3; d <= number / d; d += 2) if (number % d === 0) return false;
  return true;
}
// O(n), память O(1). Для Number ограничиваем диапазон без потери точности.
function factorial(n) {
  integer(n);
  if (n < 0 || n > 18) throw new RangeError("n: от 0 до 18");
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}
// O(n), память O(n).
function fibonacci(n) {
  integer(n);
  if (n < 0 || n > 79) throw new RangeError("n: от 0 до 79");
  const result = [];
  for (let i = 0; i < n; i++)
    result.push(i < 2 ? i : result[i - 1] + result[i - 2]);
  return result;
}
// O(log(min(|a|,|b|))), алгоритм Евклида.
function gcd(a, b) {
  integer(a);
  integer(b);
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
}
// O(n), учитываем Unicode, пробелы, пунктуацию и регистр.
function isPalindrome(str) {
  const chars = Array.from(
    str
      .normalize("NFC")
      .toLocaleLowerCase()
      .replace(/[^\p{L}\p{N}]/gu, ""),
  );
  for (let i = 0, j = chars.length - 1; i < j; i++, j--)
    if (chars[i] !== chars[j]) return false;
  return true;
}
// O(n).
function countVowels(str) {
  let count = 0;
  for (const char of str.toLowerCase())
    if ("аеёиоуыэюяaeiou".includes(char)) count++;
  return count;
}
// O(n): без split/reverse/join, перебираем кодовые точки.
function reverseString(str) {
  const chars = [];
  for (const char of str) chars.push(char);
  let result = "";
  for (let i = chars.length - 1; i >= 0; i--) result += chars[i];
  return result;
}
// O(n), при равной длине возвращаем первое слово.
function findLongestWord(sentence) {
  const words = sentence.match(/[\p{L}\p{N}]+/gu) || [];
  let longest = "",
    longestLength = 0;
  for (const word of words) {
    const length = Array.from(word).length;
    if (length > longestLength) {
      longest = word;
      longestLength = length;
    }
  }
  return longest;
}
// O(n). Максимум пустого множества не определён.
function findMax(arr) {
  if (!arr.length) return undefined;
  let max = arr[0];
  for (const value of arr) {
    if (typeof value !== "number" || Number.isNaN(value))
      throw new TypeError("Массив должен содержать числа");
    if (value > max) max = value;
  }
  return max;
}
// В среднем O(n), память O(n), порядок первого появления сохраняется.
function removeDuplicates(arr) {
  return Array.from(new Set(arr));
}
// O(n²), на отсортированном массиве O(n), память O(n) для копии.
function bubbleSort(arr) {
  const result = [...arr];
  for (let end = result.length - 1; end > 0; end--) {
    let swapped = false;
    for (let j = 0; j < end; j++)
      if (result[j] > result[j + 1]) {
        [result[j], result[j + 1]] = [result[j + 1], result[j]];
        swapped = true;
      }
    if (!swapped) break;
  }
  return result;
}
// O(log n), массив должен быть отсортирован по возрастанию.
function binarySearch(sortedArr, target) {
  let left = 0,
    right = sortedArr.length - 1;
  while (left <= right) {
    const mid = left + Math.floor((right - left) / 2);
    if (sortedArr[mid] === target) return mid;
    if (sortedArr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}
// O(k), где k — длина результата.
function formatCurrency(amount, currency = "₽") {
  if (!Number.isFinite(amount)) throw new TypeError("Ожидается конечное число");
  const [whole, part] = amount.toFixed(2).split(".");
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}.${part} ${currency}`;
}
// O(n): практическая проверка формы email, не проверка существования адреса.
function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
// O(n), криптографическая случайность и хотя бы один символ каждой категории.
function generatePassword(length = 8) {
  integer(length);
  if (length < 4 || length > 4096) throw new RangeError("Длина от 4 до 4096");
  const groups = [
    "abcdefghijklmnopqrstuvwxyz",
    "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    "0123456789",
    "!@#$%&*?",
  ];
  const alphabet = groups.join("");
  function random(limit) {
    const bytes = new Uint32Array(1);
    const ceiling = 4294967296 - (4294967296 % limit);
    do {
      globalThis.crypto.getRandomValues(bytes);
    } while (bytes[0] >= ceiling);
    return bytes[0] % limit;
  }
  const result = groups.map((group) => group[random(group.length)]);
  while (result.length < length) result.push(alphabet[random(alphabet.length)]);
  for (let i = result.length - 1; i > 0; i--) {
    const j = random(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result.join("");
}
if (typeof module !== "undefined")
  module.exports = {
    isPrime,
    factorial,
    fibonacci,
    gcd,
    isPalindrome,
    countVowels,
    reverseString,
    findLongestWord,
    findMax,
    removeDuplicates,
    bubbleSort,
    binarySearch,
    formatCurrency,
    isValidEmail,
    generatePassword,
  };
