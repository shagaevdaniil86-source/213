"use strict";

async function runAllTests() {
  const output = document.getElementById("testResults");
  output.replaceChildren();
  let passed = 0,
    failed = 0;
  const assert = (condition, message = "Условие не выполнено") => {
    if (!condition) throw new Error(message);
  };
  const equal = (actual, expected) =>
    assert(
      JSON.stringify(actual) === JSON.stringify(expected),
      `Ожидалось ${JSON.stringify(expected)}, получено ${JSON.stringify(actual)}`,
    );
  const throws = (fn) => {
    let caught = false;
    try {
      fn();
    } catch {
      caught = true;
    }
    assert(caught, "Ожидалась ошибка");
  };
  const rejects = async (fn) => {
    let caught = false;
    try {
      await fn();
    } catch {
      caught = true;
    }
    assert(caught, "Ожидался reject");
  };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  async function test(name, fn) {
    const p = document.createElement("p");
    try {
      await fn();
      passed++;
      p.className = "test-success";
      p.textContent = "✓ " + name;
    } catch (error) {
      failed++;
      p.className = "test-failure";
      p.textContent = "✗ " + name + ": " + error.message;
    }
    output.append(p);
  }

  await test("Простые числа и крайние случаи", () => {
    for (const n of [2, 3, 7, 97]) equal(isPrime(n), true);
    for (const n of [-7, 0, 1, 4, 9, NaN, 2.5]) equal(isPrime(n), false);
  });
  await test("Факториал и ограничения точности", () => {
    equal(factorial(0), 1);
    equal(factorial(5), 120);
    throws(() => factorial(-1));
    throws(() => factorial(19));
  });
  await test("Фибоначчи: 0, 1 и 6 элементов", () => {
    equal(fibonacci(0), []);
    equal(fibonacci(1), [0]);
    equal(fibonacci(6), [0, 1, 1, 2, 3, 5]);
    throws(() => fibonacci(-1));
  });
  await test("НОД: знаки и нули", () => {
    equal(gcd(54, 24), 6);
    equal(gcd(-54, 24), 6);
    equal(gcd(0, 9), 9);
    equal(gcd(0, 0), 0);
    throws(() => gcd(1.5, 2));
  });
  await test("Палиндромы с пробелами, регистром и Unicode", () => {
    equal(isPalindrome("А роза упала на лапу Азора"), true);
    equal(isPalindrome(""), true);
    equal(isPalindrome("город"), false);
  });
  await test("Русские и английские гласные", () => {
    equal(countVowels("JavaScript"), 3);
    equal(countVowels("АЕЁИОУЫЭЮЯ"), 10);
    equal(countVowels("rhythm"), 0);
  });
  await test("Разворот строки без встроенной reverse", () => {
    equal(reverseString("hello"), "olleh");
    equal(reverseString("а🚲б"), "б🚲а");
    equal(reverseString(""), "");
  });
  await test("Самое длинное слово и пустое предложение", () => {
    equal(findLongestWord("Самое длинное слово в предложении"), "предложении");
    equal(findLongestWord("!!!"), "");
    equal(findLongestWord("кот пёс"), "кот");
  });
  await test("Максимум, отрицательные и пустой массив", () => {
    equal(findMax([3, 7, 2, 9, 1]), 9);
    equal(findMax([-5, -2]), -2);
    assert(findMax([]) === undefined);
    throws(() => findMax([NaN]));
  });
  await test("Дубликаты и сохранение порядка", () => {
    equal(removeDuplicates([1, 2, 2, 3, 4, 4, 5]), [1, 2, 3, 4, 5]);
    equal(removeDuplicates([]), []);
    equal(removeDuplicates([1, "1", 1]), [1, "1"]);
  });
  await test("Пузырьковая сортировка не меняет оригинал", () => {
    const input = [3, -1, 3, 0];
    equal(bubbleSort(input), [-1, 0, 3, 3]);
    equal(input, [3, -1, 3, 0]);
    equal(bubbleSort([]), []);
  });
  await test("Бинарный поиск: найдено и отсутствует", () => {
    equal(binarySearch([1, 3, 5, 7, 9], 5), 2);
    equal(binarySearch([], 1), -1);
    equal(binarySearch([1, 3], 2), -1);
  });
  await test("Формат суммы", () => {
    equal(formatCurrency(1234.56), "1 234.56 ₽");
    equal(formatCurrency(-1000), "-1 000.00 ₽");
    equal(formatCurrency(0, "USD"), "0.00 USD");
    throws(() => formatCurrency(Infinity));
  });
  await test("Email: допустимые и недопустимые", () => {
    equal(isValidEmail("test@example.com"), true);
    equal(isValidEmail("a+b@sub.example.org"), true);
    for (const s of ["a@", "bad", "a b@c.org", "@a.com"])
      equal(isValidEmail(s), false);
  });
  await test("Пароль: длина и все четыре категории", () => {
    for (const length of [4, 8, 32])
      for (let i = 0; i < 10; i++) {
        const p = generatePassword(length);
        equal(p.length, length);
        assert(
          /[a-z]/.test(p) &&
            /[A-Z]/.test(p) &&
            /\d/.test(p) &&
            /[!@#$%&*?]/.test(p),
        );
      }
    throws(() => generatePassword(3));
  });

  const summary = document.createElement("p");
  summary.id = "test-summary";
  summary.textContent = `Пройдено: ${passed}; ошибок: ${failed}`;
  output.prepend(summary);
  return { passed, failed };
}
document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("run-tests");
  button.onclick = async () => {
    button.disabled = true;
    try {
      await runAllTests();
    } finally {
      button.disabled = false;
    }
  };
});
