let chart = null
let expenses = []
let totalAmount = 0
let currentFilter = 'all'

const categorySelect = document.getElementById('category-select')
const amountInput = document.getElementById('amount-input')
const dateInput = document.getElementById('date-input')
const addBtn = document.getElementById('add-btn')
const expensesTableBody = document.getElementById('expense-table-body')
const totalAmountCell = document.getElementById('total-amount')

const filterAllBtn = document.getElementById('filter-all')
const filterIncomeBtn = document.getElementById('filter-income')
const filterExpenseBtn = document.getElementById('filter-expense')

function renderTable () {
  expensesTableBody.innerHTML = ''
  totalAmount = 0

  const filteredExpenses = expenses.filter((exp) => {
    if (currentFilter === 'income') return exp.amount > 0
    if (currentFilter === 'expense') return exp.amount < 0
    return true
  })

  for (const expense of filteredExpenses) {
    const newRow = expensesTableBody.insertRow()
    const categoryCell = newRow.insertCell()
    const amountCell = newRow.insertCell()
    const dateCell = newRow.insertCell()
    const deleteCell = newRow.insertCell()

    categoryCell.textContent = expense.category
    amountCell.textContent = `${expense.amount > 0 ? '+' : '-'}$${Math.abs(
      expense.amount
    ).toFixed(2)}`
    amountCell.style.color = expense.amount >= 0 ? 'green' : 'red'
    dateCell.textContent = expense.date

    const deleteBtn = document.createElement('button')
    deleteBtn.textContent = 'Delete'
    deleteBtn.classList.add('delete-btn')
    deleteBtn.addEventListener('click', () => {
      expenses = expenses.filter((e) => e !== expense)
      renderTable()
      renderChart()
    })

    deleteCell.appendChild(deleteBtn)
    totalAmount += expense.amount
  }

  totalAmountCell.textContent = `$${totalAmount.toFixed(2)}`
}

function renderChart () {
  const categories = {}
  for (const exp of expenses) {
    if (
      currentFilter !== 'all' &&
      ((currentFilter === 'income' && exp.amount < 0) ||
        (currentFilter === 'expense' && exp.amount > 0))
    ) {
      continue
    }
    categories[exp.category] = (categories[exp.category] || 0) + exp.amount
  }

  const ctx = document.getElementById('expense-chart').getContext('2d')
  if (chart) chart.destroy()
  chart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(categories),
      datasets: [
        {
          label: 'Amount',
          data: Object.values(categories),
          backgroundColor: Object.values(categories).map((val) =>
            val >= 0 ? 'green' : 'red'
          )
        }
      ]
    },
    options: {
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  })
}

addBtn.addEventListener('click', () => {
  const category = categorySelect.value
  const amount = parseFloat(amountInput.value)
  const date = dateInput.value

  if (!category || isNaN(amount) || !date) {
    alert('Please fill out all fields with valid values.')
    return
  }

  expenses.push({ category, amount, date })
  categorySelect.value = ''
  amountInput.value = ''
  dateInput.value = ''

  renderTable()
  renderChart()
})

// Filter buttons
filterAllBtn.addEventListener('click', () => {
  currentFilter = 'all'
  renderTable()
  renderChart()
})
filterIncomeBtn.addEventListener('click', () => {
  currentFilter = 'income'
  renderTable()
  renderChart()
})
filterExpenseBtn.addEventListener('click', () => {
  currentFilter = 'expense'
  renderTable()
  renderChart()
})
