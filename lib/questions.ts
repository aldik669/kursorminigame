import type { Question } from "@/types";

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    title: "Что тебе было бы интереснее создать?",
    options: [
      { id: "q1a", label: "Персонажа, который двигается и говорит", profile: "visual" },
      { id: "q1b", label: "Игру с уровнями и очками", profile: "game" },
      { id: "q1c", label: "Сайт с кнопками и картинками", profile: "web" },
      { id: "q1d", label: "Программу, которая решает задачу", profile: "logic" },
      { id: "q1e", label: "Умного бота", profile: "ai" },
      { id: "q1f", label: "Квест, где нужно искать ошибки", profile: "cyber" }
    ]
  },
  {
    id: "q2",
    title: "Что тебе больше нравится делать?",
    options: [
      { id: "q2a", label: "Оживлять объекты на экране", profile: "visual" },
      { id: "q2b", label: "Придумывать правила игры", profile: "game" },
      { id: "q2c", label: "Делать красивые страницы", profile: "web" },
      { id: "q2d", label: "Разбирать задачу по шагам", profile: "logic" },
      { id: "q2e", label: "Искать закономерности", profile: "ai" },
      { id: "q2f", label: "Находить баги и странности", profile: "cyber" }
    ]
  },
  {
    id: "q3",
    title: "Какой проект ты бы показал друзьям?",
    options: [
      { id: "q3a", label: "Интерактивный мультик", profile: "visual" },
      { id: "q3b", label: "Мини-игру", profile: "game" },
      { id: "q3c", label: "Свой сайт", profile: "web" },
      { id: "q3d", label: "Программу на Python", profile: "logic" },
      { id: "q3e", label: "AI-бота", profile: "ai" },
      { id: "q3f", label: "Игру с поиском ошибок", profile: "cyber" }
    ]
  },
  {
    id: "q4",
    title: "Что тебе кажется самым крутым?",
    options: [
      { id: "q4a", label: "Когда персонаж оживает от моих команд", profile: "visual" },
      { id: "q4b", label: "Когда в мою игру можно играть", profile: "game" },
      { id: "q4c", label: "Когда сайт выглядит как настоящий", profile: "web" },
      { id: "q4d", label: "Когда код правильно решает задачу", profile: "logic" },
      { id: "q4e", label: "Когда компьютер сам делает вывод", profile: "ai" },
      {
        id: "q4f",
        label: "Когда я нахожу ошибку, которую другие не заметили",
        profile: "cyber"
      }
    ]
  },
  {
    id: "q5",
    title: "Что бы ты улучшил в проекте?",
    options: [
      { id: "q5a", label: "Добавил бы анимацию", profile: "visual" },
      { id: "q5b", label: "Добавил бы новый уровень", profile: "game" },
      { id: "q5c", label: "Сделал бы удобные кнопки", profile: "web" },
      { id: "q5d", label: "Улучшил бы логику работы", profile: "logic" },
      { id: "q5e", label: "Добавил бы подсчет результатов", profile: "ai" },
      { id: "q5f", label: "Проверил бы ошибки", profile: "cyber" }
    ]
  },
  {
    id: "q6",
    title: "Что тебе легче представить?",
    options: [
      { id: "q6a", label: "Как двигается герой", profile: "visual" },
      { id: "q6b", label: "Как игрок проходит уровень", profile: "game" },
      { id: "q6c", label: "Как человек нажимает кнопки на сайте", profile: "web" },
      { id: "q6d", label: "Как задача решается по шагам", profile: "logic" },
      { id: "q6e", label: "Как данные превращаются в ответ", profile: "ai" },
      { id: "q6f", label: "Где может быть слабое место", profile: "cyber" }
    ]
  },
  {
    id: "q7",
    title: "Если проект сломался, что ты сделаешь?",
    options: [
      { id: "q7a", label: "Посмотрю, как ведут себя объекты", profile: "visual" },
      { id: "q7b", label: "Проверю правила игры", profile: "game" },
      { id: "q7c", label: "Проверю кнопки и страницы", profile: "web" },
      { id: "q7d", label: "Разберу шаги программы", profile: "logic" },
      { id: "q7e", label: "Сравню данные до и после", profile: "ai" },
      { id: "q7f", label: "Найду точное место ошибки", profile: "cyber" }
    ]
  },
  {
    id: "q8",
    title: "Какой урок тебе был бы интереснее?",
    options: [
      { id: "q8a", label: "Создать анимацию", profile: "visual" },
      { id: "q8b", label: "Создать игру", profile: "game" },
      { id: "q8c", label: "Создать сайт", profile: "web" },
      { id: "q8d", label: "Написать программу", profile: "logic" },
      { id: "q8e", label: "Создать умного бота", profile: "ai" },
      { id: "q8f", label: "Научиться искать баги", profile: "cyber" }
    ]
  },
  {
    id: "q9",
    title: "Что дает тебе чувство победы?",
    options: [
      { id: "q9a", label: "Когда персонаж красиво двигается", profile: "visual" },
      { id: "q9b", label: "Когда игрок проходит мой уровень", profile: "game" },
      { id: "q9c", label: "Когда сайт удобный и понятный", profile: "web" },
      { id: "q9d", label: "Когда программа работает правильно", profile: "logic" },
      { id: "q9e", label: "Когда я нашел закономерность", profile: "ai" },
      { id: "q9f", label: "Когда я нашел и исправил ошибку", profile: "cyber" }
    ]
  },
  {
    id: "q10",
    title: "В команде ты бы выбрал роль:",
    options: [
      { id: "q10a", label: "Делать персонажей и движения", profile: "visual" },
      { id: "q10b", label: "Придумывать уровни и правила", profile: "game" },
      { id: "q10c", label: "Создавать страницы и кнопки", profile: "web" },
      { id: "q10d", label: "Писать главную логику", profile: "logic" },
      { id: "q10e", label: "Работать с данными и AI", profile: "ai" },
      { id: "q10f", label: "Проверять проект на ошибки", profile: "cyber" }
    ]
  },
  {
    id: "q11",
    title: "Какой финальный проект ты бы выбрал?",
    options: [
      { id: "q11a", label: "Интерактивная история", profile: "visual" },
      { id: "q11b", label: "Игра с уровнями", profile: "game" },
      { id: "q11c", label: "Сайт или веб-приложение", profile: "web" },
      { id: "q11d", label: "Программа на Python", profile: "logic" },
      { id: "q11e", label: "AI-помощник", profile: "ai" },
      { id: "q11f", label: "Кибер-квест", profile: "cyber" }
    ]
  },
  {
    id: "q12",
    title: "Кем ты бы хотел побыть на один день?",
    options: [
      { id: "q12a", label: "Создателем интерактивных мультиков", profile: "visual" },
      { id: "q12b", label: "Разработчиком игр", profile: "game" },
      { id: "q12c", label: "Создателем сайтов", profile: "web" },
      { id: "q12d", label: "Python-программистом", profile: "logic" },
      { id: "q12e", label: "Создателем AI-ботов", profile: "ai" },
      { id: "q12f", label: "Кибердетективом", profile: "cyber" }
    ]
  }
];

