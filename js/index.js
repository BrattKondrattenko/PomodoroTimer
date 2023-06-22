const getLeadingZeroFormat = (number) => {
  if (number >= 10) return number

  return `0${number}`
}

const initTimer = () => {
  const selectors = {
    root: '[data-js-timer]',
    typeButton: '[data-js-timer-type-button]',
    minutes: '[data-js-timer-minutes]',
    seconds: '[data-js-timer-seconds]',
    startButton: '[data-js-timer-start-button]',
    pauseButton: '[data-js-timer-pause-button]',
    resetButton: '[data-js-timer-reset-button]',

    pomodoroTypeInput: '[data-js-timer-pomodoro-type-input]',
    shortBreakTypeInput: '[data-js-timer-short-break-type-input]',
    longBreakTypeInput: '[data-js-timer-long-break-type-input]',

    pomodoroTypeLabel: '[data-js-timer-pomodoro-type-label]',
    shortBreakTypeLabel: '[data-js-timer-short-break-type-label]',
    longBreakTypeLabel: '[data-js-timer-long-break-type-label]',

    todosList: '[data-js-timer-todos-list]',
    todosItem: '[data-js-timer-todos-item]',
    todosItemInput: '[data-js-timer-todos-item-input]',
    todosItemRemoveButton: '[data-js-timer-todos-item-remove-button]',
    todosForm: '[data-js-timer-todos-form]',
    todosTitleInput: '[data-js-timer-todos-title-input]',
    todosCountInput: '[data-js-timer-todos-count-input]',

    todosItemCurrentCount: '[data-js-timer-todos-item-current-count]',
  }

  const stateClasses = {
    isActive: 'is-active',
  }

  const initialState = {
    minutes: 0,
    seconds: 0,
    isStart: false,
    todos: [],
  }

  let state = {
    ...initialState,
  }

  const rootElement = document.querySelector(selectors.root)

  const typeButtonElements = rootElement.querySelectorAll(selectors.typeButton)
  const pomodoroTypeLabelElement = rootElement.querySelector(selectors.pomodoroTypeLabel)
  const shortBreakTypeLabelElement = rootElement.querySelector(selectors.shortBreakTypeLabel)
  const longBreakTypeLabelElement = rootElement.querySelector(selectors.longBreakTypeLabel)

  
  const typePomodoroButtonElement = typeButtonElements.item(0)
  const typeShortBreakButtonElement = typeButtonElements.item(1)
  const typeLongBreakButtonElement = typeButtonElements.item(2)
  
  const minutesElement = rootElement.querySelector(selectors.minutes)
  const secondsElement = rootElement.querySelector(selectors.seconds)

  const startButtonElement = rootElement.querySelector(selectors.startButton)
  const pauseButtonElement = rootElement.querySelector(selectors.pauseButton)
  const resetButtonElement = rootElement.querySelector(selectors.resetButton)

  const pomodoroTypeInputElement = rootElement.querySelector(selectors.pomodoroTypeInput)
  const shortBreakTypeInputElement = rootElement.querySelector(selectors.shortBreakTypeInput)
  const longBreakTypeInputElement = rootElement.querySelector(selectors.longBreakTypeInput)

  const todosListElement = rootElement.querySelector(selectors.todosList)
  const todosFormElement = rootElement.querySelector(selectors.todosForm)
  const todosTitleInputElement = rootElement.querySelector(selectors.todosTitleInput)
  const todosCountInputElement = rootElement.querySelector(selectors.todosCountInput)

  let timer = null

  const render = () => {
    const { minutes, seconds } = state

    minutesElement.textContent = getLeadingZeroFormat(minutes)
    secondsElement.textContent = getLeadingZeroFormat(seconds)
  }

  const resetState = () => {
    state = { ...initialState }
  }

  const stateUpdate = (value) => {
    state.minutes = value
    state.seconds = 0
    state.isStart = false
  }

  const manageActiveTask = () => {
    if (typeShortBreakButtonElement.classList.contains(stateClasses.isActive)
    || typeLongBreakButtonElement.classList.contains(stateClasses.isActive)) return
    state.todos = state.todos.map((todo) => {
      if (todo.isActive) {
        return {
          ...todo,
          currentCount: todo.currentCount + 1
        }
      }

      return todo
    })

    renderTodos()
  }

  const switchModes = () => {
    if (typePomodoroButtonElement.classList.contains(stateClasses.isActive)) {
      const newMinutes = parseInt(typeShortBreakButtonElement.getAttribute('data-js-timer-type-button'))

      stateUpdate(newMinutes)
      changeActiveModeClasses(1,0,2)
      render() 

    } else if (typeShortBreakButtonElement.classList.contains(stateClasses.isActive)) {
      const newMinutes = parseInt(typePomodoroButtonElement.getAttribute('data-js-timer-type-button'))

      stateUpdate(newMinutes)
      changeActiveModeClasses(0,1,2)
      console.debug(state)
      render()

    } else if (typeLongBreakButtonElement.classList.contains(stateClasses.isActive)) {
      const newMinutes = parseInt(typePomodoroButtonElement.getAttribute('data-js-timer-type-button'))

      stateUpdate(newMinutes)
      changeActiveModeClasses(0,2,1)
      console.debug(state)
      render() 
    }
  }

  const decrease = () => {
    const { minutes, seconds } = state

    const isEnd = minutes === 0 && seconds === 0
    if (isEnd) {
      pause()
      manageActiveTask()
      switchModes()
      return
    }

    if (seconds > 0) {
      state.seconds -= 1
      return
    }

    state.minutes -= 1
    state.seconds = 59
  }
  const start = () => {
    if (state.isStart) {
      return
    }

    timer = setInterval(() => {
      render()
      decrease()
    }, 1000)

    state.isStart = true
    startButtonElement.classList.add(stateClasses.isActive)
    pauseButtonElement.classList.remove(stateClasses.isActive)
  }

  const pause = () => {
    if (!state.isStart) {
      return
    }

    state.isStart = false
    startButtonElement.classList.remove(stateClasses.isActive)
    pauseButtonElement.classList.add(stateClasses.isActive)
    clearInterval(timer)
    render()  
  }

  const reset = () => {
    clearInterval(timer)
    resetState()
    render()
    resetTypeButtons()
    typePomodoroButtonElement.classList.add(stateClasses.isActive)
    startButtonElement.classList.remove(stateClasses.isActive)
    pauseButtonElement.classList.remove(stateClasses.isActive) 
    pomodoroTypeInputElement.value = ''
  }

  const addTodoItem = (title, count) => {
    const oldTodos = state.todos.map((todo) => ({
      ...todo,
      isActive: false,
    }))

    state.todos = [...oldTodos, {
      title, id: Math.random(),
      currentCount: 0,
      count,
      isActive: true,
    }]
  }

  const renderTodos = () => {
    const todoItemsMarkup = state.todos
      .map(({ title, id, count, currentCount, isActive }) => {
        let className = 'timer__todos-item'
        if (isActive) {
          className += ` ${stateClasses.isActive}`
        }

        return `
        <li class="${className}" id="${id}" data-js-timer-todos-item>
          <input
            class="timer__todos-item-input" 
            value="${title}" 
            readonly
            data-js-timer-todos-item-input
          />
          <span><span data-js-timer-todos-item-current-count>${currentCount}</span> / ${count}</span>
          <button
            class="timer__todos-item-remove-button"
            type="button"
            data-js-timer-todos-item-remove-button
          >
            X
          </button>
        </li>
        `
      })
      .join('')

    todosListElement.innerHTML = todoItemsMarkup
  }

  const onStartButtonClick = () => {
    start()
  }

  const onPauseButtonClick = () => {
    pause()
  }

  const onResetButtonClick = () => {
    reset()
  }

  const resetTypeButtons = () => {
    typeButtonElements.forEach((typeButtonElement) => {
      typeButtonElement.classList.remove(stateClasses.isActive)
    })
  }

  const changeActiveModeClasses = (on, off, off2) => {
    typeButtonElements.item(on).classList.add(stateClasses.isActive)
    typeButtonElements.item(off).classList.remove(stateClasses.isActive)
    typeButtonElements.item(off2).classList.remove(stateClasses.isActive)
  }

  const onTypeButtonClick = (event) => {
    const typeButtonElement = event.target
    const newMinutes = parseInt(typeButtonElement.getAttribute('data-js-timer-type-button'))

    state.minutes = newMinutes
    state.seconds = 0
    state.isStart = false
    startButtonElement.classList.remove(stateClasses.isActive)

    clearInterval(timer)
    render()
    resetTypeButtons()
    typeButtonElement.classList.add(stateClasses.isActive)
  }

  const onPomodoroTypeInputChange = (event) => {
    const clearValue = event.target.value.trim()
    if (!clearValue) return

    const value = parseInt(clearValue)

    stateUpdate(value)
    startButtonElement.classList.remove(stateClasses.isActive)

    pomodoroTypeLabelElement.textContent = value
    pomodoroTypeLabelElement
      .closest(selectors.typeButton)
      .setAttribute('data-js-timer-type-button', value)

    changeActiveModeClasses(0, 1, 2)
    clearInterval(timer)
    render()
    
  }

  const onShortBreakTypeInputChange = (event) => {
    const clearValue = event.target.value.trim()
    if (!clearValue) return

    const value = parseInt(clearValue)

    stateUpdate(value)
    startButtonElement.classList.remove(stateClasses.isActive)

    shortBreakTypeLabelElement.textContent = value
    shortBreakTypeLabelElement
      .closest(selectors.typeButton)
      .setAttribute('data-js-timer-type-button', value)

    changeActiveModeClasses(1, 0, 2)
    clearInterval(timer)
    render()
  }

  const onLongBreakTypeInputChange = (event) => {
    const clearValue = event.target.value.trim()
    if (!clearValue) return

    const value = parseInt(clearValue)

    stateUpdate(value)
    startButtonElement.classList.remove(stateClasses.isActive)

    longBreakTypeLabelElement.textContent = value
    longBreakTypeLabelElement
      .closest(selectors.typeButton)
      .setAttribute('data-js-timer-type-button', value)

    changeActiveModeClasses(2, 0, 1)
    clearInterval(timer)
    render()
  }

  const onTodosFormSubmit = (event) => {
    event.preventDefault()

    const todoTitle = todosTitleInputElement.value.trim()
    if (!todoTitle) return

    const count = todosCountInputElement.value
    if (count < 1) return

    todosTitleInputElement.value = ''
    todosCountInputElement.value = ''
    addTodoItem(todoTitle, count)
    renderTodos()
  }

  const onTodosItemClick = (event) => {
    const todosItemElements = [...todosListElement.children]

    todosItemElements.forEach((todosItemElement, index) => {
      const isActive = todosItemElement === event.target

      todosItemElement.classList.toggle(stateClasses.isActive, isActive)
      state.todos[index].isActive = isActive
    })
  }

  const onTodosItemRemoveButtonClick = (event) => {
    const todosItem = event.target.closest(selectors.todosItem)
    const id = parseFloat(todosItem.id)

    state.todos = state.todos.filter((todo) => todo.id !== id)
    renderTodos()
  }

  const onTodosItemInputClick = (event) => {
    event.target.readOnly = false
  }

  const onTodosItemInputChange = (event) => {
    const todosItem = event.target.closest(selectors.todosItem)
    const id = parseFloat(todosItem.id)

    state.todos = state.todos.map((todo) => {
      if (todo.id === id) {
        return {
          ...todo,
          title: event.target.value.trim()
        }
      }

      return todo
    })
  }

  const onDocumentClick = (event) => {
    if (event.target.matches(selectors.todosItem)) {
      onTodosItemClick(event)
    }

    if (event.target.matches(selectors.todosItemRemoveButton)) {
      onTodosItemRemoveButtonClick(event)
    }

    if (event.target.matches(selectors.todosItemInput)) {
      onTodosItemInputClick(event)
    }
  }

  const onDocumentInput = (event) => {
    if (event.target.matches(selectors.todosItemInput)) {
      onTodosItemInputChange(event)
    }
  }

  startButtonElement.addEventListener('click', onStartButtonClick)
  pauseButtonElement.addEventListener('click', onPauseButtonClick)
  resetButtonElement.addEventListener('click', onResetButtonClick)
  typeButtonElements.forEach((typeButtonElement) => {
    typeButtonElement.addEventListener('click', onTypeButtonClick)
  })
  pomodoroTypeInputElement.addEventListener('input', onPomodoroTypeInputChange)
  shortBreakTypeInputElement.addEventListener('input', onShortBreakTypeInputChange)
  longBreakTypeInputElement.addEventListener('input', onLongBreakTypeInputChange)
  todosFormElement.addEventListener('submit', onTodosFormSubmit)
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('input', onDocumentInput)
}

document.addEventListener('DOMContentLoaded', () => {
  initTimer()
})

